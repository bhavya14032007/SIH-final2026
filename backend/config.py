import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Application configuration loaded from environment variables."""
    SECRET_KEY = os.getenv('SECRET_KEY', 'sanrakshak-dev-key-2026')
    DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///sanrakshak.db')
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
    WEATHER_API_KEY = os.getenv('WEATHER_API_KEY', '')

    # ML Configuration
    MODEL_PATH = os.path.join(os.path.dirname(__file__), 'ml', 'risk_model.pkl')
    MODEL_METADATA_PATH = os.path.join(os.path.dirname(__file__), 'ml', 'model_metadata.json')
    EXPERIMENTS_DIR = os.path.join(os.path.dirname(__file__), 'ml', 'experiments')
    MAX_EXPERIMENTS = 10

    # Simulation
    SIMULATION_DURATION_SECONDS = 45
    POLLING_INTERVAL_SECONDS = 3

    # Dataset paths
    RAW_DATA_DIR = os.path.join(os.path.dirname(__file__), 'data', 'raw')
    SYNTHETIC_DATA_DIR = os.path.join(os.path.dirname(__file__), 'data', 'synthetic')
