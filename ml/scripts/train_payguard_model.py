"""Train XGBoost model on PayGuard-engineered features from Vesta dataset

This script trains a fraud detection model using features engineered to match
the PayGuard backend API schema.
"""

import sys
from pathlib import Path
import polars as pl
import numpy as np
import io
from datetime import datetime

# Force UTF-8 encoding for Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from models.fraud_detector import FraudDetector


def load_payguard_features():
    """Load PayGuard-engineered features"""

    print("\n" + "="*70)
    print("LOADING PAYGUARD FEATURES")
    print("="*70 + "\n")

    processed_dir = Path(__file__).parent.parent / "data" / "processed"

    train_path = processed_dir / "payguard_train.parquet"
    val_path = processed_dir / "payguard_val.parquet"

    if not train_path.exists() or not val_path.exists():
        print("❌ PayGuard features not found!")
        print("\nRun feature engineering first:")
        print("  python scripts/engineer_payguard_features.py")
        sys.exit(1)

    print(f"Loading training data from {train_path.name}...")
    train_df = pl.read_parquet(train_path)

    print(f"Loading validation data from {val_path.name}...")
    val_df = pl.read_parquet(val_path)

    print(f"\n✓ Loaded {len(train_df):,} training samples")
    print(f"✓ Loaded {len(val_df):,} validation samples")
    print(f"✓ Features: {len(train_df.columns) - 1}")

    return train_df, val_df


def prepare_training_data(train_df: pl.DataFrame, val_df: pl.DataFrame):
    """Prepare data for XGBoost training"""

    print("\nPreparing data for training...")

    # Get feature columns (all except target)
    feature_cols = [col for col in train_df.columns if col != "isFraud"]

    # Convert to numpy arrays
    X_train = train_df.select(feature_cols).to_numpy()
    y_train = train_df["isFraud"].to_numpy()

    X_val = val_df.select(feature_cols).to_numpy()
    y_val = val_df["isFraud"].to_numpy()

    print(f"  ✓ X_train shape: {X_train.shape}")
    print(f"  ✓ y_train shape: {y_train.shape}")
    print(f"  ✓ X_val shape: {X_val.shape}")
    print(f"  ✓ y_val shape: {y_val.shape}")

    return X_train, y_train, X_val, y_val, feature_cols


def main():
    """Main training pipeline"""

    start_time = datetime.now()

    print("\n" + "="*70)
    print("PAYGUARD AI - FRAUD DETECTION MODEL TRAINING")
    print("Dataset: Vesta (IEEE-CIS) with PayGuard Feature Engineering")
    print("="*70)

    # Load features
    train_df, val_df = load_payguard_features()

    # Prepare data
    X_train, y_train, X_val, y_val, feature_cols = prepare_training_data(train_df, val_df)

    # Initialize detector
    detector = FraudDetector()

    # Training hyperparameters optimized for PayGuard + Vesta
    params = {
        'objective': 'binary:logistic',
        'eval_metric': 'auc',
        'max_depth': 7,              # Slightly deeper for complex patterns
        'learning_rate': 0.05,        # Lower learning rate for better generalization
        'n_estimators': 300,          # More trees
        'subsample': 0.8,
        'colsample_bytree': 0.8,
        'scale_pos_weight': 28,       # Adjusted for ~3.5% fraud rate
        'min_child_weight': 5,
        'gamma': 0.1,
        'reg_alpha': 0.5,            # Stronger L1 regularization
        'reg_lambda': 1.0,
        'random_state': 42,
        'tree_method': 'hist',
        'device': 'cpu',              # Change to 'cuda' for GPU
        'early_stopping_rounds': 30
    }

    print("\nTraining configuration:")
    print(f"  Device: {params['device'].upper()}")
    print(f"  Features: {len(feature_cols)}")
    print(f"  Early stopping: {params['early_stopping_rounds']} rounds")

    # Train model
    metrics = detector.train(
        X_train, y_train,
        X_val, y_val,
        feature_names=feature_cols,
        params=params
    )

    # Optimize threshold for 5% false positive rate
    print("\n" + "="*70)
    print("OPTIMIZING DECISION THRESHOLD")
    print("="*70)

    detector.optimize_threshold(X_val, y_val, target_fpr=0.05)

    # Re-evaluate with optimized threshold
    print("\n" + "="*70)
    print("FINAL METRICS (with optimized threshold)")
    print("="*70)

    final_metrics = detector._evaluate(X_val, y_val)

    # Feature importance analysis
    print("\n" + "="*70)
    print("TOP 20 MOST IMPORTANT FEATURES")
    print("="*70)

    top_features = detector.get_feature_importance(top_n=20)
    for i, feat in enumerate(top_features, 1):
        print(f"{i:2d}. {feat['feature']:40s} {feat['importance']:.4f}")

    # Save model
    output_dir = Path(__file__).parent.parent / "models"
    version = f"payguard_vesta_v1"

    print("\n" + "="*70)
    print("SAVING MODEL")
    print("="*70)

    detector.save_model(str(output_dir), version=version)

    # Training summary
    elapsed = (datetime.now() - start_time).total_seconds()

    print("\n" + "="*70)
    print("✅ TRAINING COMPLETE!")
    print("="*70)
    print(f"\nTraining time: {elapsed:.1f} seconds ({elapsed/60:.1f} minutes)")
    print(f"\nModel saved to: {output_dir / version}")
    print("\nPerformance Summary:")
    print(f"  AUC-ROC:              {final_metrics['auc_roc']:.4f}")
    print(f"  Precision:            {final_metrics['precision']:.4f}")
    print(f"  Recall (Detection):   {final_metrics['recall']:.4f}")
    print(f"  F1 Score:             {final_metrics['f1_score']:.4f}")
    print(f"  False Positive Rate:  {final_metrics['false_positive_rate']:.4f} ({final_metrics['false_positive_rate']*100:.2f}%)")

    print("\n" + "="*70)
    print("NEXT STEPS")
    print("="*70)
    print("1. Test predictions with sample transactions")
    print("2. Integrate with PayGuard backend API")
    print("3. Deploy to production environment")
    print("4. Monitor performance on real transactions")

    print("\nTest the model:")
    print(f"  python -m src.models.fraud_detector")


if __name__ == "__main__":
    main()
