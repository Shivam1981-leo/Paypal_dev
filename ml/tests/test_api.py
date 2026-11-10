"""Unit tests for FastAPI inference service"""

import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path
from unittest.mock import Mock, patch
import numpy as np

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))


@pytest.fixture
def mock_model():
    """Mock FraudDetector model"""
    model = Mock()
    model.predict_with_explanation.return_value = (
        0.75,  # fraud_prob
        [
            {'feature': 'account_age', 'impact': 0.15, 'value': 5.0},
            {'feature': 'is_vpn', 'impact': 0.12, 'value': 1.0},
            {'feature': 'amount_zscore', 'impact': -0.08, 'value': 2.5}
        ]
    )
    model.get_risk_category.return_value = "RED"
    model.get_recommended_action.return_value = "BLOCK_TRANSACTION"
    model.threshold = 0.5
    model.metrics = {
        'auc_roc': 0.92,
        'precision': 0.88,
        'recall': 0.91
    }
    model.feature_names = ['feature_1', 'feature_2']
    model.get_feature_importance.return_value = [
        {'feature': 'account_age', 'importance': 0.25},
        {'feature': 'is_vpn', 'importance': 0.18}
    ]
    return model


@pytest.fixture
def client(mock_model):
    """Create test client with mocked model"""
    with patch('src.api.main.model', mock_model):
        with patch('src.api.main.feature_engineer'):
            from api.main import app
            client = TestClient(app)
            yield client


@pytest.fixture
def valid_request_data():
    """Valid fraud check request"""
    return {
        "transaction_id": "test_tx_123",
        "buyer_email": "test@example.com",
        "amount": 150.0,
        "currency": "USD",
        "country": "US",
        "device_data": {
            "device_id": "device_abc123",
            "ip_address": "192.168.1.100",
            "vpn_detected": False,
            "tor_detected": False,
            "device_reputation_score": 0.85
        },
        "session_data": {
            "time_on_site_seconds": 120,
            "pages_visited": 5,
            "checkout_speed_seconds": 45
        },
        "cart_items": [
            {
                "name": "Product A",
                "price": 75.0,
                "quantity": 2,
                "category": "Electronics",
                "is_digital": False,
                "is_high_risk": False
            }
        ],
        "account_age_days": 365,
        "email_is_disposable": False,
        "geo_ip_billing_distance_km": 15.5
    }


def test_root_endpoint(client):
    """Test root endpoint"""
    response = client.get("/")

    assert response.status_code == 200
    data = response.json()

    assert data['service'] == "PayGuard AI"
    assert data['version'] == "1.0.0"
    assert 'status' in data


def test_health_check(client):
    """Test health check endpoint"""
    response = client.get("/health")

    assert response.status_code == 200
    data = response.json()

    assert data['status'] == "healthy"
    assert 'timestamp' in data


def test_predict_fraud_success(client, valid_request_data, mock_model):
    """Test successful fraud prediction"""
    response = client.post("/predict", json=valid_request_data)

    assert response.status_code == 200
    data = response.json()

    # Check response structure
    assert 'risk_score' in data
    assert 'risk_category' in data
    assert 'recommended_action' in data
    assert 'flags' in data
    assert 'explanation' in data
    assert 'processing_time_ms' in data
    assert 'timestamp' in data

    # Check values
    assert 0.0 <= data['risk_score'] <= 1.0
    assert data['risk_category'] in ['GREEN', 'YELLOW', 'RED']
    assert data['recommended_action'] in ['PROCEED_PAYPAL', 'MANUAL_REVIEW', 'BLOCK_TRANSACTION']
    assert isinstance(data['flags'], list)
    assert isinstance(data['processing_time_ms'], int)


def test_predict_fraud_with_high_risk_signals(client):
    """Test prediction with high-risk signals"""
    request_data = {
        "buyer_email": "fraud@tempmail.com",
        "amount": 2000.0,
        "currency": "USD",
        "country": "NG",
        "device_data": {
            "device_id": "suspicious_device",
            "ip_address": "1.2.3.4",
            "vpn_detected": True,
            "tor_detected": True,
            "device_reputation_score": 0.1
        },
        "session_data": {
            "time_on_site_seconds": 15,
            "pages_visited": 1,
            "checkout_speed_seconds": 10
        },
        "cart_items": [],
        "account_age_days": 1,
        "email_is_disposable": True,
        "geo_ip_billing_distance_km": 1000.0
    }

    response = client.post("/predict", json=request_data)

    assert response.status_code == 200
    data = response.json()

    # Should detect multiple flags
    assert len(data['flags']) > 0
    expected_flags = ['VPN_DETECTED', 'TOR_DETECTED', 'NEW_ACCOUNT', 'LOW_DEVICE_REPUTATION']
    for flag in expected_flags:
        assert flag in data['flags']


