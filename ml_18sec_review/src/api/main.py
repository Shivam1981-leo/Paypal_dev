"""FastAPI inference service for PayGuard AI fraud detection

High-performance REST API for real-time fraud risk scoring.
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
from typing import List, Dict, Optional
import numpy as np
import polars as pl
from datetime import datetime
import time
from pathlib import Path
import sys

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from src.models.fraud_detector import FraudDetector
from src.features.feature_engineering import FeatureEngineer


# Request/Response Models
class DeviceData(BaseModel):
    """Device and browser information"""
    device_id: str = Field(..., description="Unique device fingerprint")
    ip_address: str = Field(..., description="User IP address")
    user_agent: Optional[str] = Field(None, description="Browser user agent")
    vpn_detected: bool = Field(False, description="VPN detected")
    tor_detected: bool = Field(False, description="Tor network detected")
    device_reputation_score: float = Field(0.5, ge=0.0, le=1.0, description="Device trust score")


class SessionData(BaseModel):
    """User session behavior"""
    time_on_site_seconds: int = Field(..., ge=0, description="Time spent on site")
    pages_visited: int = Field(..., ge=1, description="Number of pages viewed")
    checkout_speed_seconds: int = Field(..., ge=0, description="Time to complete checkout")


class CartItem(BaseModel):
    """Shopping cart item"""
    name: str
    price: float = Field(..., gt=0)
    quantity: int = Field(..., ge=1)
    category: str
    is_digital: bool = False
    is_high_risk: bool = False


class FraudCheckRequest(BaseModel):
    """Fraud check API request"""
    transaction_id: Optional[str] = Field(None, description="Optional transaction ID")
    buyer_email: str = Field(..., description="Buyer email address")
    amount: float = Field(..., gt=0, description="Transaction amount")
    currency: str = Field("USD", description="Currency code")
    country: str = Field(..., min_length=2, max_length=2, description="2-letter country code")
    device_data: DeviceData
    session_data: SessionData
    cart_items: List[CartItem] = Field(default_factory=list)
    account_age_days: int = Field(0, ge=0, description="Account age in days")
    email_is_disposable: bool = Field(False)
    geo_ip_billing_distance_km: float = Field(0.0, ge=0, description="Distance between IP and billing address")

    @validator('country')
    def validate_country(cls, v):
        return v.upper()


class FeatureContribution(BaseModel):
    """Feature contribution to prediction"""
    feature: str
    impact: float
    value: float


class FraudCheckResponse(BaseModel):
    """Fraud check API response"""
    transaction_id: Optional[str]
    risk_score: float = Field(..., ge=0.0, le=1.0, description="Fraud probability (0-1)")
    risk_category: str = Field(..., description="GREEN, YELLOW, or RED")
    recommended_action: str = Field(..., description="PROCEED_PAYPAL, MANUAL_REVIEW, or BLOCK_TRANSACTION")
    flags: List[str] = Field(default_factory=list, description="Risk flags detected")
    explanation: Dict = Field(default_factory=dict, description="Model explanation")
    processing_time_ms: int = Field(..., description="Processing time in milliseconds")
    timestamp: str


# Initialize FastAPI app
app = FastAPI(
    title="PayGuard AI",
    description="Real-time fraud detection API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
model: Optional[FraudDetector] = None
feature_engineer: Optional[FeatureEngineer] = None


@app.on_event("startup")
async def load_model():
    """Load model on startup"""
    global model, feature_engineer

    try:
        print("\n🚀 Starting PayGuard AI API...")

        # Load model
        model_path = Path(__file__).parent.parent.parent / "models" / "production"
        if not model_path.exists():
            # Try v1 as fallback
            model_path = Path(__file__).parent.parent.parent / "models" / "v1"

        if model_path.exists():
            print(f"Loading model from {model_path}...")
            model = FraudDetector(str(model_path))
            print("✓ Model loaded successfully")
        else:
            print(f"⚠️  Model not found at {model_path}")
            print("   API will start but predictions will fail")
            print("   Run: python scripts/train_model.py")

        # Initialize feature engineer
        feature_engineer = FeatureEngineer()
        print("✓ Feature engineer initialized")

        print("\n✅ PayGuard AI API ready!\n")

    except Exception as e:
        print(f"❌ Error loading model: {e}")
        raise


@app.get("/")
async def root():
    """API root"""
    return {
        "service": "PayGuard AI",
        "version": "1.0.0",
        "status": "online",
        "model_loaded": model is not None
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "timestamp": datetime.now().isoformat()
    }


@app.post("/predict", response_model=FraudCheckResponse)
async def predict_fraud(request: FraudCheckRequest):
    """Predict fraud risk for a transaction"""

    start_time = time.time()

    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    try:
        # Convert request to DataFrame format
        transaction_data = request_to_dataframe(request)

        # Extract features
        features_df = feature_engineer.extract_all_features(transaction_data)
        feature_df = feature_engineer.select_model_features(features_df)

        # Remove label if present
        if 'is_fraud' in feature_df.columns:
            feature_df = feature_df.drop('is_fraud')

        # Get features as numpy array
        X = feature_df.to_numpy()

        # Predict with explanation
        fraud_prob, feature_impacts = model.predict_with_explanation(X, n_top_features=10)

        # Get risk category and action
        risk_category = model.get_risk_category(fraud_prob)
        recommended_action = model.get_recommended_action(risk_category)

        # Detect risk flags
        flags = detect_risk_flags(request, fraud_prob)

        # Calculate processing time
        processing_time_ms = int((time.time() - start_time) * 1000)

        # Build response
        response = FraudCheckResponse(
            transaction_id=request.transaction_id,
            risk_score=round(fraud_prob, 4),
            risk_category=risk_category,
            recommended_action=recommended_action,
            flags=flags,
            explanation={
                "top_features": [
                    {
                        "feature": f["feature"],
                        "impact": round(f["impact"], 4),
                        "value": round(f["value"], 2)
                    }
                    for f in feature_impacts
                ]
            },
            processing_time_ms=processing_time_ms,
            timestamp=datetime.now().isoformat()
        )

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


def request_to_dataframe(request: FraudCheckRequest) -> pl.DataFrame:
    """Convert API request to Polars DataFrame for feature extraction"""

    # Calculate cart features
    cart_item_count = len(request.cart_items)
    if cart_item_count > 0:
        digital_count = sum(1 for item in request.cart_items if item.is_digital)
        digital_ratio = digital_count / cart_item_count
        high_risk_count = sum(1 for item in request.cart_items if item.is_high_risk)
    else:
        digital_ratio = 0.0
        high_risk_count = 0

    data = {
        'transaction_id': [request.transaction_id or ""],
        'buyer_email': [request.buyer_email],
        'amount': [request.amount],
        'currency': [request.currency],
        'device_id': [request.device_data.device_id],
        'ip_address': [request.device_data.ip_address],
        'country': [request.country],
        'vpn_detected': [1 if request.device_data.vpn_detected else 0],
        'tor_detected': [1 if request.device_data.tor_detected else 0],
        'device_reputation_score': [request.device_data.device_reputation_score],
        'account_age_days': [request.account_age_days],
        'time_on_site_seconds': [request.session_data.time_on_site_seconds],
        'pages_visited': [request.session_data.pages_visited],
        'checkout_speed_seconds': [request.session_data.checkout_speed_seconds],
        'cart_item_count': [max(1, cart_item_count)],
        'digital_items_ratio': [digital_ratio],
        'high_risk_items_count': [high_risk_count],
        'email_is_disposable': [1 if request.email_is_disposable else 0],
        'geo_ip_billing_distance_km': [request.geo_ip_billing_distance_km],
        'timestamp': [datetime.now()]
    }

    return pl.DataFrame(data)


def detect_risk_flags(request: FraudCheckRequest, fraud_prob: float) -> List[str]:
    """Detect specific risk flags in the transaction"""

    flags = []

    # High-risk signals
    if request.device_data.vpn_detected:
        flags.append("VPN_DETECTED")

    if request.device_data.tor_detected:
        flags.append("TOR_DETECTED")

    if request.account_age_days < 7:
        flags.append("NEW_ACCOUNT")

    if request.device_data.device_reputation_score < 0.3:
        flags.append("LOW_DEVICE_REPUTATION")

    if request.session_data.checkout_speed_seconds < 20:
        flags.append("FAST_CHECKOUT")

    if request.session_data.pages_visited <= 2:
        flags.append("LOW_ENGAGEMENT")

    if request.geo_ip_billing_distance_km > 500:
        flags.append("GEO_MISMATCH")

    if request.email_is_disposable:
        flags.append("DISPOSABLE_EMAIL")

    if request.amount > 1000:
        flags.append("HIGH_AMOUNT")

    # Digital goods risk
    if request.cart_items:
        digital_ratio = sum(1 for item in request.cart_items if item.is_digital) / len(request.cart_items)
        if digital_ratio > 0.5:
            flags.append("MOSTLY_DIGITAL_GOODS")

    # High fraud probability
    if fraud_prob > 0.8:
        flags.append("HIGH_FRAUD_PROBABILITY")

    return flags


@app.get("/model/info")
async def model_info():
    """Get model information and metrics"""

    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    return {
        "version": "v1",
        "n_features": len(model.feature_names),
        "threshold": model.threshold,
        "metrics": model.metrics
    }


@app.get("/model/features")
async def feature_importance():
    """Get feature importance rankings"""

    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    importance = model.get_feature_importance(top_n=30)
    return {
        "top_features": importance
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc),
            "timestamp": datetime.now().isoformat()
        }
    )


if __name__ == "__main__":
    import uvicorn

    print("\n🚀 Starting PayGuard AI API Server...\n")

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
