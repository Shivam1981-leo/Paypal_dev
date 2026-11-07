"""Unit tests for feature engineering module"""

import pytest
import polars as pl
import numpy as np
from datetime import datetime, timedelta
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from features.feature_engineering import FeatureEngineer


@pytest.fixture
def sample_data():
    """Create sample transaction data"""
    np.random.seed(42)

    data = {
        'transaction_id': ['tx1', 'tx2', 'tx3', 'tx4', 'tx5'],
        'buyer_email': ['user1@example.com', 'user2@example.com', 'user1@example.com', 'user3@example.com', 'user4@example.com'],
        'amount': [100.0, 500.0, 50.0, 1500.0, 75.0],
        'currency': ['USD'] * 5,
        'device_id': ['dev1', 'dev2', 'dev1', 'dev3', 'dev4'],
        'ip_address': ['192.168.1.1', '192.168.1.2', '192.168.1.1', '192.168.1.3', '192.168.1.4'],
        'country': ['US', 'CA', 'US', 'NG', 'US'],
        'vpn_detected': [0, 0, 1, 1, 0],
        'tor_detected': [0, 0, 0, 1, 0],
        'device_reputation_score': [0.9, 0.8, 0.7, 0.2, 0.95],
        'account_age_days': [365, 30, 365, 5, 180],
        'time_on_site_seconds': [120, 45, 90, 15, 200],
        'pages_visited': [5, 2, 4, 1, 8],
        'checkout_speed_seconds': [45, 15, 30, 10, 60],
        'cart_item_count': [2, 1, 3, 1, 2],
        'digital_items_ratio': [0.0, 0.5, 0.33, 1.0, 0.0],
        'high_risk_items_count': [0, 1, 0, 2, 0],
        'email_is_disposable': [0, 0, 0, 1, 0],
        'geo_ip_billing_distance_km': [10.0, 25.0, 15.0, 800.0, 5.0],
        'timestamp': [datetime.now() - timedelta(hours=i) for i in range(5)],
        'is_fraud': [0, 0, 0, 1, 0]
    }

    return pl.DataFrame(data)


@pytest.fixture
def engineer():
    """Create FeatureEngineer instance"""
    return FeatureEngineer()


def test_feature_engineer_initialization(engineer):
    """Test FeatureEngineer initialization"""
    assert engineer is not None
    assert len(engineer.high_risk_countries) > 0
    assert 'NG' in engineer.high_risk_countries
    assert 'RU' in engineer.high_risk_countries


def test_velocity_features(engineer, sample_data):
    """Test velocity feature extraction"""
    result = engineer._add_velocity_features(sample_data)

    # Check new columns exist
    assert 'email_txn_count_total' in result.columns
    assert 'device_txn_count_total' in result.columns
    assert 'ip_txn_count_total' in result.columns
    assert 'email_total_amount' in result.columns

    # Verify counts
    user1_rows = result.filter(pl.col('buyer_email') == 'user1@example.com')
    assert user1_rows['email_txn_count_total'][0] == 2  # user1 has 2 transactions


def test_amount_features(engineer, sample_data):
    """Test amount-based features"""
    result = engineer._add_amount_features(sample_data)

    assert 'amount_zscore' in result.columns
    assert 'amount_log' in result.columns
    assert 'amount_is_high' in result.columns
    assert 'amount_rank' in result.columns

    # High amount flag
    high_amount_rows = result.filter(pl.col('amount_is_high') == 1)
    assert len(high_amount_rows) == 1  # Only $1500 transaction


def test_geographic_features(engineer, sample_data):
    """Test geographic features"""
    result = engineer._add_geographic_features(sample_data)

    assert 'is_high_risk_country' in result.columns
    assert 'geo_distance' in result.columns
    assert 'geo_distance_suspicious' in result.columns

    # Nigeria should be flagged as high-risk
    ng_row = result.filter(pl.col('country') == 'NG')
    assert ng_row['is_high_risk_country'][0] == 1


