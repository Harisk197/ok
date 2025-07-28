from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi import Request, Header, Response
import uvicorn
import os
from typing import List, Optional
import asyncio
import json
from datetime import datetime
import uuid

from app.config import settings
from app.models.schemas import (
    ChatRequest, 
    ChatResponse, 
    UploadResponse, 
    HealthResponse,
    DocumentInfo,
    StreamingChatResponse,
    SessionInfo
)
from app.services.ollama_service import OllamaService
from app.services.document_service import DocumentService
from app.services.ocr_service import OCRService
from app.services.session_service import session_service
from app.utils.logger import get_logger

# Initialize logger
logger = get_logger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Smart Legal & Insurance Document Assistant API",
    description="AI-powered legal document analysis with DeepSeek-R1 via Ollama",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploaded documents
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Initialize services
ollama_service = OllamaService()
document_service = DocumentService()
ocr_service = OCRService()

# Session dependency
async def get_or_create_session(x_session_id: Optional[str] = Header(None)) -> str:
    """Get existing session or create new one"""
    logger.info(f"Session header received: {x_session_id}")
    
    if x_session_id:
        session = session_service.get_session(x_session_id)
        if session:
            logger.info(f"Using existing session: {x_session_id}")
            return x_session_id
        else:
            logger.warning(f"Session {x_session_id} not found, creating new one")
    
    # Create new session
    new_session_id = session_service.create_session()
    logger.info(f"Created new session: {new_session_id}")
    return new_session_id

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("Starting Legal Assistant API...")
    
    # Test Ollama connection
    try:
        await ollama_service.test_connection()
        logger.info("✅ Ollama connection successful")
    except Exception as e:
        logger.error(f"❌ Ollama connection failed: {e}")
        logger.warning("API will start but AI features may not work")
    
    # Start background task for session cleanup
    asyncio.create_task(cleanup_sessions_periodically())
    
    logger.info("🚀 Legal Assistant API started successfully")

