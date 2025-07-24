import uuid
import time
from typing import Dict, Optional, List
from datetime import datetime, timedelta
from app.models.schemas import SessionInfo, DocumentInfo
from app.utils.logger import get_logger

logger = get_logger(__name__)

class SessionService:
    def __init__(self, session_timeout: int = 3600):
        self.sessions: Dict[str, SessionInfo] = {}
        self.session_documents: Dict[str, List[DocumentInfo]] = {}
        self.session_timeout = session_timeout
        
    def create_session(self) -> str:
        """Create a new session"""
        session_id = str(uuid.uuid4())
        now = datetime.now()
        
        session_info = SessionInfo(
            session_id=session_id,
            created_at=now,
            last_activity=now,
            document_count=0
        )
        
        self.sessions[session_id] = session_info
        self.session_documents[session_id] = []
        
        logger.info(f"✅ Created new session: {session_id}")
        return session_id
    
    def get_session(self, session_id: str) -> Optional[SessionInfo]:
        """Get session info"""
        if session_id not in self.sessions:
            return None
            
        session = self.sessions[session_id]
        
        # Check if session has expired
        if self._is_session_expired(session):
            self.cleanup_session(session_id)
            return None
            
        # Update last activity
        session.last_activity = datetime.now()
        return session
    
    def update_session_activity(self, session_id: str) -> bool:
        """Update session last activity"""
        if session_id in self.sessions:
            self.sessions[session_id].last_activity = datetime.now()
            return True
        return False
    
    def add_document_to_session(self, session_id: str, document: DocumentInfo) -> bool:
        """Add document to session"""
        if session_id not in self.sessions:
            return False
            
        document.session_id = session_id
        self.session_documents[session_id].append(document)
        self.sessions[session_id].document_count += 1
        self.update_session_activity(session_id)
        
        logger.info(f"✅ Added document {document.name} to session {session_id}")
        return True
    
    def get_session_documents(self, session_id: str) -> List[DocumentInfo]:
        """Get all documents for a session"""
        return self.session_documents.get(session_id, [])
    
    def remove_document_from_session(self, session_id: str, document_id: str) -> bool:
        """Remove document from session"""
        if session_id not in self.session_documents:
            return False
            
        documents = self.session_documents[session_id]
        for i, doc in enumerate(documents):
            if doc.id == document_id:
                documents.pop(i)
                self.sessions[session_id].document_count -= 1
                self.update_session_activity(session_id)
                logger.info(f"✅ Removed document {document_id} from session {session_id}")
                return True
        return False
    
    def cleanup_session(self, session_id: str) -> bool:
        """Clean up session and its documents"""
        if session_id in self.sessions:
            # Clean up documents
            documents = self.session_documents.get(session_id, [])
            for doc in documents:
                try:
                    import os
                    if os.path.exists(doc.file_path):
                        os.remove(doc.file_path)
                except Exception as e:
                    logger.error(f"Error removing file {doc.file_path}: {e}")
            
            # Remove from memory
            del self.sessions[session_id]
            if session_id in self.session_documents:
                del self.session_documents[session_id]
                
            logger.info(f"✅ Cleaned up session: {session_id}")
            return True
        return False
    
    def cleanup_expired_sessions(self):
        """Clean up all expired sessions"""
        expired_sessions = []
        
        for session_id, session in self.sessions.items():
            if self._is_session_expired(session):
                expired_sessions.append(session_id)
        
        for session_id in expired_sessions:
            self.cleanup_session(session_id)
            
        if expired_sessions:
            logger.info(f"✅ Cleaned up {len(expired_sessions)} expired sessions")
    
    def _is_session_expired(self, session: SessionInfo) -> bool:
        """Check if session has expired"""
        expiry_time = session.last_activity + timedelta(seconds=self.session_timeout)
        return datetime.now() > expiry_time
    
    def get_session_stats(self) -> Dict[str, int]:
        """Get session statistics"""
        return {
            "total_sessions": len(self.sessions),
            "total_documents": sum(len(docs) for docs in self.session_documents.values())
        }

# Global session service instance
session_service = SessionService()