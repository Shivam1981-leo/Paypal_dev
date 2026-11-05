# PayGuard AI - ML 18sec Review (Trained Model)

**Date**: November 5, 2026  
**Training Duration**: ~4 minutes on RTX 5050 GPU  
**Dataset**: IEEE-CIS Fraud Detection (Vesta Corporation) - 590K transactions

## Model Performance

- **AUC-ROC**: 0.9011 (90.11%)
- **Precision**: 24.62%
- **Recall**: 69.44%
- **F1-Score**: 0.3635

## Training Configuration

- **Hardware**: Intel i5-13450HX (10 cores) + NVIDIA RTX 5050 (8GB)
- **Framework**: XGBoost 3.4.1 with CUDA acceleration
- **Trees**: 500 trees with histogram method
- **Features**: 410 numeric features
- **Training samples**: 472,432
- **Validation samples**: 118,108
- **Fraud rate**: 3.51%

## Top 5 Most Important Features

1. V258 (13.69%)
2. V70 (8.59%)
3. V91 (3.44%)
4. V294 (3.22%)
5. V201 (2.46%)

## Dataset Source

**IEEE-CIS Fraud Detection Competition** (Vesta Corporation)
- Source: Kaggle
- URL: https://www.kaggle.com/c/ieee-fraud-detection
- Real-world e-commerce transaction data
- 434 anonymized features across transaction and identity tables

## Files Included

```
ml_18sec_review/
├── models/
│   ├── production/
│   │   └── model.json          # Trained XGBoost model (2.8 MB)
│   └── v_20261105_104649/
│       ├── model.json
│       └── feature_names.pkl
├── data/
│   └── processed/
│       ├── vesta_train.parquet  # 84 MB
│       └── vesta_val.parquet    # 21 MB
├── src/                         # Model code and API
├── scripts/                     # Training scripts
└── README_18SEC_REVIEW.md       # This file
```

**Note**: Raw CSV files (1.4 GB) are excluded from git. Download from Kaggle if needed.

## Quick Start

### 1. Install Dependencies

```bash
cd ml_18sec_review
pip install -r requirements.txt
```

### 2. Start API Server

```bash
cd src/api
uvicorn main:app --reload --port 8000
```

### 3. Test Fraud Detection

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "buyer_email": "test@example.com",
    "amount": 500.00,
    "currency": "USD",
    "device_data": {
      "device_id": "abc123",
      "ip_address": "192.168.1.1"
    }
  }'
```

### 4. View API Documentation

Open: http://localhost:8000/docs

## Retraining Instructions

To retrain the model:

1. Download Vesta dataset from Kaggle (requires acceptance of competition rules)
2. Run preprocessing: `python scripts/preprocess_vesta_data.py`
3. Train model: `python scripts/train_model.py`

See [DATASET.md](DATASET.md) for detailed instructions.

## Integration with PayGuard AI

This trained model can be integrated with the PayGuard AI backend at `D:\paypal_dev\backend\`:

1. Copy `models/production/model.json` to backend ML service
2. Use the API endpoints for real-time fraud detection
3. Model returns risk scores (0.0-1.0) with recommended actions:
   - **GREEN** (0.0-0.4): Proceed with PayPal
   - **YELLOW** (0.4-0.7): Manual review
   - **RED** (0.7-1.0): Block transaction

## Performance Characteristics

- **Inference latency**: < 20ms per transaction (CPU)
- **Throughput**: 50+ requests/second
- **Memory footprint**: ~100 MB loaded model
- **GPU training time**: 4 minutes (500 trees)
- **CPU training time**: ~20-25 minutes (500 trees)

## System Requirements

**Training:**
- Python 3.12+
- NVIDIA GPU with CUDA support (optional but recommended)
- 16 GB RAM minimum
- 2 GB disk space (excluding raw data)

**Inference:**
- Python 3.12+
- CPU: 4+ cores
- 2 GB RAM
- 50 MB disk space

## License

MIT License - See LICENSE file for details

## References

- [XGBoost Documentation](https://xgboost.readthedocs.io/)
- [IEEE-CIS Fraud Detection Competition](https://www.kaggle.com/c/ieee-fraud-detection)
- [Vesta Corporation](https://www.vesta.io/)
