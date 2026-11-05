# PayGuard AI - ML Service

Fraud detection engine powered by XGBoost 2.1.2 trained on real-world Vesta e-commerce transaction data (November 2026).

## 🚀 Tech Stack

- **Python**: 3.12.7+
- **ML Framework**: XGBoost 2.1.2
- **Data Processing**: Polars 1.15.0 (faster than pandas)
- **API Framework**: FastAPI 0.115.0
- **Explainability**: SHAP 0.46.0
- **Inference**: ONNX Runtime 1.20.0
- **Dataset**: IEEE-CIS Fraud Detection (Vesta Corporation) - 590K real transactions

## 📁 Project Structure

```
ml/
├── notebooks/          # Jupyter notebooks for experimentation
├── src/
│   ├── features/      # Feature extraction and engineering
│   ├── models/        # Model training and inference
│   ├── api/           # FastAPI inference service
│   └── utils/         # Configuration and utilities
├── data/
│   ├── raw/           # Raw data files
│   ├── processed/     # Preprocessed data
│   └── synthetic/     # Synthetic training data
├── models/
│   ├── v1/            # Versioned models
│   └── production/    # Production model artifacts
├── tests/             # Unit and integration tests
└── scripts/           # Training and preprocessing scripts
```

## 🛠️ Setup

### 1. Create Virtual Environment

```bash
cd ml
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

## 📊 Dataset & Features

**Dataset**: IEEE-CIS Fraud Detection (Vesta Corporation)
- **Size**: ~590,000 real e-commerce transactions
- **Fraud Rate**: 3.5% (realistic production imbalance)
- **Features**: 434 anonymized features including:
  - Transaction amounts and product codes
  - Card information (anonymized)
  - Device and identity data
  - Email domain analysis
  - Time-based patterns
  - Network and behavioral signals

**Feature Engineering**:
- Transaction amount transformations (log, decimal analysis)
- Temporal features (hour of day, day of week)
- Device type extraction (Windows, iOS, Android, Mac)
- Email domain matching
- Missing value handling with signal preservation

## 🎯 Risk Categories

- **GREEN** (0.0 - 0.4): Low risk - Proceed with PayPal
- **YELLOW** (0.4 - 0.7): Medium risk - Manual review
- **RED** (0.7 - 1.0): High risk - Block transaction

## 🚀 Quick Start

### 1. Setup Kaggle API

Get your Kaggle API credentials:
1. Go to https://www.kaggle.com/settings/account
2. Click "Create New API Token"
3. Save `kaggle.json` to `~/.kaggle/kaggle.json` (Linux/Mac) or `C:\Users\<username>\.kaggle\kaggle.json` (Windows)

### 2. Download Vesta Dataset

```bash
# Accept competition rules first at: https://www.kaggle.com/c/ieee-fraud-detection/rules
pip install kaggle
python scripts/download_vesta_dataset.py
```

This downloads ~1.2 GB of real e-commerce fraud data.

### 3. Preprocess Data

```bash
python scripts/preprocess_vesta_data.py
```

### 4. Train Model

```bash
python scripts/train_model.py
```

**GPU Acceleration**: The training script automatically detects and uses your NVIDIA GPU (RTX 5050) if available. Training time:
- **GPU (RTX 5050)**: ~5-10 minutes
- **CPU**: ~15-30 minutes

### Start Inference API

```bash
cd src/api
uvicorn main:app --reload --port 8000
```

API will be available at `http://localhost:8000`

## 📡 API Endpoints

### Health Check
```bash
GET /health
```

### Predict Risk Score
```bash
POST /predict
Content-Type: application/json

{
  "buyer_email": "buyer@example.com",
  "amount": 100.00,
  "currency": "USD",
  "device_data": {
    "device_id": "abc123",
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0..."
  },
  "session_data": {
    "time_on_site_seconds": 120,
    "pages_visited": 5,
    "checkout_speed_seconds": 30
  },
  "cart_items": []
}
```

Response:
```json
{
  "risk_score": 0.25,
  "risk_category": "GREEN",
  "recommended_action": "PROCEED_PAYPAL",
  "flags": [],
  "explanation": {
    "top_features": [
      {"feature": "account_age_days", "impact": 0.15},
      {"feature": "amount_zscore", "impact": -0.08}
    ]
  },
  "processing_time_ms": 45
}
```

## 🧪 Testing

```bash
# Unit tests
pytest tests/

# With coverage
pytest tests/ --cov=src --cov-report=html
```

## 📈 Model Performance

Target Metrics:
- **AUC-ROC**: > 0.85
- **Feature Extraction**: < 50ms
- **Inference Time**: < 100ms
- **Fraud Detection Rate**: > 90%
- **False Positive Rate**: < 5%

## 🔄 Continuous Learning

The model supports continuous retraining with production feedback:

1. Collect labeled transactions
2. Merge with training data
3. Retrain model periodically
4. Version and deploy new model
5. Monitor performance metrics

## 📝 Development Workflow

1. **Experimentation**: Use Jupyter notebooks in `notebooks/`
2. **Feature Engineering**: Implement in `src/features/`
3. **Training**: Use scripts in `scripts/`
4. **Testing**: Add tests in `tests/`
5. **Deployment**: Build Docker container

## 🐳 Docker Deployment

```bash
# Build image
docker build -t payguard-ml:latest .

# Run container
docker run -p 8000:8000 --env-file .env payguard-ml:latest
```

## 📊 Monitoring

- **MLflow**: Track experiments and model versions
- **Elastic APM**: Monitor inference performance
- **Prometheus**: Collect metrics

## 🔧 Troubleshooting

### Issue: Slow inference
- Check ONNX conversion is working
- Verify GPU acceleration is enabled
- Review feature extraction performance

### Issue: Poor model performance
- Check training data quality
- Review feature engineering
- Adjust hyperparameters
- Add more training data

## 📚 References

- [XGBoost Documentation](https://xgboost.readthedocs.io/)
- [Polars Documentation](https://pola-rs.github.io/polars/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SHAP Documentation](https://shap.readthedocs.io/)

## 📄 License

MIT License - See LICENSE file for details
