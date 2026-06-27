from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pathlib import Path
import datetime
import logging
from typing import Optional

from app.services. document_manager import DocumentManager

router = APIRouter()
logger = logging.getLogger(__name__)

UPLOADS_DIR = Path("uploads")
UPLOADS_DIR.mkdir(exist_ok=True)

doc_manager = DocumentManager()


@router.post("/", summary="Upload a document")
async def upload_document(
    file: UploadFile = File(...),
    company: Optional[str] = Form(None)
):
    """Upload a file and register it in metadata."""
    allowed_extensions = {".pdf", ".docx", ".eml"}
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file_ext} not allowed.  Allowed: {', '.join(allowed_extensions)}"
        )

    timestamp = datetime.datetime.utcnow(). strftime("%Y%m%d_%H%M%S")
    original_stem = Path(file.filename).stem
    safe_filename = f"{original_stem}_{timestamp}{file_ext}"
    save_path = UPLOADS_DIR / safe_filename

    try:
        content = await file. read()
        with save_path.open("wb") as f:
            f.write(content)
        logger.info(f"Saved uploaded file to {save_path}")
    except Exception as exc:
        logger.exception(f"Failed to save upload: {exc}")
        raise HTTPException(status_code=500, detail=f"Failed to save file: {exc}")

    try:
        registered_doc = doc_manager.register_uploaded_document(
            file_path=str(save_path),
            filename=safe_filename,
            company=company,
        )
        logger.info(f"Registered document with id={registered_doc['id']}")
    except Exception as exc:
        logger.exception(f"Failed to register document: {exc}")
        try:
            save_path.unlink(missing_ok=True)
        except Exception:
            pass
        raise HTTPException(status_code=500, detail=f"Failed to register document: {exc}")

    return {
        "message": "Upload successful",
        "document": registered_doc,
        "filename": safe_filename,
        "document_id": registered_doc["id"]
    }


@router.get("/allowed-types")
async def get_allowed_types():
    return {"allowed_types": [".pdf", ".docx", ".eml"], "max_size_mb": 50}