"""Complete model training pipeline

Loads data, extracts features, trains XGBoost model with SHAP explainability.
"""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

import polars as pl
import numpy as np
from sklearn.model_selection import train_test_split

from features.synthetic_data import SyntheticDataGenerator
from features.feature_engineering import FeatureEngineer
from models.fraud_detector import FraudDetector


def main():
    print("\n" + "="*70)
    print("PAYGUARD AI - FRAUD DETECTION MODEL TRAINING PIPELINE")
    print("="*70 + "\n")

    base_dir = Path(__file__).parent.parent

    # Step 1: Generate synthetic data (if not exists)
    data_path = base_dir / "data" / "synthetic" / "transactions.parquet"

    if not data_path.exists():
        print("📊 Step 1: Generating synthetic training data...")
        generator = SyntheticDataGenerator()
        df_raw = generator.generate_dataset(n_legitimate=10000, n_fraud=1000)

        data_path.parent.mkdir(parents=True, exist_ok=True)
        generator.save_dataset(df_raw, str(data_path))
    else:
        print(f"📊 Step 1: Loading existing data from {data_path}...")
        df_raw = pl.read_parquet(data_path)
        print(f"✓ Loaded {len(df_raw):,} transactions\n")

    # Step 2: Feature engineering
    print("🔧 Step 2: Extracting features...")
    engineer = FeatureEngineer()
    df_features = engineer.extract_all_features(df_raw)

    # Select model features
    feature_df = engineer.select_model_features(df_features)

    # Save processed features
    processed_path = base_dir / "data" / "processed" / "features.parquet"
    processed_path.parent.mkdir(parents=True, exist_ok=True)
    feature_df.write_parquet(processed_path)
    print(f"✓ Saved processed features to {processed_path}\n")

    # Step 3: Prepare training data
    print("📋 Step 3: Preparing training data...")
    feature_cols = [col for col in feature_df.columns if col != 'is_fraud']
    X = feature_df.select(feature_cols).to_numpy()
    y = feature_df['is_fraud'].to_numpy()

    # Split: 70% train, 15% validation, 15% test
    X_temp, X_test, y_temp, y_test = train_test_split(
        X, y, test_size=0.15, random_state=42, stratify=y
    )
    X_train, X_val, y_train, y_val = train_test_split(
        X_temp, y_temp, test_size=0.176, random_state=42, stratify=y_temp  # 0.176 of 0.85 = 0.15
    )

    print(f"Training set:   {len(X_train):,} samples")
    print(f"Validation set: {len(X_val):,} samples")
    print(f"Test set:       {len(X_test):,} samples\n")

    # Step 4: Train model
    print("🤖 Step 4: Training XGBoost model...")
    detector = FraudDetector()

    # Custom hyperparameters (tuned for fraud detection)
    params = {
        'max_depth': 6,
        'learning_rate': 0.1,
        'n_estimators': 200,
        'subsample': 0.8,
        'colsample_bytree': 0.8,
        'scale_pos_weight': 10,  # Handle 10:1 class imbalance
        'min_child_weight': 3,
        'gamma': 0.1,
        'reg_alpha': 0.1,
        'reg_lambda': 1.0,
        'random_state': 42,
        'tree_method': 'hist',
        'device': 'cpu',
        'early_stopping_rounds': 20
    }

    metrics = detector.train(
        X_train, y_train,
        X_val, y_val,
        feature_names=feature_cols,
        params=params
    )

    # Step 5: Optimize threshold
    print("\n🎯 Step 5: Optimizing decision threshold...")
    detector.optimize_threshold(X_val, y_val, target_fpr=0.05)

    # Step 6: Final evaluation on test set
    print("\n📊 Step 6: Final evaluation on test set...")
    y_test_pred_proba = detector.predict(X_test)
    y_test_pred = (y_test_pred_proba >= detector.threshold).astype(int)

    from sklearn.metrics import classification_report, confusion_matrix

    print("\nTest Set Performance:")
    print(classification_report(y_test, y_test_pred, target_names=['Legitimate', 'Fraud']))

    cm = confusion_matrix(y_test, y_test_pred)
    print("Confusion Matrix (Test Set):")
    print(cm)

    # Step 7: Feature importance
    print("\n📈 Step 7: Top 15 Most Important Features:")
    importance = detector.get_feature_importance(top_n=15)
    for i, feat in enumerate(importance, 1):
        print(f"  {i:2d}. {feat['feature']:30s} {feat['importance']:.4f}")

    # Step 8: Test prediction with explanation
    print("\n🔍 Step 8: Testing prediction with SHAP explanation...")
    sample_idx = np.where(y_test == 1)[0][0]  # Get first fraud sample
    sample_X = X_test[sample_idx:sample_idx+1]

    fraud_prob, explanations = detector.predict_with_explanation(sample_X)

    print(f"\nSample Transaction:")
    print(f"  Fraud Probability: {fraud_prob:.4f}")
    print(f"  Risk Category: {detector.get_risk_category(fraud_prob)}")
    print(f"  Recommended Action: {detector.get_recommended_action(detector.get_risk_category(fraud_prob))}")
    print(f"\n  Top Contributing Features:")
    for exp in explanations[:8]:
        print(f"    {exp['feature']:30s} impact: {exp['impact']:+.4f} (value: {exp['value']:.2f})")

    # Step 9: Save model
    print("\n💾 Step 9: Saving model...")
    models_dir = base_dir / "models"

    # Save to both v1 and production
    detector.save_model(str(models_dir), version="v1")

    # Copy to production
    production_dir = models_dir / "production"
    production_dir.mkdir(parents=True, exist_ok=True)

    import shutil
    for file in (models_dir / "v1").glob("*"):
        shutil.copy(file, production_dir / file.name)
    print(f"✓ Copied to production: {production_dir}")

    # Step 10: Summary
    print("\n" + "="*70)
    print("✅ TRAINING PIPELINE COMPLETE")
    print("="*70)
    print(f"\n📊 Model Performance Summary:")
    print(f"  AUC-ROC:              {metrics['auc_roc']:.4f}")
    print(f"  Precision:            {metrics['precision']:.4f}")
    print(f"  Recall (Detection):   {metrics['recall']:.4f}")
    print(f"  F1 Score:             {metrics['f1_score']:.4f}")
    print(f"  False Positive Rate:  {metrics['false_positive_rate']:.4f} ({metrics['false_positive_rate']*100:.2f}%)")

    print(f"\n📁 Model Location:")
    print(f"  Production: {production_dir}")
    print(f"  Version v1: {models_dir / 'v1'}")

    print(f"\n🚀 Next Steps:")
    print(f"  1. Start API: cd src/api && uvicorn main:app --reload")
    print(f"  2. Test API: curl -X POST http://localhost:8000/predict")
    print(f"  3. View docs: http://localhost:8000/docs")
    print("")


if __name__ == "__main__":
    main()
