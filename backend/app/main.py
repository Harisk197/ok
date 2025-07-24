from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
from typing import List, Optional
import asyncio
import json
from datetime import datetime

from app.config import settings
from app.models.schemas import (
    ChatRequest, 
    ChatResponse, 
    UploadResponse, 
    HealthResponse,
    DocumentInfo
)
from app.services.ollama_service import OllamaService
from app.services.document_service import DocumentService
from app.services.ocr_service import OCRService
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
    
    logger.info("🚀 Legal Assistant API started successfully")

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    try:
        # Test Ollama connection
        ollama_status = await ollama_service.test_connection()
        
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

@app.post("/upload-documents", response_model=UploadResponse)
async def upload_documents(files: List[UploadFile] = File(...)):
    """Upload and process multiple documents"""
    try:
        logger.info(f"Received {len(files)} files for upload")
        
        processed_documents = []
        
        for file in files:
            # Validate file
            if not document_service.validate_file(file):
                raise HTTPException(
                    status_code=400, 
                    detail=f"Invalid file: {file.filename}"
                )
            
            # Save file
            file_path = await document_service.save_file(file)
            
            # Extract text using OCR
            extracted_text = await ocr_service.extract_text(file_path)
            
            # Process document for legal analysis
            document_info = await document_service.process_document(
                file_path, extracted_text, file.filename
            )
            
            processed_documents.append(document_info)
            logger.info(f"✅ Processed document: {file.filename}")
        
        return UploadResponse(
            success=True,
            message=f"Successfully processed {len(processed_documents)} documents",
            documents=processed_documents,
            total_documents=len(processed_documents)
        )
        
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat_with_documents(request: ChatRequest):
    """Chat with AI about uploaded documents - with streaming response"""
    try:
        logger.info(f"Chat request: {request.message[:100]}...")
        
        # Build context from documents and chat history
        context = await document_service.build_context(
            request.documents, 
            request.history
        )
        
        # Create streaming response
        async def generate_response():
            try:
                # Stream response from Ollama
                async for chunk in ollama_service.stream_chat(
                    message=request.message,
                    context=context,
                    history=request.history
                ):
                    # Format as Server-Sent Events
                    yield f"data: {json.dumps({'content': chunk, 'done': False})}\n\n"
                
                # Send completion signal
                yield f"data: {json.dumps({'content': '', 'done': True})}\n\n"
                
            except Exception as e:
                logger.error(f"Streaming error: {e}")
                error_response = {
                    'error': str(e),
                    'done': True
                }
                yield f"data: {json.dumps(error_response)}\n\n"
        
        return StreamingResponse(
            generate_response(),
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
            }
        )
        
    except Exception as e:
        logger.error(f"Chat failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents")
async def list_documents():
    """List all uploaded documents"""
    try:
        documents = await document_service.list_documents()
        return {"documents": documents}
    except Exception as e:
        logger.error(f"Failed to list documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/documents/{document_id}")
async def delete_document(document_id: str):
    """Delete a specific document"""
    try:
        success = await document_service.delete_document(document_id)
        if not success:
            raise HTTPException(status_code=404, detail="Document not found")
        return {"message": "Document deleted successfully"}
    except Exception as e:
        logger.error(f"Failed to delete document: {e}")
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