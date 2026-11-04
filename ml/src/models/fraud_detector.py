"""XGBoost-based fraud detection model with SHAP explainability

High-performance fraud detection using XGBoost 2.1.2 with model explainability.
"""

import xgboost as xgb
import polars as pl
import numpy as np
import shap
import pickle
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    roc_auc_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report, roc_curve
)
import json
from datetime import datetime


class FraudDetector:
    """XGBoost-based fraud detection model with explainability"""

    def __init__(self, model_path: Optional[str] = None):
        self.model = None
        self.feature_names = None
        self.explainer = None
        self.threshold = 0.5  # Default decision threshold
        self.metrics = {}

        if model_path:
            self.load_model(model_path)

    def train(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        X_val: np.ndarray,
        y_val: np.ndarray,
        feature_names: List[str],
        params: Optional[Dict] = None
    ) -> Dict:
        """Train XGBoost model with early stopping"""

        print("\n" + "="*60)
        print("TRAINING XGBOOST FRAUD DETECTION MODEL")
        print("="*60 + "\n")

        self.feature_names = feature_names

        # Default hyperparameters (optimized for fraud detection)
        default_params = {
            'objective': 'binary:logistic',
            'eval_metric': 'auc',
            'max_depth': 6,
            'learning_rate': 0.1,
            'n_estimators': 200,
            'subsample': 0.8,
            'colsample_bytree': 0.8,
            'scale_pos_weight': 10,  # Handle class imbalance (10:1 ratio)
            'min_child_weight': 3,
            'gamma': 0.1,
            'reg_alpha': 0.1,
            'reg_lambda': 1.0,
            'random_state': 42,
            'tree_method': 'hist',  # Fast histogram-based algorithm
            'device': 'cpu',  # Change to 'cuda' for GPU
            'early_stopping_rounds': 20
        }

        if params:
            default_params.update(params)

        print("Hyperparameters:")
        for key, value in default_params.items():
            if key != 'early_stopping_rounds':
                print(f"  {key}: {value}")
        print(f"\nTraining samples: {len(X_train):,}")
        print(f"Validation samples: {len(X_val):,}")
        print(f"Features: {len(feature_names)}")
        print(f"Fraud rate (train): {y_train.mean()*100:.2f}%")
        print(f"Fraud rate (val): {y_val.mean()*100:.2f}%\n")

        # Extract early stopping rounds
        early_stopping_rounds = default_params.pop('early_stopping_rounds', None)

        # Train model
        print("Training model...")
        self.model = xgb.XGBClassifier(**default_params)

        self.model.fit(
            X_train, y_train,
            eval_set=[(X_val, y_val)],
            verbose=50
        )

        # Get best iteration
        best_iteration = self.model.best_iteration
        print(f"\n✓ Training complete!")
        print(f"Best iteration: {best_iteration}")

        # Evaluate on validation set
        print("\nEvaluating model...")
        metrics = self._evaluate(X_val, y_val)
        self.metrics = metrics

        return metrics

    def _evaluate(self, X: np.ndarray, y: np.ndarray) -> Dict:
        """Evaluate model performance"""

        # Predictions
        y_pred_proba = self.model.predict_proba(X)[:, 1]
        y_pred = (y_pred_proba >= self.threshold).astype(int)

        # Calculate metrics
        auc = roc_auc_score(y, y_pred_proba)
        precision = precision_score(y, y_pred)
        recall = recall_score(y, y_pred)
        f1 = f1_score(y, y_pred)

        # Confusion matrix
        cm = confusion_matrix(y, y_pred)
        tn, fp, fn, tp = cm.ravel()

        # False positive rate
        fpr = fp / (fp + tn) if (fp + tn) > 0 else 0

        metrics = {
            'auc_roc': float(auc),
            'precision': float(precision),
            'recall': float(recall),
            'f1_score': float(f1),
            'false_positive_rate': float(fpr),
            'confusion_matrix': {
                'true_negative': int(tn),
                'false_positive': int(fp),
                'false_negative': int(fn),
                'true_positive': int(tp)
            }
        }

        # Print results
        print("\n" + "="*60)
        print("MODEL PERFORMANCE")
        print("="*60)
        print(f"AUC-ROC:              {auc:.4f}")
        print(f"Precision:            {precision:.4f}")
        print(f"Recall (Detection):   {recall:.4f}")
        print(f"F1 Score:             {f1:.4f}")
        print(f"False Positive Rate:  {fpr:.4f} ({fpr*100:.2f}%)")
        print("\nConfusion Matrix:")
        print(f"  TN: {tn:5d}  |  FP: {fp:5d}")
        print(f"  FN: {fn:5d}  |  TP: {tp:5d}")
        print("="*60 + "\n")

        return metrics

    def predict(self, X: np.ndarray) -> np.ndarray:
        """Predict fraud probability"""
        return self.model.predict_proba(X)[:, 1]

    def predict_with_explanation(
        self,
        X: np.ndarray,
        n_top_features: int = 10
    ) -> Tuple[float, List[Dict]]:
        """Predict fraud probability with SHAP explanation"""

        # Get prediction
        fraud_prob = self.predict(X)[0]

        # Get SHAP values
        if self.explainer is None:
            self.explainer = shap.TreeExplainer(self.model)

        shap_values = self.explainer.shap_values(X)

        # Get top contributing features
        feature_impacts = []
        for i, (feature_name, shap_value) in enumerate(
            zip(self.feature_names, shap_values[0])
        ):
            feature_impacts.append({
                'feature': feature_name,
                'impact': float(shap_value),
                'value': float(X[0, i])
            })

        # Sort by absolute impact
        feature_impacts.sort(key=lambda x: abs(x['impact']), reverse=True)

        return fraud_prob, feature_impacts[:n_top_features]

    def get_risk_category(self, fraud_prob: float) -> str:
        """Convert fraud probability to risk category"""

        if fraud_prob < 0.4:
            return "GREEN"
        elif fraud_prob < 0.7:
            return "YELLOW"
        else:
            return "RED"

    def get_recommended_action(self, risk_category: str) -> str:
        """Get recommended action based on risk category"""

        actions = {
            "GREEN": "PROCEED_PAYPAL",
            "YELLOW": "MANUAL_REVIEW",
            "RED": "BLOCK_TRANSACTION"
        }
        return actions[risk_category]

    def get_feature_importance(self, top_n: int = 20) -> List[Dict]:
        """Get top N most important features"""

        importance = self.model.feature_importances_
        features = [
            {'feature': name, 'importance': float(imp)}
            for name, imp in zip(self.feature_names, importance)
        ]
        features.sort(key=lambda x: x['importance'], reverse=True)
        return features[:top_n]

    def optimize_threshold(
        self,
        X_val: np.ndarray,
        y_val: np.ndarray,
        target_fpr: float = 0.05
    ) -> float:
        """Optimize decision threshold to achieve target false positive rate"""

        y_pred_proba = self.predict(X_val)
        fpr, tpr, thresholds = roc_curve(y_val, y_pred_proba)

        # Find threshold closest to target FPR
        idx = np.argmin(np.abs(fpr - target_fpr))
        optimal_threshold = thresholds[idx]

        print(f"\nThreshold Optimization:")
        print(f"  Target FPR: {target_fpr:.4f}")
        print(f"  Optimal threshold: {optimal_threshold:.4f}")
        print(f"  Achieved FPR: {fpr[idx]:.4f}")
        print(f"  TPR (Detection): {tpr[idx]:.4f}")

        self.threshold = optimal_threshold
        return optimal_threshold

    def save_model(self, output_dir: str, version: str = "v1"):
        """Save model, explainer, and metadata"""

        output_path = Path(output_dir) / version
        output_path.mkdir(parents=True, exist_ok=True)

        # Save XGBoost model
        model_file = output_path / "model.ubj"
        self.model.save_model(model_file)
        print(f"✓ Saved model to {model_file}")

        # Save metadata
        metadata = {
            'version': version,
            'created_at': datetime.now().isoformat(),
            'feature_names': self.feature_names,
            'threshold': self.threshold,
            'metrics': self.metrics,
            'n_features': len(self.feature_names)
        }

        metadata_file = output_path / "metadata.json"
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        print(f"✓ Saved metadata to {metadata_file}")

        # Save feature importance
        importance = self.get_feature_importance(top_n=50)
        importance_file = output_path / "feature_importance.json"
        with open(importance_file, 'w') as f:
            json.dump(importance, f, indent=2)
        print(f"✓ Saved feature importance to {importance_file}")

        print(f"\n✅ Model saved successfully: {output_path}")

    def load_model(self, model_dir: str):
        """Load model and metadata"""

        model_path = Path(model_dir)

        # Load XGBoost model
        model_file = model_path / "model.ubj"
        if model_file.exists():
            self.model = xgb.XGBClassifier()
            self.model.load_model(model_file)
        else:
            # Try old format
            model_file = model_path / "model.json"
            if not model_file.exists():
                raise FileNotFoundError(f"Model not found at {model_path}")
            self.model = xgb.XGBClassifier()
            self.model.load_model(model_file)

        # Load metadata
        metadata_file = model_path / "metadata.json"
        with open(metadata_file, 'r') as f:
            metadata = json.load(f)

        self.feature_names = metadata['feature_names']
        self.threshold = metadata.get('threshold', 0.5)
        self.metrics = metadata.get('metrics', {})

        print(f"✓ Loaded model from {model_path}")
        print(f"  Version: {metadata.get('version', 'unknown')}")
        print(f"  Features: {len(self.feature_names)}")
        print(f"  Threshold: {self.threshold:.4f}")
        if self.metrics:
            print(f"  AUC-ROC: {self.metrics.get('auc_roc', 0):.4f}")


