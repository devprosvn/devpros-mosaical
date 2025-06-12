
import pandas as pd
import numpy as np
import json
import os
import glob
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

# Machine Learning imports
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler

class NFTPredictorFromTXT:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.is_trained = False
        self.dataset_path = "ai/datasets/"
        
    def load_txt_dataset(self, txt_file_path):
        """Đọc dataset từ file TXT"""
        print(f"Đang đọc dataset từ: {txt_file_path}")
        
        try:
            data = []
            
            with open(txt_file_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    # Skip comments và empty lines
                    if line.startswith('#') or not line:
                        continue
                    
                    # Parse data line: DATE|FLOOR_PRICE|VOLUME|MARKET_CAP
                    parts = line.split('|')
                    if len(parts) == 4:
                        date_str = parts[0]
                        floor_price = float(parts[1])
                        volume = float(parts[2])
                        market_cap = float(parts[3])
                        
                        data.append({
                            'date': pd.to_datetime(date_str),
                            'floor_price': floor_price,
                            'volume': volume,
                            'market_cap': market_cap
                        })
            
            df = pd.DataFrame(data)
            df = df.sort_values('date').reset_index(drop=True)
            
            print(f"✅ Đã đọc {len(df)} records từ {txt_file_path}")
            return df
            
        except Exception as e:
            print(f"❌ Lỗi khi đọc file {txt_file_path}: {e}")
            return None
    
    def get_latest_dataset(self, collection_id):
        """Lấy dataset mới nhất cho collection"""
        pattern = f"{self.dataset_path}nft_data_{collection_id}_*.txt"
        files = glob.glob(pattern)
        
        if not files:
            print(f"⚠️  Không tìm thấy dataset cho {collection_id}")
            return None
            
        # Sắp xếp theo thời gian và lấy file mới nhất
        latest_file = max(files, key=os.path.getctime)
        print(f"📁 Sử dụng dataset: {latest_file}")
        
        return self.load_txt_dataset(latest_file)
    
    def preprocess_data(self, df):
        """Xử lý và tạo features từ data"""
        df = df.copy()
        
        # Handle missing values
        df = df.fillna(method='ffill').fillna(method='bfill')
        
        # Feature engineering
        df['floor_price_pct_change'] = df['floor_price'].pct_change()
        df['floor_price_ma_7'] = df['floor_price'].rolling(window=7, min_periods=1).mean()
        df['floor_price_ma_30'] = df['floor_price'].rolling(window=30, min_periods=1).mean()
        df['floor_price_volatility'] = df['floor_price'].rolling(window=7, min_periods=1).std()
        
        # Volume features
        df['volume_pct_change'] = df['volume'].pct_change()
        df['volume_ma_7'] = df['volume'].rolling(window=7, min_periods=1).mean()
        df['volume_ratio'] = df['volume'] / df['volume_ma_7']
        
        # Market cap features
        df['market_cap_pct_change'] = df['market_cap'].pct_change()
        df['price_to_market_cap'] = df['floor_price'] / df['market_cap']
        
        # Time features
        df['day_of_week'] = df['date'].dt.dayofweek
        df['month'] = df['date'].dt.month
        df['day_of_month'] = df['date'].dt.day
        
        # Lag features
        for lag in [1, 3, 7]:
            df[f'floor_price_lag_{lag}'] = df['floor_price'].shift(lag)
            df[f'volume_lag_{lag}'] = df['volume'].shift(lag)
        
        # Fill NaN values
        df = df.fillna(method='bfill').fillna(0)
        
        return df
    
    def prepare_features(self, df):
        """Chuẩn bị features cho training"""
        feature_columns = [
            'floor_price_pct_change', 'floor_price_ma_7', 'floor_price_ma_30',
            'floor_price_volatility', 'volume_pct_change', 'volume_ma_7', 
            'volume_ratio', 'market_cap_pct_change', 'price_to_market_cap',
            'day_of_week', 'month', 'day_of_month'
        ]
        
        # Add lag features
        for lag in [1, 3, 7]:
            feature_columns.extend([
                f'floor_price_lag_{lag}',
                f'volume_lag_{lag}'
            ])
        
        # Select only existing columns
        available_features = [col for col in feature_columns if col in df.columns]
        
        X = df[available_features].fillna(0)
        y = df['floor_price']
        
        return X, y, available_features
    
    def train_model(self, X, y):
        """Train AI model"""
        print("🤖 Đang train AI model...")
        
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train model
        self.model.fit(X_scaled, y)
        self.is_trained = True
        print("✅ AI model đã được train thành công!")
    
    def predict(self, X):
        """Dự đoán giá"""
        if not self.is_trained:
            raise ValueError("Model chưa được train!")
        
        X_scaled = self.scaler.transform(X)
        return self.model.predict(X_scaled)
    
    def evaluate_model(self, X_test, y_test):
        """Đánh giá model"""
        y_pred = self.predict(X_test)
        
        results = {
            'mae': mean_absolute_error(y_test, y_pred),
            'rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
            'r2': r2_score(y_test, y_pred)
        }
        
        return results, y_pred
    
    def predict_future_prices(self, df, days_ahead=7):
        """Dự đoán giá tương lai"""
        if not self.is_trained:
            raise ValueError("Model chưa được train!")
        
        future_predictions = []
        last_row = df.iloc[-1:].copy()
        
        for day in range(days_ahead):
            X_future, _, _ = self.prepare_features(last_row)
            pred = self.predict(X_future)
            future_predictions.append(pred[0])
            
            # Update last_row for next prediction
            new_date = last_row['date'].iloc[0] + timedelta(days=1)
            last_row['date'] = new_date
            last_row['floor_price'] = pred[0]
        
        return future_predictions
    
    def save_results(self, collection_id, results, future_predictions):
        """Lưu kết quả dự đoán"""
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
        
        filename = f"ai_predictions_{collection_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(filename, 'w') as f:
            json.dump(output, f, indent=2)
        
        print(f"💾 Kết quả đã lưu: {filename}")
        return filename
    
    def run_prediction_pipeline(self, collection_id):
        """Chạy pipeline dự đoán từ TXT dataset"""
        print(f"\n{'='*60}")
        print(f"🚀 DỰ ĐOÁN GIÁ NFT CHO: {collection_id.upper()}")
        print(f"{'='*60}")
        
        start_time = datetime.now()
        
        try:
            # 1. Load dataset từ TXT
            print("1️⃣ Đang load dataset từ TXT...")
            df = self.get_latest_dataset(collection_id)
            if df is None:
                print(f"❌ Không tìm thấy dataset cho {collection_id}")
                return None
            
            # 2. Preprocess data
            print("2️⃣ Đang xử lý data...")
            df_processed = self.preprocess_data(df)
            
            # 3. Prepare features
            print("3️⃣ Đang chuẩn bị features...")
            X, y, feature_names = self.prepare_features(df_processed)
            
            # 4. Split data
            split_index = int(len(X) * 0.8)
            X_train, X_test = X[:split_index], X[split_index:]
            y_train, y_test = y[:split_index], y[split_index:]
            
            print(f"📊 Training set: {len(X_train)} samples")
            print(f"📊 Test set: {len(X_test)} samples")
            
            # 5. Train model
            print("4️⃣ Đang train AI model...")
            self.train_model(X_train, y_train)
            
            # 6. Evaluate
            print("5️⃣ Đang đánh giá model...")
            results, y_pred = self.evaluate_model(X_test, y_test)
            
            print(f"\n📈 KẾT QUẢ ĐÁNH GIÁ MODEL:")
            print(f"   MAE: ${results['mae']:.2f}")
            print(f"   RMSE: ${results['rmse']:.2f}")
            print(f"   R²: {results['r2']:.3f}")
            
            # 7. Predict future
            print("\n6️⃣ Đang dự đoán giá tương lai...")
            future_predictions = self.predict_future_prices(df_processed, days_ahead=7)
            
            print(f"\n🔮 DỰ ĐOÁN GIÁ 7 NGÀY TƯƠNG LAI:")
            for i, pred in enumerate(future_predictions, 1):
                print(f"   Ngày +{i}: ${pred:.2f} USD ({pred*100:.2f} DPSV)")
            
            # 8. Save results
            self.save_results(collection_id, results, future_predictions)
            
            end_time = datetime.now()
            execution_time = (end_time - start_time).total_seconds()
            print(f"\n⏱️  Thời gian thực thi: {execution_time:.2f} giây")
            
            return {
                'df': df_processed,
                'results': results,
                'predictions': y_pred,
                'future_predictions': future_predictions,
                'feature_names': feature_names,
                'execution_time': execution_time
            }
            
        except Exception as e:
            print(f"❌ Lỗi trong pipeline: {e}")
            return None

def main():
    """Chạy dự đoán cho tất cả collections"""
    print("🤖 NFT PRICE PREDICTOR - ĐỌC TỪ TXT DATASET")
    print("="*60)
    
    # Khởi tạo predictor
    predictor = NFTPredictorFromTXT()
    
    # Collections cần dự đoán
    collections = ['cryptopunks', 'azuki', 'bored-ape-yacht-club']
    
    results_all = {}
    
    for collection in collections:
        result = predictor.run_prediction_pipeline(collection)
        if result:
            results_all[collection] = result
    
    print(f"\n🎉 HOÀN THÀNH! Đã dự đoán cho {len(results_all)} collections.")
    return results_all

if __name__ == "__main__":
    results = main()
