"""Configuration management for ML service"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Project paths
PROJECT_ROOT = Path(__file__).parent.parent.parent
DATA_DIR = PROJECT_ROOT / "data"
MODELS_DIR = PROJECT_ROOT / "models"
NOTEBOOKS_DIR = PROJECT_ROOT / "notebooks"

# Data paths
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
SYNTHETIC_DATA_DIR = DATA_DIR / "synthetic"

# Model paths
PRODUCTION_MODEL_DIR = MODELS_DIR / "production"
VERSION_MODEL_DIR = MODELS_DIR / "v1"

# ML Configuration
RANDOM_SEED = 42
TEST_SIZE = 0.2
CV_FOLDS = 5

# Fraud detection thresholds
RISK_THRESHOLD_RED = 0.7  # High risk - block
RISK_THRESHOLD_YELLOW = 0.4  # Medium risk - review
# Below 0.4 = Green - proceed

# Model configuration
XGBOOST_PARAMS = {
    'n_estimators': 100,
    'max_depth': 6,
    'learning_rate': 0.1,
    'subsample': 0.8,
    'colsample_bytree': 0.8,
    'objective': 'binary:logistic',
    'eval_metric': 'auc',
    'scale_pos_weight': 10,  # Handle class imbalance
    'random_state': RANDOM_SEED,
    'tree_method': 'hist'  # Faster training
}

# API Configuration
API_HOST = os.getenv('API_HOST', '0.0.0.0')
API_PORT = int(os.getenv('API_PORT', '8000'))

# Backend API
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:3001')

# Redis configuration
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379')

# Feature extraction performance target
FEATURE_EXTRACTION_TARGET_MS = 50

# Inference performance target
INFERENCE_TARGET_MS = 100
