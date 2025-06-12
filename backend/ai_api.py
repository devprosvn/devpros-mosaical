from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import os
import json
import glob
from datetime import datetime, timedelta
import sys
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add ai directory to path
sys.path.append('../ai')
from nft_predictor_from_txt import NFTPredictorFromTXT

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

class NFTAPIPredictor:
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.collections = ['cryptopunks', 'azuki', 'bored-ape-yacht-club']

    def load_model(self, collection_id):
        """Load model và scaler từ file .pkl"""
        try:
            model_path = f"../ai_models/nft_model_{collection_id}.pkl"
            scaler_path = f"../ai_models/nft_scaler_{collection_id}.pkl"

            if not os.path.exists(model_path) or not os.path.exists(scaler_path):
                logger.error(f"Model files not found for {collection_id}")
                return False

            self.models[collection_id] = joblib.load(model_path)
            self.scalers[collection_id] = joblib.load(scaler_path)

            logger.info(f"Loaded model for {collection_id}")
            return True

        except Exception as e:
            logger.error(f"Error loading model for {collection_id}: {e}")
            return False

    def predict_price(self, collection_id, features):
        """Dự đoán giá từ features"""
        try:
            if collection_id not in self.models:
                if not self.load_model(collection_id):
                    return None

            model = self.models[collection_id]
            scaler = self.scalers[collection_id]

            # Scale features và predict
            features_scaled = scaler.transform(features)
            prediction = model.predict(features_scaled)

            return float(prediction[0])

        except Exception as e:
            logger.error(f"Error predicting for {collection_id}: {e}")
            return None

    def get_future_predictions(self, collection_id, days=7):
        """Lấy dự đoán tương lai từ dataset có sẵn"""
        try:
            # Load predictor và chạy pipeline
            predictor = NFTPredictorFromTXT()

            # Load model nếu có
            if predictor.load_model(collection_id):
                # Load dataset để predict future
                df = predictor.get_latest_dataset(collection_id)
                if df is not None:
                    df_processed = predictor.preprocess_data(df)
                    future_predictions = predictor.predict_future_prices(df_processed, days_ahead=days)

                    # Tạo dates cho future predictions
                    last_date = df_processed['date'].max()
                    future_dates = [
                        (last_date + timedelta(days=i+1)).strftime('%Y-%m-%d') 
                        for i in range(len(future_predictions))
                    ]

                    return {
                        'future_dates': future_dates,
                        'predicted_prices': [float(p) for p in future_predictions],
                        'collection_id': collection_id
                    }

            return None

        except Exception as e:
            logger.error(f"Error getting future predictions for {collection_id}: {e}")
            return None

# Initialize predictor
api_predictor = NFTAPIPredictor()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/collections', methods=['GET'])
def get_collections():
    """Lấy danh sách collections có sẵn"""
    return jsonify({
        'collections': api_predictor.collections,
        'available_models': []
    })

@app.route('/predict/<collection_id>', methods=['POST'])
def predict_single(collection_id):
    """Predict giá từ features"""
    try:
        data = request.json
        features = np.array(data['features']).reshape(1, -1)

        prediction = api_predictor.predict_price(collection_id, features)

        if prediction is None:
            return jsonify({'error': 'Prediction failed'}), 500

        return jsonify({
            'collection_id': collection_id,
            'prediction': prediction,
            'prediction_dpsv': prediction * 100,
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        logger.error(f"Error in predict_single: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/predict/future/<collection_id>', methods=['GET'])
def predict_future(collection_id):
    """Lấy dự đoán giá tương lai cho chart"""
    try:
        days = request.args.get('days', 7, type=int)

        predictions = api_predictor.get_future_predictions(collection_id, days)

        if predictions is None:
            return jsonify({'error': 'Future prediction failed'}), 500

        return jsonify(predictions)

    except Exception as e:
        logger.error(f"Error in predict_future: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/models/<collection_id>/download', methods=['GET'])
def download_model(collection_id):
    """Download model file"""
    try:
        model_path = f"../ai_models/nft_model_{collection_id}.pkl"

        if not os.path.exists(model_path):
            return jsonify({'error': 'Model not found'}), 404

        return send_file(model_path, as_attachment=True)

    except Exception as e:
        logger.error(f"Error downloading model: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/train/<collection_id>', methods=['POST'])
def train_model(collection_id):
    """Train model cho collection"""
    try:
        logger.info(f"Starting training for {collection_id}")

        # Initialize predictor và train
        predictor = NFTPredictorFromTXT()
        result = predictor.run_prediction_pipeline(collection_id)

        if result is None:
            return jsonify({'error': 'Training failed'}), 500

        # Reload model vào memory
        api_predictor.load_model(collection_id)

        return jsonify({
            'collection_id': collection_id,
            'status': 'training_completed',
            'performance': result['results'],
            'execution_time': result['execution_time'],
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        logger.error(f"Error training model: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/predictions/<collection_id>', methods=['GET'])
def get_predictions(collection_id):
    try:
        # Tìm file prediction mới nhất cho collection
        pattern = f"ai_predictions_{collection_id}_*.json"
        files = glob.glob(pattern)
        if not files:
            # Thử tìm trong thư mục gốc
            pattern = f"../ai_predictions_{collection_id}_*.json"
            files = glob.glob(pattern)

        if not files:
            return jsonify({'error': f'No predictions found for {collection_id}'}), 404

        # Lấy file mới nhất
        latest_file = max(files, key=os.path.getctime)

        with open(latest_file, 'r') as f:
            data = json.load(f)

        return jsonify(data)
    except Exception as e:
        print(f"Error in get_predictions: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/predict/<collection_id>', methods=['POST'])
def predict_price(collection_id):
    try:
        # Load model và scaler
        model_path = f'ai_models/nft_model_{collection_id}.pkl'
        scaler_path = f'ai_models/nft_scaler_{collection_id}.pkl'

        if not os.path.exists(model_path) or not os.path.exists(scaler_path):
            return jsonify({'error': f'Model not found for {collection_id}'}), 404

        model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)

        # Nhận features từ request
        data = request.json
        features = np.array(data['features']).reshape(1, -1)

        # Dự đoán
        features_scaled = scaler.transform(features)
        prediction = model.predict(features_scaled)

        return jsonify({
            'collection_id': collection_id,
            'prediction_usd': float(prediction[0]),
            'prediction_dpsv': float(prediction[0] * 100),
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        print(f"Error in predict_price: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/predictions', methods=['GET'])
def get_all_predictions():
    try:
        collections = ['cryptopunks', 'azuki', 'bored-ape-yacht-club']
        all_predictions = {}

        for collection in collections:
            try:
                pattern = f"ai_predictions_{collection}_*.json"
                files = glob.glob(pattern)
                if not files:
                    pattern = f"../ai_predictions_{collection}_*.json"
                    files = glob.glob(pattern)

                if files:
                    latest_file = max(files, key=os.path.getctime)
                    with open(latest_file, 'r') as f:
                        data = json.load(f)
                    all_predictions[collection] = data
            except Exception as e:
                print(f"Error loading {collection}: {e}")
                continue

        return jsonify(all_predictions)
    except Exception as e:
        print(f"Error in get_all_predictions: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Load existing models on startup
    for collection in api_predictor.collections:
        api_predictor.load_model(collection)

    logger.info("AI API Server starting on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=True)