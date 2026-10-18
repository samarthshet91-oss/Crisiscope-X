"""
CRISISCOPE X — Application Configuration & Environment Settings
Tailored for IBM LinuxONE (s390x) and Enterprise Linux environments.
"""

import os
import platform
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Service identity
    APP_NAME = "CRISISCOPE X"
    TAGLINE = "AI for a Safer Tomorrow"
    VERSION = "2.0.0"

    # Server configuration
    PORT = int(os.environ.get("PORT", 3000))
    HOST = os.environ.get("HOST", "0.0.0.0")
    DEBUG = os.environ.get("DEBUG", "False").lower() in ("true", "1", "yes")
    SECRET_KEY = os.environ.get("SECRET_KEY", "crisiscope-x-linuxone-enterprise-secret-key-2026")

    # Database configuration
    DATABASE_URL = os.environ.get(
        "DATABASE_URL",
        "postgresql://postgres:crisiscope@localhost:5432/crisiscope_db"
    )

    # Machine Learning model paths
    ML_MODEL_PATH = os.environ.get("ML_MODEL_PATH", "ml/models/inundation_model.pkl")
    ML_DATASET_PATH = os.environ.get("ML_DATASET_PATH", "ml/data/synthetic_dataset.csv")

    # Target Hardware & OS Architecture Detection
    SYSTEM_ARCH = platform.machine()
    IS_LINUXONE = SYSTEM_ARCH.lower() in ("s390x", "s390", "ibm-z")

    @classmethod
    def get_system_summary(cls):
        return {
            "platform": platform.platform(),
            "machine": cls.SYSTEM_ARCH,
            "is_linuxone_s390x": cls.IS_LINUXONE,
            "python_version": platform.python_version(),
            "target_architecture": "IBM LinuxONE / s390x Enterprise Linux",
            "database_configured": bool(cls.DATABASE_URL),
        }
