"""Unit tests for FraudDetector model"""

import pytest
import numpy as np
import sys
from pathlib import Path
from unittest.mock import Mock, patch

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from models.fraud_detector import FraudDetector


@pytest.fixture
def sample_training_data():
    """Create sample training data"""
    np.random.seed(42)

    n_samples = 1000
    n_features = 20

    # Generate random features
    X_train = np.random.randn(n_samples, n_features)
    X_val = np.random.randn(200, n_features)

    # Generate labels (10% fraud)
    y_train = np.random.choice([0, 1], size=n_samples, p=[0.9, 0.1])
    y_val = np.random.choice([0, 1], size=200, p=[0.9, 0.1])

    feature_names = [f"feature_{i}" for i in range(n_features)]

    return X_train, y_train, X_val, y_val, feature_names


@pytest.fixture
def trained_detector(sample_training_data):
    """Create a trained FraudDetector"""
    X_train, y_train, X_val, y_val, feature_names = sample_training_data

    detector = FraudDetector()

    # Train with minimal parameters for speed
    params = {
        'n_estimators': 10,
        'max_depth': 3,
        'learning_rate': 0.1,
        'early_stopping_rounds': 5
    }

    detector.train(X_train, y_train, X_val, y_val, feature_names, params)

    return detector


def test_fraud_detector_initialization():
    """Test FraudDetector initialization"""
    detector = FraudDetector()

    assert detector.model is None
    assert detector.feature_names is None
    assert detector.threshold == 0.5


def test_train_model(sample_training_data):
    """Test model training"""
    X_train, y_train, X_val, y_val, feature_names = sample_training_data

    detector = FraudDetector()

    params = {
        'n_estimators': 10,
        'max_depth': 3,
        'early_stopping_rounds': 5
    }

    metrics = detector.train(X_train, y_train, X_val, y_val, feature_names, params)

    # Check model is trained
    assert detector.model is not None
    assert detector.feature_names == feature_names

    # Check metrics are returned
    assert 'auc_roc' in metrics
    assert 'precision' in metrics
    assert 'recall' in metrics
    assert 'f1_score' in metrics
    assert 'false_positive_rate' in metrics

    # Metrics should be valid
    assert 0.0 <= metrics['auc_roc'] <= 1.0
    assert 0.0 <= metrics['precision'] <= 1.0
    assert 0.0 <= metrics['recall'] <= 1.0


def test_predict(trained_detector, sample_training_data):
    """Test prediction"""
    _, _, X_val, _, _ = sample_training_data

    predictions = trained_detector.predict(X_val)

    # Check predictions are probabilities
    assert len(predictions) == len(X_val)
    assert all(0.0 <= p <= 1.0 for p in predictions)


def test_predict_with_explanation(trained_detector, sample_training_data):
    """Test prediction with SHAP explanation"""
    _, _, X_val, _, _ = sample_training_data

    # Get single sample
    X_sample = X_val[:1]

    fraud_prob, explanations = trained_detector.predict_with_explanation(X_sample, n_top_features=5)

    # Check fraud probability
    assert 0.0 <= fraud_prob <= 1.0

    # Check explanations
    assert len(explanations) == 5
    assert all('feature' in exp for exp in explanations)
    assert all('impact' in exp for exp in explanations)
    assert all('value' in exp for exp in explanations)


def test_get_risk_category(trained_detector):
    """Test risk category assignment"""
    assert trained_detector.get_risk_category(0.2) == "GREEN"
    assert trained_detector.get_risk_category(0.5) == "YELLOW"
    assert trained_detector.get_risk_category(0.8) == "RED"

    # Boundary cases
    assert trained_detector.get_risk_category(0.39) == "GREEN"
    assert trained_detector.get_risk_category(0.40) == "YELLOW"
    assert trained_detector.get_risk_category(0.69) == "YELLOW"
    assert trained_detector.get_risk_category(0.70) == "RED"


def test_get_recommended_action(trained_detector):
    """Test recommended action"""
    assert trained_detector.get_recommended_action("GREEN") == "PROCEED_PAYPAL"
    assert trained_detector.get_recommended_action("YELLOW") == "MANUAL_REVIEW"
    assert trained_detector.get_recommended_action("RED") == "BLOCK_TRANSACTION"


def test_get_feature_importance(trained_detector):
    """Test feature importance retrieval"""
    importance = trained_detector.get_feature_importance(top_n=10)

    assert len(importance) == 10
    assert all('feature' in feat for feat in importance)
    assert all('importance' in feat for feat in importance)

    # Should be sorted by importance (descending)
    importances = [feat['importance'] for feat in importance]
    assert importances == sorted(importances, reverse=True)


def test_optimize_threshold(trained_detector, sample_training_data):
    """Test threshold optimization"""
    _, _, X_val, y_val, _ = sample_training_data

    original_threshold = trained_detector.threshold

    optimal_threshold = trained_detector.optimize_threshold(X_val, y_val, target_fpr=0.05)

    # Threshold should change
    assert optimal_threshold != original_threshold
    assert 0.0 <= optimal_threshold <= 1.0

    # Should be saved to detector
    assert trained_detector.threshold == optimal_threshold


def test_save_and_load_model(trained_detector, tmp_path):
    """Test model saving and loading"""
    # Save model
    model_dir = tmp_path / "test_model"
    trained_detector.save_model(str(model_dir), version="test")

    # Check files exist
    assert (model_dir / "test" / "model.ubj").exists()
    assert (model_dir / "test" / "metadata.json").exists()
    assert (model_dir / "test" / "feature_importance.json").exists()

    # Load model in new detector
    new_detector = FraudDetector()
    new_detector.load_model(str(model_dir / "test"))

    # Check loaded correctly
    assert new_detector.model is not None
    assert new_detector.feature_names == trained_detector.feature_names
    assert new_detector.threshold == trained_detector.threshold


def test_model_consistency(trained_detector, sample_training_data):
    """Test that predictions are consistent"""
    _, _, X_val, _, _ = sample_training_data

    # Get predictions twice
    pred1 = trained_detector.predict(X_val)
    pred2 = trained_detector.predict(X_val)

    # Should be identical
    np.testing.assert_array_equal(pred1, pred2)


def test_confusion_matrix_structure(trained_detector, sample_training_data):
    """Test confusion matrix in metrics"""
    _, _, X_val, y_val, _ = sample_training_data

    # Re-evaluate to get fresh metrics
    trained_detector._evaluate(X_val, y_val)

    cm = trained_detector.metrics['confusion_matrix']

    # Check all components present
    assert 'true_negative' in cm
    assert 'false_positive' in cm
    assert 'false_negative' in cm
    assert 'true_positive' in cm

    # All should be non-negative integers
    assert all(isinstance(v, int) and v >= 0 for v in cm.values())


def test_empty_model_prediction_fails():
    """Test that prediction fails on untrained model"""
    detector = FraudDetector()

    with pytest.raises(AttributeError):
        detector.predict(np.random.randn(10, 5))


def test_feature_name_consistency(trained_detector, sample_training_data):
    """Test that feature names are preserved"""
    _, _, _, _, feature_names = sample_training_data

    assert trained_detector.feature_names == feature_names

    importance = trained_detector.get_feature_importance()
    importance_features = [feat['feature'] for feat in importance]

    # All importance features should be in original feature names
    assert all(feat in feature_names for feat in importance_features)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
