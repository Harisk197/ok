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
from app.services.session_service import session_service

logger = get_logger(__name__)

class DocumentService:
    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR
        self.max_file_size = settings.MAX_FILE_SIZE
        self.allowed_extensions = settings.ALLOWED_EXTENSIONS
        
        # Ensure upload directory exists
        os.makedirs(self.upload_dir, exist_ok=True)
    
    def validate_file(self, file: UploadFile) -> bool:
        """Validate uploaded file"""
        try:
            # Check file extension
            if not file.filename:
                logger.warning("File has no filename")
                return False
                
            file_ext = file.filename.split('.')[-1].lower()
            if file_ext not in self.allowed_extensions:
                logger.warning(f"Invalid file extension: {file_ext}")
                return False
            
            # Check file size (this is approximate, actual size check happens during upload)
            if hasattr(file, 'size') and file.size > self.max_file_size:
                logger.warning(f"File too large: {file.size} bytes")
                return False
            
            # Check for potentially malicious files
            if self._is_potentially_malicious(file.filename):
                logger.warning(f"Potentially malicious file: {file.filename}")
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"File validation error: {e}")
            return False
    
    def _is_potentially_malicious(self, filename: str) -> bool:
        """Check for potentially malicious file patterns"""
        dangerous_patterns = [
            '../', '..\\', '/etc/', '/var/', '/usr/',
            '.exe', '.bat', '.cmd', '.scr', '.vbs', '.js'
        ]
        filename_lower = filename.lower()
        return any(pattern in filename_lower for pattern in dangerous_patterns)
    
    async def save_file(self, file: UploadFile) -> str:
        """Save uploaded file to disk"""
        try:
            # Generate unique filename
            file_id = str(uuid.uuid4())
            file_ext = file.filename.split('.')[-1].lower()
            filename = f"{file_id}.{file_ext}"
            file_path = os.path.join(self.upload_dir, filename)
            
            # Reset file pointer to beginning
            await file.seek(0)
            
            # Save file
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                
                # Check actual file size
                if len(content) > self.max_file_size:
                    # Clean up the file if it was created
                    if os.path.exists(file_path):
                        os.remove(file_path)
                    raise ValueError(f"File size {len(content)} exceeds maximum {self.max_file_size}")
                
                await f.write(content)
            
            logger.info(f"✅ File saved: {filename}")
            return file_path
            
        except Exception as e:
            logger.error(f"File save error: {e}")
            # Clean up any partially created file
            if 'file_path' in locals() and os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except:
                    pass
            raise
    
    async def process_document(
        self, 
        file_path: str, 
        extracted_text: str, 
        original_filename: str,
        session_id: Optional[str] = None
    ) -> DocumentInfo:
        """Process document and extract legal information"""
        try:
            file_stats = os.stat(file_path)
            file_id = os.path.basename(file_path).split('.')[0]
            
            # Extract clauses from text (simple regex-based approach)
            from app.services.ocr_service import OCRService
            ocr_service = OCRService()
            clauses = ocr_service.extract_legal_clauses(extracted_text)
            
            document_info = DocumentInfo(
                id=file_id,
                name=original_filename,
                type=self._get_file_type(original_filename),
                size=file_stats.st_size,
                uploaded_at=datetime.now(),
                text_content=extracted_text,
                clauses=clauses,
                file_path=file_path,
                session_id=session_id
            )
            
            # Add to session if session_id provided
            if session_id:
                session_service.add_document_to_session(session_id, document_info)
            
            logger.info(f"✅ Document processed: {original_filename}")
            return document_info
            
        except Exception as e:
            logger.error(f"Document processing error: {e}")
            raise
    
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
        documents: List[DocumentInfo] = None,
        session_id: str = None,
        history: List[Dict[str, Any]] = None
    ) -> str:
        """Build context string from documents and history"""
        logger.info(f"Building context for session {session_id}")
        
        # Get documents from session if not provided
        if not documents and session_id:
            documents = session_service.get_session_documents(session_id)
            logger.info(f"Retrieved {len(documents)} documents from session")
        
        if not documents:
            documents = []
            logger.warning("No documents available for context building")
            
        context_parts = []
        
        # Add document content
        if documents:
            logger.info(f"Adding {len(documents)} documents to context")
            context_parts.append("=== UPLOADED DOCUMENTS ===")
            for doc in documents:
                context_parts.append(f"\n📄 **{doc.name}**")
                context_parts.append(f"Document Type: {doc.type}")
                context_parts.append(f"Upload Date: {doc.uploaded_at}")
                context_parts.append(f"File Size: {doc.size} bytes")
                
                if doc.text_content:
                    # Truncate very long content
                    content = doc.text_content[:8000] + "..." if len(doc.text_content) > 8000 else doc.text_content
                    context_parts.append("\n**Document Content:**")
                    context_parts.append(content)
                    logger.info(f"Added {len(content)} characters of content from {doc.name}")
                
                # Add extracted clauses
                if doc.clauses:
                    context_parts.append("\n**Key Clauses:**")
                    for clause in doc.clauses[:10]:  # First 10 clauses
                        clause_text = clause['text'][:400] + "..." if len(clause['text']) > 400 else clause['text']
                        context_parts.append(f"- Clause {clause['number']} ({clause['type']}): {clause_text}")
                    logger.info(f"Added {len(doc.clauses)} clauses from {doc.name}")
                
                context_parts.append("\n" + "-"*50)
        else:
            logger.warning("No documents provided for context building")
            context_parts.append("No documents have been uploaded yet.")
        
        final_context = "\n".join(context_parts)
        logger.info(f"Built context with {len(final_context)} total characters")
        return final_context
    
    async def list_documents(self, session_id: str = None) -> List[DocumentInfo]:
        """List all uploaded documents"""
        if session_id:
            return session_service.get_session_documents(session_id)
        return []
    
    async def get_document(self, document_id: str, session_id: str = None) -> Optional[DocumentInfo]:
        """Get specific document by ID"""
        if session_id:
            documents = session_service.get_session_documents(session_id)
            for doc in documents:
                if doc.id == document_id:
                    return doc
        return None
    
    async def delete_document(self, document_id: str, session_id: str = None) -> bool:
        """Delete document"""
        try:
            if session_id:
                doc = await self.get_document(document_id, session_id)
                if not doc:
                    return False
                
                # Delete file from disk
                if os.path.exists(doc.file_path):
                    os.remove(doc.file_path)
                
                # Remove from session
                session_service.remove_document_from_session(session_id, document_id)
                
                logger.info(f"✅ Document deleted: {document_id}")
                return True
            return False
            
        except Exception as e:
            logger.error(f"Document deletion error: {e}")
            return False