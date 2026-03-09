"""
PACER Backend Configuration
Loads settings from .env file using Pydantic Settings.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # MongoDB
    MONGO_URI: str = "mongodb://localhost:27017"
    MONGO_DB_NAME: str = "pacer_db"

    # Gemini AI
    GEMINI_API_KEY: str = ""

    # File storage
    UPLOAD_DIR: str = "./uploads"
    BASE_URL: str = "http://localhost:8000"

    # Deduplication
    DEDUP_WINDOW_SECONDS: int = 30

    # Camera health
    CAMERA_INACTIVE_THRESHOLD_MINUTES: int = 10

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
