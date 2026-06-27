import os
import shutil
from pathlib import Path
from typing import Optional
import hashlib
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class FileHandler:
    ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc", ".eml"}
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
    
    def __init__(self, upload_dir: str = "uploads"):
        self.upload_dir = Path(upload_dir)
        self.upload_dir.mkdir(exist_ok=True)
    
    def validate_file(self, filename: str, file_size: int) -> tuple[bool, Optional[str]]:
        """
        Validate uploaded file.
        Returns (is_valid, error_message)
        """
        # Check extension
        ext = Path(filename).suffix.lower()
        if ext not in self.ALLOWED_EXTENSIONS:
            return False, f"Invalid file type. Allowed: {', '.join(self.ALLOWED_EXTENSIONS)}"
        
        # Check size
        if file_size > self.MAX_FILE_SIZE:
            max_mb = self.MAX_FILE_SIZE / (1024 * 1024)
            return False, f"File too large. Maximum size: {max_mb}MB"
        
        # Check filename
        if not filename or filename.startswith('.'):
            return False, "Invalid filename"
        
        return True, None
    
    def generate_safe_filename(self, original_filename: str) -> str:
        """Generate safe, unique filename"""
        # Get extension
        ext = Path(original_filename).suffix.lower()
        
        # Create hash from original name + timestamp
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        hash_input = f"{original_filename}_{timestamp}".encode()
        file_hash = hashlib.md5(hash_input).hexdigest()[:8]
        
        # Clean original name
        clean_name = Path(original_filename).stem
        clean_name = "".join(c if c.isalnum() or c in ('-', '_') else '_' for c in clean_name)
        clean_name = clean_name[:50]  # Limit length
        
        # Combine: cleanname_timestamp_hash.ext
        safe_filename = f"{clean_name}_{timestamp}_{file_hash}{ext}"
        
        return safe_filename
    
    async def save_uploaded_file(self, file_content: bytes, filename: str) -> tuple[str, str]:
        """
        Save uploaded file to disk.
        Returns (file_path, safe_filename)
        """
        # Validate
        is_valid, error = self.validate_file(filename, len(file_content))
        if not is_valid:
            raise ValueError(error)
        
        # Generate safe filename
        safe_filename = self.generate_safe_filename(filename)
        file_path = self.upload_dir / safe_filename
        
        # Save file
        try:
            with open(file_path, 'wb') as f:
                f.write(file_content)
            
            logger.info(f"Saved uploaded file: {safe_filename} ({len(file_content)} bytes)")
            return str(file_path), safe_filename
        
        except Exception as e:
            logger.error(f"Failed to save file: {e}")
            raise ValueError(f"Failed to save file: {str(e)}")
    
    def delete_file(self, file_path: str) -> bool:
        """Delete a file from uploads directory"""
        try:
            path = Path(file_path)
            
            # Security check: file must be in uploads directory
            if not str(path.resolve()).startswith(str(self.upload_dir.resolve())):
                logger.warning(f"Attempted to delete file outside uploads dir: {file_path}")
                return False
            
            if path.exists():
                path.unlink()
                logger.info(f"Deleted file: {file_path}")
                return True
            
            return False
        
        except Exception as e:
            logger.error(f"Failed to delete file: {e}")
            return False
    
    def get_file_info(self, file_path: str) -> Optional[dict]:
        """Get information about a file"""
        try:
            path = Path(file_path)
            
            if not path.exists():
                return None
            
            stat = path.stat()
            
            return {
                "filename": path.name,
                "size": stat.st_size,
                "extension": path.suffix.lower(),
                "created_at": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                "modified_at": datetime.fromtimestamp(stat.st_mtime).isoformat()
            }
        
        except Exception as e:
            logger.error(f"Failed to get file info: {e}")
            return None
