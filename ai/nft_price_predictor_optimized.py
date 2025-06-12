
import requests
import pandas as pd
import numpy as np
import json
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

# Machine Learning imports
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler

class NFTPricePredictorOptimized:
    def __init__(self, api_key=None):
        self.api_key = api_key or "CG-1Tc5UJgmUByfTMibYyMMutVD"
        self.base_url = "https://api.coingecko.com/api/v3"
        self.headers = {"x-cg-demo-api-key": self.api_key} if self.api_key else {}
        
        # Supported assets
        self.nft_collections = {
            'cryptopunks': 'cryptopunks',
            'azuki': 'azuki', 
            'bored-ape-yacht-club': 'bored-ape-yacht-club'
        }
        
        # Models
        self.model = None
        self.scaler = StandardScaler()
        self.is_trained = False
        
    def create_mock_data(self, collection_id, days=90):
        """Create realistic mock data for demo purposes"""
        print(f"Creating mock data for {collection_id}...")
        
        dates = pd.date_range(start=datetime.now() - timedelta(days=days), 
                            end=datetime.now(), freq='D')
        
        # Different price ranges for different collections
        price_ranges = {
            'cryptopunks': (70, 90),
            'azuki': (10, 15),
            'bored-ape-yacht-club': (15, 25)
        }
        
        min_price, max_price = price_ranges.get(collection_id, (10, 50))
        
        # Create trending data with some volatility
        base_prices = np.linspace(min_price, max_price, len(dates))
        volatility = np.random.normal(0, max_price * 0.1, len(dates))
        floor_prices = base_prices + volatility
        floor_prices = np.maximum(floor_prices, min_price * 0.5)  # Prevent negative prices
        
        volumes = np.random.uniform(1000, 10000, len(dates))
        market_caps = floor_prices * np.random.uniform(8000, 12000, len(dates))
        
        df = pd.DataFrame({
            'date': dates,
            'floor_price': floor_prices,
            'volume': volumes,
            'market_cap': market_caps,
            'collection_id': collection_id
        })
        
        return df
    
    def fetch_nft_data(self, collection_id, days=90):
        """Fetch NFT market data from CoinGecko with fallback to mock data"""
        try:
            print(f"Attempting to fetch real data for {collection_id}...")
            url = f"{self.base_url}/nfts/{collection_id}/market_chart"
            params = {
                'vs_currency': 'usd',
                'days': days
            }
            
            response = requests.get(url, headers=self.headers, params=params, timeout=10)
            
            if response.status_code == 401:
                print("API key unauthorized, using mock data...")
                return self.create_mock_data(collection_id, days)
            
            response.raise_for_status()
            data = response.json()
            
            # Convert to DataFrame
            df_list = []
            
            if 'floor_price_usd' in data and data['floor_price_usd']:
                floor_prices = pd.DataFrame(data['floor_price_usd'], columns=['timestamp', 'floor_price'])
                floor_prices['date'] = pd.to_datetime(floor_prices['timestamp'], unit='ms')
                df_list.append(floor_prices[['date', 'floor_price']])
            
            if 'volume_usd' in data and data['volume_usd']:
                volumes = pd.DataFrame(data['volume_usd'], columns=['timestamp', 'volume'])
                volumes['date'] = pd.to_datetime(volumes['timestamp'], unit='ms')
                if df_list:
                    df_list[0] = df_list[0].merge(volumes[['date', 'volume']], on='date', how='outer')
                else:
                    df_list.append(volumes[['date', 'volume']])
            
            if df_list:
                df = df_list[0].sort_values('date').reset_index(drop=True)
                df['collection_id'] = collection_id
                print("Successfully fetched real data!")
                return df
            else:
                print("No valid data received, using mock data...")
                return self.create_mock_data(collection_id, days)
            
        except Exception as e:
            print(f"Error fetching data for {collection_id}: {e}")
            print("Using mock data...")
            return self.create_mock_data(collection_id, days)
    
    def preprocess_data(self, df):
        """Preprocess and feature engineering"""
        df = df.copy()
        df = df.sort_values('date').reset_index(drop=True)
        
        # Handle missing values
        df = df.fillna(method='ffill').fillna(method='bfill')
        
        # Feature engineering
        df['floor_price_pct_change'] = df['floor_price'].pct_change()
        df['floor_price_ma_7'] = df['floor_price'].rolling(window=7, min_periods=1).mean()
        df['floor_price_ma_30'] = df['floor_price'].rolling(window=30, min_periods=1).mean()
        df['floor_price_volatility'] = df['floor_price'].rolling(window=7, min_periods=1).std()
        
        # Volume features
        if 'volume' in df.columns:
            df['volume_pct_change'] = df['volume'].pct_change()
            df['volume_ma_7'] = df['volume'].rolling(window=7, min_periods=1).mean()
            df['volume_ratio'] = df['volume'] / df['volume_ma_7']
        
        # Time features
        df['day_of_week'] = df['date'].dt.dayofweek
        df['month'] = df['date'].dt.month
        
        # Lag features
        for lag in [1, 3, 7]:
            df[f'floor_price_lag_{lag}'] = df['floor_price'].shift(lag)
        
        # Fill NaN values
        df = df.fillna(method='bfill').fillna(0)
        
        return df
    
    def prepare_features(self, df):
        """Prepare features for modeling"""
        feature_columns = [
            'floor_price_pct_change', 'floor_price_ma_7', 'floor_price_ma_30',
            'floor_price_volatility', 'day_of_week', 'month'
        ]
        
        # Add lag features
        for lag in [1, 3, 7]:
            feature_columns.append(f'floor_price_lag_{lag}')
        
        # Add volume features if available
        if 'volume' in df.columns:
            feature_columns.extend([
                'volume_pct_change', 'volume_ma_7', 'volume_ratio'
            ])
        
        # Select only existing columns
        available_features = [col for col in feature_columns if col in df.columns]
        
        X = df[available_features].fillna(0)
        y = df['floor_price']
        
        return X, y, available_features
    
    def train_model(self, X, y):
        """Train a single optimized model"""
        print("Training Random Forest model...")
        
        # Use a simpler, faster model
        self.model = RandomForestRegressor(
            n_estimators=50,  # Reduced from 100
            max_depth=8,      # Reduced from 10
            random_state=42,
            n_jobs=-1
        )
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train model
        self.model.fit(X_scaled, y)
        self.is_trained = True
        print("Model trained successfully!")
    
    def predict(self, X):
        """Make predictions"""
        if not self.is_trained:
            raise ValueError("Model not trained yet!")
        
        X_scaled = self.scaler.transform(X)
        return self.model.predict(X_scaled)
    
    def evaluate_model(self, X_test, y_test):
        """Evaluate model performance"""
        y_pred = self.predict(X_test)
        
        results = {
            'mae': mean_absolute_error(y_test, y_pred),
            'rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
            'r2': r2_score(y_test, y_pred)
        }
        
        return results, y_pred
    
    def predict_future_prices(self, df, days_ahead=7):
        """Predict future prices"""
        if not self.is_trained:
            raise ValueError("Model not trained yet!")
        
        future_predictions = []
        last_row = df.iloc[-1:].copy()
        
        for day in range(days_ahead):
            X_future, _, _ = self.prepare_features(last_row)
            pred = self.predict(X_future)
            future_predictions.append(pred[0])
            
            # Update last_row for next prediction
            last_row['floor_price'] = pred[0]
            last_row['date'] = last_row['date'] + timedelta(days=1)
        
        return future_predictions
    
    def save_results(self, collection_id, results, future_predictions):
        """Save results to JSON file"""
        output = {
            'collection_id': collection_id,
            'timestamp': datetime.now().isoformat(),
            'model_performance': results,
            'future_predictions': [
                {
                    'day': i + 1,
                    'predicted_price_usd': float(pred),
                    'predicted_price_dpsv': float(pred * 100)
                }
                for i, pred in enumerate(future_predictions)
            ]
        }
        
        filename = f"ai_results_{collection_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(filename, 'w') as f:
            json.dump(output, f, indent=2)
        
        print(f"Results saved to {filename}")
        return filename
    
    def run_pipeline(self, collection_id, days=90):
        """Run the complete prediction pipeline - optimized version"""
        print(f"Starting optimized prediction pipeline for {collection_id}...")
        start_time = datetime.now()
        
        try:
            # 1. Fetch data
            print("1. Fetching data...")
            df = self.fetch_nft_data(collection_id, days)
            
            # 2. Preprocess data
            print("2. Preprocessing data...")
            df_processed = self.preprocess_data(df)
            
            # 3. Prepare features
            print("3. Preparing features...")
            X, y, feature_names = self.prepare_features(df_processed)
            
            # 4. Split data (time-based)
            split_index = int(len(X) * 0.8)
            X_train, X_test = X[:split_index], X[split_index:]
            y_train, y_test = y[:split_index], y[split_index:]
            
            print(f"Training set size: {len(X_train)}")
            print(f"Test set size: {len(X_test)}")
            
            # 5. Train model
            print("4. Training model...")
            self.train_model(X_train, y_train)
            
            # 6. Evaluate model
            print("5. Evaluating model...")
            results, y_pred = self.evaluate_model(X_test, y_test)
            
            # 7. Display results
            print("\n=== MODEL PERFORMANCE ===")
            print(f"MAE: {results['mae']:.2f}")
            print(f"RMSE: {results['rmse']:.2f}")
            print(f"R²: {results['r2']:.3f}")
            
            # 8. Generate predictions for next 7 days
            print("\n6. Generating future predictions...")
            future_predictions = self.predict_future_prices(df_processed, days_ahead=7)
            
            print("\n=== FUTURE PRICE PREDICTIONS (Next 7 days) ===")
            for i, pred in enumerate(future_predictions, 1):
                print(f"Day +{i}: ${pred:.2f} USD ({pred*100:.2f} DPSV)")
            
            # 9. Save results
            self.save_results(collection_id, results, future_predictions)
            
            end_time = datetime.now()
            print(f"\nPipeline completed in {(end_time - start_time).total_seconds():.2f} seconds")
            
            return {
                'df': df_processed,
                'results': results,
                'predictions': y_pred,
                'future_predictions': future_predictions,
                'feature_names': feature_names,
                'execution_time': (end_time - start_time).total_seconds()
            }
            
        except Exception as e:
            print(f"Error in pipeline: {e}")
            return None

def main():
    """Main function - fast execution"""
    print("=== NFT PRICE PREDICTOR - OPTIMIZED VERSION ===")
    
    # Initialize predictor
    predictor = NFTPricePredictorOptimized()
    
    # Collections to analyze
    collections = ['cryptopunks', 'azuki', 'bored-ape-yacht-club']
    
    results_all = {}
    
    for collection in collections:
        print(f"\n{'='*50}")
        print(f"ANALYZING {collection.upper()}")
        print(f"{'='*50}")
        
        try:
            results = predictor.run_pipeline(collection_id=collection, days=90)
            if results:
                results_all[collection] = results
        except Exception as e:
            print(f"Error analyzing {collection}: {e}")
            continue
    
    print(f"\n{'='*50}")
    print("ANALYSIS COMPLETE!")
    print(f"Successfully analyzed {len(results_all)} collections")
    print(f"{'='*50}")
    
    return results_all

if __name__ == "__main__":
    results = main()
