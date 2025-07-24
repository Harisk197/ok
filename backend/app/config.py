from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # API Configuration
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    DEBUG: bool = True
    SECRET_KEY: str = "your-secret-key-change-in-production"

    # CORS Configuration
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ]

    # Ollama Configuration
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "deepseek-r1:8b"
    OLLAMA_TIMEOUT: int = 120

    # File Upload Configuration
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: List[str] = ["pdf", "jpg", "jpeg", "png"]

    # Database Configuration
    DATABASE_URL: str = "sqlite:///./legal_assistant.db"

    # OCR Configuration
    TESSERACT_CMD: str = "/usr/bin/tesseract"

    # Redis Configuration
    REDIS_URL: str = "redis://localhost:6379/0"

    # Logging
    LOG_LEVEL: str = "INFO"

    # ✅ Add these missing fields to match .env
    SESSION_SECRET_KEY: str = "session-secret-key-change-in-production-67890"
    SESSION_TIMEOUT: int = 3600

    class Config:
        env_file = ".env"
        case_sensitive = True

# Global settings instance
settings = Settings()