def test_device_features(engineer, sample_data):
    """Test device features"""
    result = engineer._add_device_features(sample_data)

    assert 'device_reputation' in result.columns
    assert 'is_vpn' in result.columns
    assert 'is_tor' in result.columns
    assert 'is_anonymized' in result.columns

    # Check anonymization detection
    assert result['is_anonymized'].sum() == 2  # 2 transactions with VPN/Tor


def test_behavioral_features(engineer, sample_data):
    """Test behavioral features"""
    result = engineer._add_behavioral_features(sample_data)

    assert 'session_duration' in result.columns
    assert 'pages_viewed' in result.columns
    assert 'checkout_speed' in result.columns
    assert 'behavioral_score' in result.columns

    # Behavioral score should be between 0 and 1
    assert result['behavioral_score'].min() >= 0.0
    assert result['behavioral_score'].max() <= 1.0


def test_account_features(engineer, sample_data):
    """Test account features"""
    result = engineer._add_account_features(sample_data)

    assert 'account_age' in result.columns
    assert 'account_age_very_new' in result.columns
    assert 'email_disposable' in result.columns
    assert 'account_trust_score' in result.columns

    # Very new account flag
    new_accounts = result.filter(pl.col('account_age_very_new') == 1)
    assert len(new_accounts) == 1  # 5-day old account


def test_cart_features(engineer, sample_data):
    """Test cart features"""
    result = engineer._add_cart_features(sample_data)

    assert 'cart_items' in result.columns
    assert 'digital_ratio' in result.columns
    assert 'has_high_risk_items' in result.columns
    assert 'avg_item_value' in result.columns

    # Average item value calculation
    assert result['avg_item_value'][0] == pytest.approx(50.0)  # $100 / 2 items


def test_temporal_features(engineer, sample_data):
    """Test temporal features"""
    result = engineer._add_temporal_features(sample_data)

    assert 'hour_of_day' in result.columns
    assert 'day_of_week' in result.columns
    assert 'is_night_time' in result.columns
    assert 'is_weekend' in result.columns


def test_extract_all_features(engineer, sample_data):
    """Test complete feature extraction pipeline"""
    result = engineer.extract_all_features(sample_data)

    # Should have many more columns than original
    assert len(result.columns) > len(sample_data.columns)

    # Check that original data is preserved
    assert 'transaction_id' in result.columns
    assert 'amount' in result.columns
    assert 'is_fraud' in result.columns


def test_get_feature_names(engineer):
    """Test feature name retrieval"""
    features = engineer.get_feature_names()

    assert isinstance(features, list)
    assert len(features) > 50  # Should have 50+ features

    # Check some key features
    assert 'amount_zscore' in features
    assert 'is_high_risk_country' in features
    assert 'behavioral_score' in features


def test_select_model_features(engineer, sample_data):
    """Test model feature selection"""
    df_with_features = engineer.extract_all_features(sample_data)
    result = engineer.select_model_features(df_with_features)

    # Should only have engineered features + label
    expected_features = engineer.get_feature_names()

    # All expected features should be present (plus label)
    for feat in expected_features:
        assert feat in result.columns


def test_high_risk_transaction_detection(engineer, sample_data):
    """Test that high-risk patterns are detected"""
    result = engineer.extract_all_features(sample_data)

    # Transaction 4 should be high-risk (Nigeria, Tor, new account, etc.)
    fraud_row = result.filter(pl.col('is_fraud') == 1)

    assert fraud_row['is_high_risk_country'][0] == 1
    assert fraud_row['is_tor'][0] == 1
    assert fraud_row['account_age_very_new'][0] == 1
    assert fraud_row['geo_distance_very_suspicious'][0] == 1


def test_feature_consistency(engineer, sample_data):
    """Test that features are consistently generated"""
    result1 = engineer.extract_all_features(sample_data)
    result2 = engineer.extract_all_features(sample_data)

    # Results should be identical
    assert result1.equals(result2)


def test_no_nan_values(engineer, sample_data):
    """Test that no NaN values are produced"""
    result = engineer.extract_all_features(sample_data)

    # Check for null values in numeric columns
    numeric_cols = result.select(pl.col(pl.NUMERIC_DTYPES)).columns

    for col in numeric_cols:
        assert result[col].null_count() == 0, f"Column {col} has null values"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
