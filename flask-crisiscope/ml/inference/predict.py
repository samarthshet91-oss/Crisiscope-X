"""
CRISISCOPE X — ML Inference Module
Provides portable inference execution for binary inundation risk.
"""

from typing import Dict, Any
from backend.services.risk_service import risk_service

def predict(features: Dict[str, float]) -> Dict[str, Any]:
    return risk_service.predict_inundation_risk(features)