if __name__ == "__main__":
    from pathlib import Path
    import sys

    print("\n🤖 Fraud Detector Model Test\n")

    # Load processed features
    data_path = Path(__file__).parent.parent.parent / "data" / "processed" / "features.parquet"

    if not data_path.exists():
        print(f"❌ Features not found at {data_path}")
        print("Run: python scripts/generate_data.py")
        print("Then: python -m src.features.feature_engineering")
        sys.exit(1)

    print(f"Loading features from {data_path}...")
    df = pl.read_parquet(data_path)
    print(f"✓ Loaded {len(df)} samples\n")

    # Prepare data
    feature_cols = [col for col in df.columns if col != 'is_fraud']
    X = df.select(feature_cols).to_numpy()
    y = df['is_fraud'].to_numpy()

    # Split data
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Train model
    detector = FraudDetector()
    metrics = detector.train(
        X_train, y_train,
        X_val, y_val,
        feature_names=feature_cols
    )

    # Optimize threshold
    detector.optimize_threshold(X_val, y_val, target_fpr=0.05)

    # Test prediction with explanation
    print("\nTesting prediction with explanation...")
    sample_X = X_val[:1]
    fraud_prob, explanations = detector.predict_with_explanation(sample_X)

    print(f"\nSample Prediction:")
    print(f"  Fraud Probability: {fraud_prob:.4f}")
    print(f"  Risk Category: {detector.get_risk_category(fraud_prob)}")
    print(f"  Recommended Action: {detector.get_recommended_action(detector.get_risk_category(fraud_prob))}")
    print(f"\n  Top Features:")
    for exp in explanations[:5]:
        print(f"    {exp['feature']:30s} impact: {exp['impact']:+.4f} (value: {exp['value']:.2f})")

    # Save model
    output_dir = Path(__file__).parent.parent.parent / "models"
    detector.save_model(str(output_dir), version="v1")

    print("\n✅ Model training and testing complete!")