def test_predict_fraud_missing_required_field(client):
    """Test request with missing required field"""
    invalid_request = {
        "buyer_email": "test@example.com",
        # Missing amount
        "currency": "USD",
        "country": "US"
    }

    response = client.post("/predict", json=invalid_request)

    assert response.status_code == 422  # Validation error


def test_predict_fraud_invalid_amount(client, valid_request_data):
    """Test request with invalid amount"""
    valid_request_data['amount'] = -100.0  # Negative amount

    response = client.post("/predict", json=valid_request_data)

    assert response.status_code == 422


def test_predict_fraud_invalid_country_code(client, valid_request_data):
    """Test request with invalid country code"""
    valid_request_data['country'] = "USA"  # Should be 2 letters

    response = client.post("/predict", json=valid_request_data)

    assert response.status_code == 422


def test_predict_fraud_country_uppercase_conversion(client, valid_request_data):
    """Test that country code is converted to uppercase"""
    valid_request_data['country'] = "us"  # lowercase

    response = client.post("/predict", json=valid_request_data)

    assert response.status_code == 200


def test_model_info_endpoint(client, mock_model):
    """Test model info endpoint"""
    response = client.get("/model/info")

    assert response.status_code == 200
    data = response.json()

    assert 'version' in data
    assert 'n_features' in data
    assert 'threshold' in data
    assert 'metrics' in data


def test_feature_importance_endpoint(client, mock_model):
    """Test feature importance endpoint"""
    response = client.get("/model/features")

    assert response.status_code == 200
    data = response.json()

    assert 'top_features' in data
    assert isinstance(data['top_features'], list)

    if len(data['top_features']) > 0:
        feat = data['top_features'][0]
        assert 'feature' in feat
        assert 'importance' in feat


def test_risk_flag_detection_vpn(client, valid_request_data):
    """Test VPN detection flag"""
    valid_request_data['device_data']['vpn_detected'] = True

    response = client.post("/predict", json=valid_request_data)
    data = response.json()

    assert 'VPN_DETECTED' in data['flags']


def test_risk_flag_detection_new_account(client, valid_request_data):
    """Test new account flag"""
    valid_request_data['account_age_days'] = 3

    response = client.post("/predict", json=valid_request_data)
    data = response.json()

    assert 'NEW_ACCOUNT' in data['flags']


def test_risk_flag_detection_high_amount(client, valid_request_data):
    """Test high amount flag"""
    valid_request_data['amount'] = 2500.0

    response = client.post("/predict", json=valid_request_data)
    data = response.json()

    assert 'HIGH_AMOUNT' in data['flags']


def test_risk_flag_detection_fast_checkout(client, valid_request_data):
    """Test fast checkout flag"""
    valid_request_data['session_data']['checkout_speed_seconds'] = 15

    response = client.post("/predict", json=valid_request_data)
    data = response.json()

    assert 'FAST_CHECKOUT' in data['flags']


def test_empty_cart_handling(client, valid_request_data):
    """Test handling of empty cart"""
    valid_request_data['cart_items'] = []

    response = client.post("/predict", json=valid_request_data)

    assert response.status_code == 200


def test_explanation_structure(client, valid_request_data):
    """Test explanation structure in response"""
    response = client.post("/predict", json=valid_request_data)
    data = response.json()

    assert 'explanation' in data
    assert 'top_features' in data['explanation']

    features = data['explanation']['top_features']
    assert isinstance(features, list)

    if len(features) > 0:
        feat = features[0]
        assert 'feature' in feat
        assert 'impact' in feat
        assert 'value' in feat


def test_response_time_reasonable(client, valid_request_data):
    """Test that response time is reasonable"""
    response = client.post("/predict", json=valid_request_data)
    data = response.json()

    # Should process in under 1 second (1000ms)
    assert data['processing_time_ms'] < 1000


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
