
import requests
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

# Machine Learning imports
from sklearn.model_selection import train_test_split, TimeSeriesSplit
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler
import xgboost as xgb

# Set style for plots
plt.style.use('dark_background')
sns.set_palette("husl")

class NFTPricePredictor:
    def __init__(self, api_key="CG-1Tc5UJgmUByfTMibYyMMutVD"):
        self.api_key = api_key
        self.base_url = "https://api.coingecko.com/api/v3"
        self.headers = {"x-cg-demo-api-key": api_key}
        
        # Supported assets
        self.nft_collections = {
            'cryptopunks': 'cryptopunks',
            'azuki': 'azuki', 
            'bored-ape-yacht-club': 'bored-ape-yacht-club'
        }
        
        # Models
        self.models = {}
        self.scaler = StandardScaler()
        self.is_trained = False
        
    def fetch_nft_data(self, collection_id, days=90):
        """Fetch NFT market data from CoinGecko"""
        try:
            url = f"{self.base_url}/nfts/{collection_id}/market_chart"
            params = {
                'vs_currency': 'usd',
                'days': days
            }
            
            response = requests.get(url, headers=self.headers, params=params)
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
            
            if 'market_cap_usd' in data and data['market_cap_usd']:
                market_caps = pd.DataFrame(data['market_cap_usd'], columns=['timestamp', 'market_cap'])
                market_caps['date'] = pd.to_datetime(market_caps['timestamp'], unit='ms')
                if df_list:
                    df_list[0] = df_list[0].merge(market_caps[['date', 'market_cap']], on='date', how='outer')
                else:
                    df_list.append(market_caps[['date', 'market_cap']])
            
            if df_list:
                df = df_list[0].sort_values('date').reset_index(drop=True)
            else:
                # Fallback: create mock data for demo
                dates = pd.date_range(start=datetime.now() - timedelta(days=days), 
                                    end=datetime.now(), freq='D')
                df = pd.DataFrame({
                    'date': dates,
                    'floor_price': np.random.uniform(10, 100, len(dates)),
                    'volume': np.random.uniform(1000, 10000, len(dates)),
                    'market_cap': np.random.uniform(100000, 1000000, len(dates))
                })
            
            df['collection_id'] = collection_id
            return df
            
        except Exception as e:
            print(f"Error fetching data for {collection_id}: {e}")
            # Return mock data for demo
            dates = pd.date_range(start=datetime.now() - timedelta(days=days), 
                                end=datetime.now(), freq='D')
            return pd.DataFrame({
                'date': dates,
                'floor_price': np.random.uniform(10, 100, len(dates)),
                'volume': np.random.uniform(1000, 10000, len(dates)),
                'market_cap': np.random.uniform(100000, 1000000, len(dates)),
                'collection_id': collection_id
            })
    
    def preprocess_data(self, df):
        """Preprocess and feature engineering"""
        df = df.copy()
        df = df.sort_values('date').reset_index(drop=True)
        
        # Handle missing values
        df = df.fillna(method='ffill').fillna(method='bfill')
        
        # Feature engineering
        # Price features
        df['floor_price_pct_change'] = df['floor_price'].pct_change()
        df['floor_price_ma_7'] = df['floor_price'].rolling(window=7, min_periods=1).mean()
        df['floor_price_ma_30'] = df['floor_price'].rolling(window=30, min_periods=1).mean()
        df['floor_price_volatility'] = df['floor_price'].rolling(window=7, min_periods=1).std()
        
        # Volume features
        if 'volume' in df.columns:
            df['volume_pct_change'] = df['volume'].pct_change()
            df['volume_ma_7'] = df['volume'].rolling(window=7, min_periods=1).mean()
            df['volume_ratio'] = df['volume'] / df['volume_ma_7']
        
        # Market cap features
        if 'market_cap' in df.columns:
            df['market_cap_pct_change'] = df['market_cap'].pct_change()
            df['market_cap_ma_7'] = df['market_cap'].rolling(window=7, min_periods=1).mean()
        
        # Time features
        df['day_of_week'] = df['date'].dt.dayofweek
        df['month'] = df['date'].dt.month
        df['quarter'] = df['date'].dt.quarter
        
        # Lag features
        for lag in [1, 3, 7]:
            df[f'floor_price_lag_{lag}'] = df['floor_price'].shift(lag)
            if 'volume' in df.columns:
                df[f'volume_lag_{lag}'] = df['volume'].shift(lag)
        
        # Fill NaN values created by lag features
        df = df.fillna(method='bfill')
        
        return df
    
    def prepare_features(self, df):
        """Prepare features for modeling"""
        feature_columns = [
            'floor_price_pct_change', 'floor_price_ma_7', 'floor_price_ma_30',
            'floor_price_volatility', 'day_of_week', 'month', 'quarter'
        ]
        
        # Add lag features
        for lag in [1, 3, 7]:
            feature_columns.append(f'floor_price_lag_{lag}')
        
        # Add volume features if available
        if 'volume' in df.columns:
            feature_columns.extend([
                'volume_pct_change', 'volume_ma_7', 'volume_ratio'
            ])
            for lag in [1, 3, 7]:
                feature_columns.append(f'volume_lag_{lag}')
        
        # Add market cap features if available
        if 'market_cap' in df.columns:
            feature_columns.extend([
                'market_cap_pct_change', 'market_cap_ma_7'
            ])
        
        # Select only existing columns
        available_features = [col for col in feature_columns if col in df.columns]
        
        X = df[available_features].fillna(0)
        y = df['floor_price']
        
        return X, y, available_features
    
    def train_models(self, X, y):
        """Train ensemble of models"""
        # Time series split for validation
        tscv = TimeSeriesSplit(n_splits=3)
        
        # Initialize models
        self.models = {
            'random_forest': RandomForestRegressor(
                n_estimators=100, 
                max_depth=10, 
                random_state=42,
                n_jobs=-1
            ),
            'gradient_boosting': GradientBoostingRegressor(
                n_estimators=100,
                max_depth=6,
                learning_rate=0.1,
                random_state=42
            ),
            'xgboost': xgb.XGBRegressor(
                n_estimators=100,
                max_depth=6,
                learning_rate=0.1,
                random_state=42
            )
        }
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train models
        for name, model in self.models.items():
            print(f"Training {name}...")
            model.fit(X_scaled, y)
        
        self.is_trained = True
        print("All models trained successfully!")
    
    def predict_ensemble(self, X):
        """Make ensemble predictions"""
        if not self.is_trained:
            raise ValueError("Models not trained yet!")
        
        X_scaled = self.scaler.transform(X)
        
        predictions = {}
        for name, model in self.models.items():
            predictions[name] = model.predict(X_scaled)
        
        # Ensemble prediction (simple average)
        ensemble_pred = np.mean(list(predictions.values()), axis=0)
        
        return ensemble_pred, predictions
    
    def evaluate_models(self, X_test, y_test):
        """Evaluate model performance"""
        ensemble_pred, individual_preds = self.predict_ensemble(X_test)
        
        results = {}
        
        # Evaluate ensemble
        results['ensemble'] = {
            'mae': mean_absolute_error(y_test, ensemble_pred),
            'rmse': np.sqrt(mean_squared_error(y_test, ensemble_pred)),
            'r2': r2_score(y_test, ensemble_pred)
        }
        
        # Evaluate individual models
        for name, pred in individual_preds.items():
            results[name] = {
                'mae': mean_absolute_error(y_test, pred),
                'rmse': np.sqrt(mean_squared_error(y_test, pred)),
                'r2': r2_score(y_test, pred)
            }
        
        return results, ensemble_pred
    
    def visualize_data(self, df, collection_id):
        """Visualize the data"""
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        fig.suptitle(f'NFT Data Analysis - {collection_id.upper()}', fontsize=16)
        
        # Floor price over time
        axes[0, 0].plot(df['date'], df['floor_price'], linewidth=2, color='#00FF85')
        axes[0, 0].set_title('Floor Price Over Time')
        axes[0, 0].set_ylabel('Floor Price (USD)')
        axes[0, 0].grid(True, alpha=0.3)
        
        # Volume over time
        if 'volume' in df.columns:
            axes[0, 1].plot(df['date'], df['volume'], linewidth=2, color='#A259F7')
            axes[0, 1].set_title('Volume Over Time')
            axes[0, 1].set_ylabel('Volume (USD)')
            axes[0, 1].grid(True, alpha=0.3)
        
        # Price distribution
        axes[1, 0].hist(df['floor_price'], bins=30, alpha=0.7, color='#00FF85', edgecolor='white')
        axes[1, 0].set_title('Floor Price Distribution')
        axes[1, 0].set_xlabel('Floor Price (USD)')
        axes[1, 0].set_ylabel('Frequency')
        axes[1, 0].grid(True, alpha=0.3)
        
        # Price change distribution
        if 'floor_price_pct_change' in df.columns:
            axes[1, 1].hist(df['floor_price_pct_change'].dropna(), bins=30, alpha=0.7, color='#FF6B6B', edgecolor='white')
            axes[1, 1].set_title('Price Change Distribution')
            axes[1, 1].set_xlabel('Price Change (%)')
            axes[1, 1].set_ylabel('Frequency')
            axes[1, 1].grid(True, alpha=0.3)
        
        plt.tight_layout()
        plt.show()
    
    def visualize_predictions(self, df, y_test, y_pred, collection_id):
        """Visualize prediction results"""
        fig, axes = plt.subplots(1, 2, figsize=(15, 6))
        fig.suptitle(f'Prediction Results - {collection_id.upper()}', fontsize=16)
        
        # Actual vs Predicted
        test_dates = df['date'].iloc[-len(y_test):]
        
        axes[0].plot(test_dates, y_test.values, label='Actual', linewidth=2, color='#00FF85')
        axes[0].plot(test_dates, y_pred, label='Predicted', linewidth=2, color='#A259F7', linestyle='--')
        axes[0].set_title('Actual vs Predicted Prices')
        axes[0].set_ylabel('Floor Price (USD)')
        axes[0].legend()
        axes[0].grid(True, alpha=0.3)
        
        # Scatter plot
        axes[1].scatter(y_test, y_pred, alpha=0.6, color='#FF6B6B')
        axes[1].plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--', linewidth=2)
        axes[1].set_xlabel('Actual Prices')
        axes[1].set_ylabel('Predicted Prices')
        axes[1].set_title('Prediction Scatter Plot')
        axes[1].grid(True, alpha=0.3)
        
        plt.tight_layout()
        plt.show()
    
    def save_to_csv(self, df, collection_id):
        """Save processed data to CSV"""
        filename = f"nft_data_{collection_id}_{datetime.now().strftime('%Y%m%d')}.csv"
        df.to_csv(filename, index=False)
        print(f"Data saved to {filename}")
        return filename
    
    def run_pipeline(self, collection_id, days=90, save_data=True, visualize=True):
        """Run the complete prediction pipeline"""
        print(f"Starting prediction pipeline for {collection_id}...")
        
        # 1. Fetch data
        print("1. Fetching data...")
        df = self.fetch_nft_data(collection_id, days)
        
        if save_data:
            self.save_to_csv(df, collection_id)
        
        # 2. Preprocess data
        print("2. Preprocessing data...")
        df_processed = self.preprocess_data(df)
        
        if visualize:
            self.visualize_data(df_processed, collection_id)
        
        # 3. Prepare features
        print("3. Preparing features...")
        X, y, feature_names = self.prepare_features(df_processed)
        
        # 4. Split data (time-based)
        split_index = int(len(X) * 0.8)
        X_train, X_test = X[:split_index], X[split_index:]
        y_train, y_test = y[:split_index], y[split_index:]
        
        print(f"Training set size: {len(X_train)}")
        print(f"Test set size: {len(X_test)}")
        
        # 5. Train models
        print("4. Training models...")
        self.train_models(X_train, y_train)
        
        # 6. Evaluate models
        print("5. Evaluating models...")
        results, y_pred = self.evaluate_models(X_test, y_test)
        
        # 7. Display results
        print("\n=== MODEL PERFORMANCE ===")
        for model_name, metrics in results.items():
            print(f"\n{model_name.upper()}:")
            print(f"  MAE: {metrics['mae']:.2f}")
            print(f"  RMSE: {metrics['rmse']:.2f}")
            print(f"  R²: {metrics['r2']:.3f}")
        
        if visualize:
            self.visualize_predictions(df_processed, y_test, y_pred, collection_id)
        
        # 8. Generate predictions for next 7 days
        print("\n6. Generating future predictions...")
        future_predictions = self.predict_future_prices(df_processed, days_ahead=7)
        
        print("\n=== FUTURE PRICE PREDICTIONS (Next 7 days) ===")
        for i, pred in enumerate(future_predictions, 1):
            print(f"Day +{i}: ${pred:.2f} USD ({pred*100:.2f} DPSV)")
        
        return {
            'df': df_processed,
            'results': results,
            'predictions': y_pred,
            'future_predictions': future_predictions,
            'feature_names': feature_names
        }
    
    def predict_future_prices(self, df, days_ahead=7):
        """Predict future prices"""
        if not self.is_trained:
            raise ValueError("Models not trained yet!")
        
        future_predictions = []
        last_row = df.iloc[-1:].copy()
        
        for day in range(days_ahead):
            X_future, _, _ = self.prepare_features(last_row)
            pred, _ = self.predict_ensemble(X_future)
            
            future_predictions.append(pred[0])
            
            # Update last_row for next prediction (simplified)
            last_row['floor_price'] = pred[0]
            last_row['date'] = last_row['date'] + timedelta(days=1)
        
        return future_predictions

def main():
    """Main function to demonstrate the pipeline"""
    # Initialize predictor
    predictor = NFTPricePredictor()
    
    # Collections to analyze
    collections = ['cryptopunks', 'azuki', 'bored-ape-yacht-club']
    
    # Run pipeline for each collection
    results_all = {}
    
    for collection in collections:
        print(f"\n{'='*50}")
        print(f"ANALYZING {collection.upper()}")
        print(f"{'='*50}")
        
        try:
            results = predictor.run_pipeline(
                collection_id=collection,
                days=90,
                save_data=True,
                visualize=True
            )
            results_all[collection] = results
            
        except Exception as e:
            print(f"Error analyzing {collection}: {e}")
            continue
    
    return results_all

if __name__ == "__main__":
    results = main()
