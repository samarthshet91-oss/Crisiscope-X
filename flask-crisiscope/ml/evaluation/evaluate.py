"""
CRISISCOPE X — ML Model Evaluation Module
"""

from typing import Dict, Any
from backend.services.risk_service import risk_service

def evaluate_model() -> Dict[str, Any]:
    return risk_service.get_metrics()
