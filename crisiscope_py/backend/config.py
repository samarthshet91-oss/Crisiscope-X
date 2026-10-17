
import os
from pathlib import Path

APP_NAME = "CrisiscopeX"
APP_VERSION = "1.0.0"

DEBUG = os.getenv("CRISISCOPE_DEBUG", "false").lower() == "true"

# Project root: the directory containing the backend folder
PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Absolute path to the project's data directory
DATA_DIR = PROJECT_ROOT / "data"

# Optional environment configuration for deployment
HOST = os.getenv("CRISISCOPE_HOST", "0.0.0.0")
PORT = int(os.getenv("CRISISCOPE_PORT", "8000"))
