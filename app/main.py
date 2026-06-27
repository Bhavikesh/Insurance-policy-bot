from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.routers import documents, upload, hackrx
from app.config import get_settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

settings = get_settings()
allowed_origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",") if origin.strip()]

app = FastAPI(title="Document Processing API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(documents.router, prefix="/documents", tags=["Documents"])
app.include_router(upload.router, prefix="/upload", tags=["Upload"])
app.include_router(hackrx.router, prefix="/hackrx", tags=["Query"])


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "document-processing-api"}


@app.get("/")
async def root():
    return {"message": "Document Processing API", "docs": "/docs"}  