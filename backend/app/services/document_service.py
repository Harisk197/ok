import os
import uuid
import aiofiles
from typing import List, Optional, Dict, Any
from fastapi import UploadFile
from datetime import datetime
import json

from app.config import settings
from app.models.schemas import DocumentInfo
from app.utils.logger import get_logger

logger = get_logger(__name__)

class DocumentService:
    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR
        self.max_file_size = settings.MAX_FILE_SIZE
        self.allowed_extensions = settings.ALLOWED_EXTENSIONS
        
        # Ensure upload directory exists
        os.makedirs(self.upload_dir, exist_ok=True)
        
        # Simple in-memory storage for demo (use database in production)
        self.documents_db = {}
    
    def validate_file(self, file: UploadFile) -> bool:
        """Validate uploaded file"""
        try:
            # Check file extension
            if not file.filename:
                return False
                
            file_ext = file.filename.split('.')[-1].lower()
            if file_ext not in self.allowed_extensions:
                logger.warning(f"Invalid file extension: {file_ext}")
                return False
            
            # Check file size (this is approximate, actual size check happens during upload)
            if hasattr(file, 'size') and file.size > self.max_file_size:
                logger.warning(f"File too large: {file.size} bytes")
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"File validation error: {e}")
            return False
    
    async def save_file(self, file: UploadFile) -> str:
        """Save uploaded file to disk"""
        try:
            # Generate unique filename
            file_id = str(uuid.uuid4())
            file_ext = file.filename.split('.')[-1].lower()
            filename = f"{file_id}.{file_ext}"
            file_path = os.path.join(self.upload_dir, filename)
            
            # Save file
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                
                # Check actual file size
                if len(content) > self.max_file_size:
                    raise ValueError(f"File size {len(content)} exceeds maximum {self.max_file_size}")
                
                await f.write(content)
            
            logger.info(f"✅ File saved: {filename}")
            return file_path
            
        except Exception as e:
            logger.error(f"File save error: {e}")
            raise
    
    async def process_document(
        self, 
        file_path: str, 
        extracted_text: str, 
        original_filename: str
    ) -> DocumentInfo:
        """Process document and extract legal information"""
        try:
            file_stats = os.stat(file_path)
            file_id = os.path.basename(file_path).split('.')[0]
            
            # Extract clauses from text (simple regex-based approach)
            clauses = self._extract_clauses(extracted_text)
            
            document_info = DocumentInfo(
                id=file_id,
                name=original_filename,
                type=self._get_file_type(original_filename),
                size=file_stats.st_size,
                uploaded_at=datetime.now(),
                text_content=extracted_text,
                clauses=clauses,
                file_path=file_path
            )
            
            # Store in memory (use database in production)
            self.documents_db[file_id] = document_info
            
            logger.info(f"✅ Document processed: {original_filename}")
            return document_info
            
        except Exception as e:
            logger.error(f"Document processing error: {e}")
            raise
    
    def _extract_clauses(self, text: str) -> List[Dict[str, Any]]:
        """Extract clauses from document text"""
        import re
        
        clauses = []
        
        # Simple pattern to find numbered clauses
        clause_patterns = [
            r'(\d+\.\d+)\s+([A-Z][^.]*\.)',  # 12.2 Clause text.
            r'(Section\s+\d+)\s+([A-Z][^.]*\.)',  # Section 12 text.
            r'(Article\s+[IVX]+)\s+([A-Z][^.]*\.)',  # Article IV text.
            r'(\([a-z]\))\s+([A-Z][^.]*\.)',  # (a) text.
        ]
        
        for pattern in clause_patterns:
            matches = re.finditer(pattern, text, re.MULTILINE | re.IGNORECASE)
            for match in matches:
                clause_number = match.group(1)
                clause_text = match.group(2)
                
                if len(clause_text) > 20:  # Filter out very short matches
                    clauses.append({
                        "number": clause_number,
                        "text": clause_text.strip(),
                        "confidence": 0.8,  # Default confidence
                        "type": "neutral"
                    })
        
        return clauses[:10]  # Limit to first 10 clauses
    
    def _get_file_type(self, filename: str) -> str:
        """Get MIME type from filename"""
        ext = filename.split('.')[-1].lower()
        type_mapping = {
            'pdf': 'application/pdf',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png'
        }
        return type_mapping.get(ext, 'application/octet-stream')
    
    async def build_context(
        self, 
        documents: List[DocumentInfo], 
        history: List[Dict[str, Any]] = None
    ) -> str:
        """Build context string from documents and history"""
        context_parts = []
        
        # Add document content
        if documents:
            context_parts.append("=== UPLOADED DOCUMENTS ===")
            for doc in documents:
                context_parts.append(f"\n📄 **{doc.name}**")
                if doc.text_content:
                    # Truncate very long content
                    content = doc.text_content[:2000] + "..." if len(doc.text_content) > 2000 else doc.text_content
                    context_parts.append(content)
                
                # Add extracted clauses
                if doc.clauses:
                    context_parts.append("\n**Key Clauses:**")
                    for clause in doc.clauses[:5]:  # First 5 clauses
                        context_parts.append(f"- {clause['number']}: {clause['text'][:200]}...")
                
                context_parts.append("\n" + "-"*50)
        
        return "\n".join(context_parts)
    
    async def list_documents(self) -> List[DocumentInfo]:
        """List all uploaded documents"""
        return list(self.documents_db.values())
    
    async def get_document(self, document_id: str) -> Optional[DocumentInfo]:
        """Get specific document by ID"""
        return self.documents_db.get(document_id)
    
    async def delete_document(self, document_id: str) -> bool:
        """Delete document"""
        try:
            if document_id in self.documents_db:
                doc = self.documents_db[document_id]
                
                # Delete file from disk
                if os.path.exists(doc.file_path):
                    os.remove(doc.file_path)
                
                # Remove from memory
                del self.documents_db[document_id]
                
                logger.info(f"✅ Document deleted: {document_id}")
                return True
            return False
            
        except Exception as e:
            logger.error(f"Document deletion error: {e}")
            return False