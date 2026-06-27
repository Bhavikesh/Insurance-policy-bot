#!/usr/bin/env python3
"""
Register all files currently in uploads/ into dataset/metadata.json via DocumentManager.

Usage:
  # from project root
  python scripts/import_uploads_to_metadata.py
"""
from pathlib import Path
import sys
import logging

# Ensure project root is on sys.path so `app` package can be imported when running from project root
project_root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(project_root))

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

try:
    from app.services.document_manager import DocumentManager
except Exception as exc:
    logger.error("Failed to import DocumentManager: %s", exc)
    logger.error("Make sure you're running this from the project root and app/ is a package.")
    raise

def main():
    dm = DocumentManager()
    uploads_dir = Path(project_root) / "uploads"
    if not uploads_dir.exists():
        logger.warning("uploads/ directory does not exist (%s). Nothing to import.", uploads_dir)
        return

    files = [p for p in sorted(uploads_dir.iterdir()) if p.is_file()]
    if not files:
        logger.info("No files found in uploads/ to register.")
        return

    added = 0
    for f in files:
        # Skip files that are already registered
        existing = dm.find_document_by_filename(f.name)
        if existing:
            logger.info("Already registered: %s (id=%s)", f.name, existing.get("id"))
            continue
        try:
            registered = dm.register_uploaded_document(file_path=str(f), filename=f.name, company=None)
            logger.info("Registered: %s -> id=%s", f.name, registered.get("id"))
            added += 1
        except Exception as e:
            logger.exception("Failed to register %s: %s", f.name, e)

    logger.info("Import complete. %d file(s) registered.", added)

if __name__ == "__main__":
    main()