async def cleanup_sessions_periodically():
    """Background task to clean up expired sessions"""
    while True:
        try:
            await asyncio.sleep(300)  # Run every 5 minutes
            session_service.cleanup_expired_sessions()
        except Exception as e:
            logger.error(f"Session cleanup error: {e}")

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    try:
        # Test Ollama connection
        try:
            ollama_status = await ollama_service.test_connection()
        except Exception:
            ollama_status = False
        
        return HealthResponse(
            status="healthy",
            timestamp=datetime.now(),
            services={
                "api": "running",
                "ollama": "connected" if ollama_status else "disconnected",
                "ocr": "available" if ocr_service.is_available() else "unavailable"
            },
            version="1.0.0"
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service unhealthy")

@app.post("/session")
async def create_session():
    """Create a new session"""
    try:
        session_id = session_service.create_session()
        return {"session_id": session_id, "message": "Session created successfully"}
    except Exception as e:
        logger.error(f"Session creation failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to create session")

@app.get("/session/{session_id}")
async def get_session_info(session_id: str):
    """Get session information"""
    try:
        session = session_service.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        documents = session_service.get_session_documents(session_id)
        return {
            "session": session,
            "documents": documents,
            "document_count": len(documents)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get session info failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to get session info")

@app.post("/upload-documents", response_model=UploadResponse)
async def upload_documents(
    files: List[UploadFile] = File(...),
    session_id: str = Depends(get_or_create_session)
):
    """Upload and process multiple documents"""
    try:
        logger.info(f"Received {len(files)} files for upload in session {session_id}")
        
        processed_documents = []
        failed_files = []
        
        for file in files:
            try:
                # Validate file
                if not document_service.validate_file(file):
                    failed_files.append(f"Invalid file: {file.filename}")
                    continue
                
                # Save file
                file_path = await document_service.save_file(file)
                
                # Extract text using OCR
                extracted_text = await ocr_service.extract_text(file_path)
                
                # Process document for legal analysis
                document_info = await document_service.process_document(
                    file_path, extracted_text, file.filename, session_id
                )
                
                processed_documents.append(document_info)
                logger.info(f"✅ Processed document: {file.filename} - {len(extracted_text)} chars extracted")
                
            except Exception as e:
                logger.error(f"Failed to process {file.filename}: {e}")
                failed_files.append(f"Failed to process {file.filename}: {str(e)}")
                continue
        
        if not processed_documents and failed_files:
            raise HTTPException(
                status_code=400,
                detail=f"All files failed to process: {'; '.join(failed_files)}"
            )
        
        message = f"Successfully processed {len(processed_documents)} documents"
        if failed_files:
            message += f". {len(failed_files)} files failed: {'; '.join(failed_files[:3])}"
        
        logger.info(f"Upload complete: {len(processed_documents)} documents in session {session_id}")
        
        response = UploadResponse(
            success=True,
            message=message,
            documents=processed_documents,
            total_documents=len(processed_documents),
            session_id=session_id
        )
        
        # Add session ID to response headers
        from fastapi import Response
        response_obj = Response()
        response_obj.headers["X-Session-ID"] = session_id
        
        return response
        
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat_with_documents(
    request: ChatRequest,
    session_id: str = Depends(get_or_create_session),
    response: Response
):
    """Chat with AI about uploaded documents - with streaming response"""
    try:
        logger.info(f"Chat request: {request.message[:100]}...")
        logger.info(f"Session ID: {session_id}")
        
        # Build context from documents and chat history
        context = await document_service.build_context(
            request.documents,
            session_id,
            request.history
        )
        
        logger.info(f"Built context with {len(context)} characters for session {session_id}")
        
        # Test Ollama connection before proceeding
        ollama_available = await ollama_service.test_connection()
        if not ollama_available:
            logger.error("Ollama service not available")
            async def ollama_error_response():
                error_response = {
                    'error': "AI service (Ollama) is not available. Please ensure Ollama is running and DeepSeek model is installed.",
                    'done': True,
                    'session_id': session_id
                }
                yield f"data: {json.dumps(error_response)}\n\n"
            
            return StreamingResponse(
                ollama_error_response(),
                media_type="text/plain",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "Access-Control-Allow-Origin": "*",
                    "X-Session-ID": session_id,
                }
            )
        
        if not context.strip():
            # No documents available
            async def no_documents_response():
                error_response = {
                    'error': "I don't see any documents uploaded yet. Please upload some legal documents first so I can help analyze them.",
                    'done': True,
                    'session_id': session_id
                }
                yield f"data: {json.dumps(error_response)}\n\n"
            
            return StreamingResponse(
                no_documents_response(),
                media_type="text/plain",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "Access-Control-Allow-Origin": "*",
                    "X-Session-ID": session_id,
                }
            )
        
        logger.info("Starting Ollama streaming...")
        
        # Create streaming response
        async def generate_response():
            try:
                logger.info("Calling ollama_service.stream_chat...")
                # Stream response from Ollama
                async for chunk in ollama_service.stream_chat(
                    message=request.message,
                    context=context,
                    history=request.history
                ):
                    logger.debug(f"Received chunk: {chunk[:50]}...")
                    # Format as Server-Sent Events
                    response_data = {
                        'content': chunk, 
                        'done': False,
                        'session_id': session_id
                    }
                    yield f"data: {json.dumps(response_data)}\n\n"
                
                logger.info("Ollama streaming completed")
                # Send completion signal
                completion_data = {
                    'content': '', 
                    'done': True,
                    'session_id': session_id
                }
                yield f"data: {json.dumps(completion_data)}\n\n"
                
            except Exception as e:
                logger.error(f"Streaming error: {e}")
                logger.error(f"Error type: {type(e)}")
                logger.error(f"Error details: {str(e)}")
                error_response = {
                    'error': f"AI service error: {str(e)}",
                    'done': True,
                    'session_id': session_id
                }
                yield f"data: {json.dumps(error_response)}\n\n"
        
        # Set response headers
        response.headers["X-Session-ID"] = session_id
        
        return StreamingResponse(
            generate_response(),
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
                "X-Session-ID": session_id,
            }
        )
        
    except Exception as e:
        logger.error(f"Chat failed: {e}")
        logger.error(f"Chat error type: {type(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents")
async def list_documents(session_id: str = Depends(get_or_create_session)):
    """List all uploaded documents"""
    try:
        logger.info(f"Listing documents for session: {session_id}")
        documents = await document_service.list_documents(session_id)
        logger.info(f"Found {len(documents)} documents in session {session_id}")
        
        response_data = {
            "documents": documents,
            "session_id": session_id,
            "count": len(documents)
        }
        
        logger.info(f"Returning documents response: {len(documents)} documents")
        return response_data
    except Exception as e:
        logger.error(f"Failed to list documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/documents/{document_id}")
async def delete_document(
    document_id: str,
    session_id: str = Depends(get_or_create_session)
):
    """Delete a specific document"""
    try:
        success = await document_service.delete_document(document_id, session_id)
        if not success:
            raise HTTPException(status_code=404, detail="Document not found")
        return {
            "message": "Document deleted successfully",
            "session_id": session_id
        }
    except Exception as e:
        logger.error(f"Failed to delete document: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/session/{session_id}")
async def delete_session(session_id: str):
    """Delete a session and all its documents"""
    try:
        success = session_service.cleanup_session(session_id)
        if not success:
            raise HTTPException(status_code=404, detail="Session not found")
        return {"message": "Session deleted successfully"}
    except Exception as e:
        logger.error(f"Failed to delete session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Smart Legal & Insurance Document Assistant API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )