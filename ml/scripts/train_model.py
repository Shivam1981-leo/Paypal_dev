"""Complete model training pipeline

Loads data, extracts features, trains XGBoost model with SHAP explainability.
"""

import sys
from pathlib import Path
import io

# Force UTF-8 encoding for Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

import polars as pl
import numpy as np
from sklearn.model_selection import train_test_split

from models.fraud_detector import FraudDetector


def main():
    print("\n" + "="*70)
    print("PAYGUARD AI - FRAUD DETECTION MODEL TRAINING PIPELINE")
    print("="*70 + "\n")

    base_dir = Path(__file__).parent.parent

    # Step 1: Load preprocessed Vesta data
    print("Step Step 1: Loading preprocessed Vesta data...")

    train_path = base_dir / "data" / "processed" / "vesta_train.parquet"
    val_path = base_dir / "data" / "processed" / "vesta_val.parquet"

    if not train_path.exists() or not val_path.exists():
        print("❌ Error: Preprocessed data not found!")
        print("\nPlease run preprocessing first:")
        print("  python scripts/preprocess_vesta_data.py")
        sys.exit(1)

    train_df = pl.read_parquet(train_path)
    val_df = pl.read_parquet(val_path)

    print(f"✓ Loaded {len(train_df):,} training samples")
    print(f"✓ Loaded {len(val_df):,} validation samples\n")

    # Step 2: Prepare features and target
    print("Step Step 2: Preparing features...")

    # Exclude non-feature columns
    exclude_cols = ['TransactionID', 'TransactionDT', 'isFraud']

    # Get numeric columns only (XGBoost requires numeric features)
    numeric_cols = []
    for col in train_df.columns:
        if col not in exclude_cols:
            dtype = train_df[col].dtype
            # Only include numeric types
            if dtype in [pl.Int8, pl.Int16, pl.Int32, pl.Int64, pl.Float32, pl.Float64, pl.UInt8, pl.UInt16, pl.UInt32, pl.UInt64]:
                numeric_cols.append(col)

    feature_cols = numeric_cols

    # Convert to numpy arrays
    X_train = train_df.select(feature_cols).to_numpy()
    y_train = train_df['isFraud'].to_numpy()

    X_val = val_df.select(feature_cols).to_numpy()
    y_val = val_df['isFraud'].to_numpy()

    print(f"OK: Using {len(feature_cols)} features")
    print(f"OK: Train samples: {len(X_train):,} ({y_train.mean()*100:.2f}% fraud)")
    print(f"OK: Val samples: {len(X_val):,} ({y_val.mean()*100:.2f}% fraud)\n")

    # Step 3: Train model
    print("Step Step 3: Training XGBoost model with GPU acceleration...")

    # Check GPU availability
    import xgboost as xgb
    try:
        # Test if CUDA is available
        import subprocess
        result = subprocess.run(['nvidia-smi'], capture_output=True, text=True)
        if result.returncode == 0:
            print("✓ NVIDIA GPU detected (RTX 5050)")
            device = 'cuda'
            tree_method = 'hist'  # GPU-accelerated histogram algorithm
        else:
            print("Warning: GPU not detected, falling back to CPU")
            device = 'cpu'
            tree_method = 'hist'
    except:
        print("Warning: GPU not available, using CPU")
        device = 'cpu'
        tree_method = 'hist'

    detector = FraudDetector()

    # Custom hyperparameters (optimized for Vesta dataset with GPU)
    # Adjust scale_pos_weight based on actual fraud rate (~3.5%)
    fraud_rate = y_train.mean()
    scale_pos_weight = (1 - fraud_rate) / fraud_rate  # ~27.5 for 3.5% fraud rate

    params = {
        'max_depth': 6,
        'learning_rate': 0.05,  # Lower learning rate for larger dataset
        'n_estimators': 500,  # More trees for complex patterns
        'subsample': 0.8,
        'colsample_bytree': 0.8,
        'scale_pos_weight': scale_pos_weight,
        'min_child_weight': 5,
        'gamma': 0.1,
        'reg_alpha': 0.5,
        'reg_lambda': 2.0,
        'random_state': 42,
        'tree_method': tree_method,  # GPU-accelerated
        'device': device,  # Use RTX 5050 GPU
        'early_stopping_rounds': 50
    }

    print(f"Training device: {device.upper()}")
    print(f"Tree method: {tree_method}")
    print(f"Scale pos weight: {scale_pos_weight:.2f} (fraud rate: {fraud_rate*100:.2f}%)\n")

    metrics = detector.train(
        X_train, y_train,
        X_val, y_val,
        feature_names=feature_cols,
        params=params
    )

    # Step 4: Optimize threshold
    print("\nStep Step 4: Optimizing decision threshold...")
    detector.optimize_threshold(X_val, y_val, target_fpr=0.05)

    # Step 5: Feature importance
    print("\nStep Step 5: Top 20 Most Important Features:")
    importance = detector.get_feature_importance(top_n=20)
    for i, feat in enumerate(importance, 1):
        print(f"  {i:2d}. {feat['feature']:30s} {feat['importance']:.4f}")

    # Step 6: Test prediction with explanation on validation set
    print("\nStep Step 6: Testing prediction with SHAP explanation...")
    fraud_indices = np.where(y_val == 1)[0]
    if len(fraud_indices) > 0:
        sample_idx = fraud_indices[0]
        sample_X = X_val[sample_idx:sample_idx+1]

        fraud_prob, explanations = detector.predict_with_explanation(sample_X)

        print(f"\nSample Transaction:")
        print(f"  Fraud Probability: {fraud_prob:.4f}")
        print(f"  Risk Category: {detector.get_risk_category(fraud_prob)}")
        print(f"  Recommended Action: {detector.get_recommended_action(detector.get_risk_category(fraud_prob))}")
        print(f"\n  Top Contributing Features:")
        for exp in explanations[:8]:
            print(f"    {exp['feature']:30s} {exp['shap_value']:+.4f}")

    # Step 7: Save model
    print("\nStep Step 7: Saving model...")
    models_dir = base_dir / "models"
    production_dir = models_dir / "production"
    production_dir.mkdir(parents=True, exist_ok=True)

    # Save to production
    detector.save_model(str(production_dir))

    # Also save versioned copy with timestamp
    from datetime import datetime
    version_name = f"v_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    version_dir = models_dir / version_name
    version_dir.mkdir(parents=True, exist_ok=True)
    detector.save_model(str(version_dir))

    # Step 8: Summary
    print("\n" + "="*70)
    print("OK: TRAINING PIPELINE COMPLETE - VESTA DATASET")
    print("="*70)
    print(f"\nStep Model Performance Summary:")
    print(f"  AUC-ROC:              {metrics['auc_roc']:.4f}")
    print(f"  Precision:            {metrics['precision']:.4f}")
    print(f"  Recall (Detection):   {metrics['recall']:.4f}")
    print(f"  F1 Score:             {metrics['f1_score']:.4f}")
    print(f"  False Positive Rate:  {metrics['false_positive_rate']:.4f} ({metrics['false_positive_rate']*100:.2f}%)")

    print(f"\n📁 Model Location:")
    print(f"  Production: {production_dir}")
    print(f"  Version: {version_dir}")

    print(f"\n🚀 Next Steps:")
    print(f"  1. Start API: cd ml/src/api && uvicorn main:app --reload")
    print(f"  2. Test API: curl -X POST http://localhost:8000/predict")
    print(f"  3. View docs: http://localhost:8000/docs")
    print("")


if __name__ == "__main__":
    main()
