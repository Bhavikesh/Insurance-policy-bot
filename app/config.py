
from dotenv import load_dotenv
import os

# Load .env file explicitly
load_dotenv()

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # API Configuration
    APP_NAME: str = "Intelligent Document Processing API"
    API_VERSION: str = "v1"
    DEBUG: bool = False
    # Include both localhost and 127.0.0.1 for dev servers (Vite uses 127.0.0.1 by default)
    ALLOWED_ORIGINS: str = (
        "http://127.0.0.1:5173,http://localhost:5173,"
        "http://127.0.0.1:3000,http://localhost:3000"
    )
    
    # Authentication
    BEARER_TOKEN: str
    
    # LLM Configuration

    # LLM Configuration
    GROQ_API_KEY: str
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    LLM_MAX_TOKENS: int = 2000  # NEW: Increased from default
    LLM_TEMPERATURE: float = 0.1 
    
    # Embedding Configuration
    EMBEDDING_MODEL: str = "sentence-transformers/all-mpnet-base-v2"
    EMBEDDING_DIMENSION: int = 768
    
    # Chunking Configuration
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 100
    
    # Retrieval Configuration
    TOP_K_CHUNKS: int = 5
    SIMILARITY_THRESHOLD: float = 0.3
    
    # Database Configuration
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/docprocessing"
    
    # Performance
    MAX_WORKERS: int = 4
    TIMEOUT_SECONDS: int = 25
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings():
    return Settings()