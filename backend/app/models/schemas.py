from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class SessionInfo(BaseModel):
    session_id: str
    created_at: datetime
    last_activity: datetime
    document_count: int = 0

class ClauseType(str, Enum):
    SUPPORTIVE = "supportive"
    CRITICAL = "critical"
    NEUTRAL = "neutral"

class DocumentInfo(BaseModel):
    id: str
    name: str
    type: str
    size: int
    uploaded_at: datetime
    text_content: Optional[str] = None
    clauses: Optional[List[Dict[str, Any]]] = None
    file_path: str
    session_id: Optional[str] = None

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: Optional[datetime] = None

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    history: List[ChatMessage] = Field(default_factory=list)
    documents: List[DocumentInfo] = Field(default_factory=list)
    language: Optional[str] = "en"
    session_id: Optional[str] = None

class StreamingChatResponse(BaseModel):
    content: str
    done: bool
    error: Optional[str] = None
    session_id: Optional[str] = None
class ChatResponse(BaseModel):
    response: str
    timestamp: datetime
    sources: List[str] = Field(default_factory=list)
    confidence: Optional[float] = None

class Clause(BaseModel):
    number: str
    text: str
    confidence: float = Field(ge=0.0, le=1.0)
    type: ClauseType
    document_id: str

class UploadResponse(BaseModel):
    success: bool
    message: str
    documents: List[DocumentInfo]
    total_documents: int
    session_id: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    timestamp: datetime
    services: Dict[str, str]
    version: str

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)
    session_id: Optional[str] = None