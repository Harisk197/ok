# 🏛️ Smart Legal & Insurance Document Assistant - Backend

A powerful **FastAPI backend** that integrates with **Ollama DeepSeek-R1:8b** for AI-powered legal document analysis. This backend provides document upload, OCR text extraction, and intelligent chat capabilities.

## 🌟 **Features**

### 🚀 **Core Functionality**
- ✅ **Multi-Document Upload**: PDF, JPEG, PNG support with validation
- ✅ **OCR Text Extraction**: Tesseract integration for image and PDF processing
- ✅ **AI Chat Integration**: DeepSeek-R1:8b via Ollama for legal analysis
- ✅ **Real-Time Streaming**: Server-Sent Events for streaming AI responses
- ✅ **Document Management**: Upload, list, and delete documents
- ✅ **Legal Clause Extraction**: Automatic identification of contract clauses

### 🔧 **Technical Features**
- ✅ **FastAPI Framework**: Modern async Python web framework
- ✅ **Ollama Integration**: Local DeepSeek-R1:8b model support
- ✅ **OCR Processing**: Tesseract for text extraction from images/PDFs
- ✅ **File Validation**: Size limits, type checking, and security
- ✅ **CORS Support**: Frontend integration ready
- ✅ **Comprehensive Logging**: Detailed logging for debugging
- ✅ **Error Handling**: Robust error handling and user feedback

## 📋 **Prerequisites**

### **1. System Requirements**
- Python 3.8+ (recommended: Python 3.11)
- Ollama installed and running
- Tesseract OCR engine

### **2. Install Ollama**
```bash
# Install Ollama (Linux/macOS)
curl -fsSL https://ollama.ai/install.sh | sh

# For Windows, download from: https://ollama.ai/download

# Start Ollama service
ollama serve

# Pull DeepSeek-R1:8b model
ollama pull deepseek-r1:8b

# Verify the model is installed
ollama list
```

### **3. Install Tesseract OCR**
```bash
# Ubuntu/Debian
sudo apt-get install tesseract-ocr

# macOS
brew install tesseract

# Windows
# Download from: https://github.com/UB-Mannheim/tesseract/wiki
```

## 🚀 **Quick Start**

### **1. Clone and Setup**
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Linux/macOS:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### **2. Configuration**
```bash
# Copy environment template
cp .env.example .env

# Edit configuration (optional)
nano .env
```

### **3. Start the Server**
```bash
# Method 1: Use the main startup script (recommended)
python run.py

# Method 2: Use alternative startup script
python start_server.py

# Method 3: Use uvicorn directly (if above methods don't work)
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### **4. Verify Installation**
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Root Endpoint**: http://localhost:8000/

## 📁 **Project Structure**

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py              # Configuration settings
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py         # Pydantic models and schemas
│   ├── services/
│   │   ├── __init__.py
│   │   ├── ollama_service.py  # Ollama DeepSeek integration
│   │   ├── document_service.py # Document processing and management
│   │   └── ocr_service.py     # OCR text extraction
│   └── utils/
│       ├── __init__.py
│       └── logger.py          # Logging configuration
├── uploads/                   # Document storage directory
├── requirements.txt           # Python dependencies
├── .env.example              # Environment configuration template
├── run.py                    # Server startup script
└── README.md                 # This file
```

## 🔌 **API Endpoints**

### **Core Endpoints**

#### **1. Health Check**
```http
GET /health
```
**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-08T10:00:00Z",
  "services": {
    "api": "running",
    "ollama": "connected",
    "ocr": "available"
  },
  "version": "1.0.0"
}
```

#### **2. Upload Documents**
```http
POST /upload-documents
Content-Type: multipart/form-data
```
**Request:** Multiple files in form data
**Response:**
```json
{
  "success": true,
  "message": "Successfully processed 2 documents",
  "documents": [...],
  "total_documents": 2
}
```

#### **3. Chat with AI**
```http
POST /chat
Content-Type: application/json
```
**Request:**
```json
{
  "message": "Can I terminate my contract early?",
  "history": [...],
  "documents": [...],
  "language": "en"
}
```
**Response:** Streaming Server-Sent Events

#### **4. List Documents**
```http
GET /documents
```

#### **5. Delete Document**
```http
DELETE /documents/{document_id}
```

## 🤖 **Ollama DeepSeek Integration**

### **Model Configuration**
The backend is configured to use **DeepSeek-R1:8b** model via Ollama:

```python
# Configuration in app/config.py
OLLAMA_BASE_URL = "http://localhost:11434"
OLLAMA_MODEL = "deepseek-r1:8b"
OLLAMA_TIMEOUT = 120
```

### **AI Capabilities**
- **Legal Document Analysis**: Specialized prompts for legal content
- **Clause Identification**: Automatic extraction of contract clauses
- **Question Answering**: Context-aware responses about documents
- **Streaming Responses**: Real-time response generation
- **Multi-turn Conversations**: Maintains conversation context

### **System Prompt**
The AI is configured with a specialized legal assistant prompt that:
- Analyzes legal and insurance documents
- Provides clear explanations of complex legal language
- Identifies key clauses and potential risks
- Maintains professional tone
- Cites specific document sections

## 📄 **OCR Text Extraction**

### **Supported Formats**
- **PDF Files**: Direct text extraction + OCR fallback
- **Images**: JPEG, PNG with Tesseract OCR
- **Multi-page**: Handles multi-page documents

### **OCR Features**
- **Automatic Text Extraction**: From uploaded documents
- **Clause Detection**: Regex-based clause identification
- **Error Handling**: Graceful fallback for OCR failures
- **Performance**: Async processing to avoid blocking

## ⚙️ **Configuration Options**

### **Environment Variables** (`.env`)
```bash
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
SECRET_KEY=your-secret-key-here

# CORS Origins (for frontend)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=deepseek-r1:8b
OLLAMA_TIMEOUT=120

# File Upload Limits
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_EXTENSIONS=pdf,jpg,jpeg,png

# OCR Configuration
TESSERACT_CMD=/usr/bin/tesseract

# Logging
LOG_LEVEL=INFO
```

## 🔧 **Development**

### **Running in Development Mode**
```bash
# With auto-reload
python run.py

# Or with uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### **Testing the API**
```bash
# Test health endpoint
curl http://localhost:8000/health

# Test file upload
curl -X POST "http://localhost:8000/upload-documents" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "files=@your-document.pdf"

# Test chat endpoint
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "What are the key terms in this contract?"}'
```

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. Ollama Connection Failed**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama if not running
ollama serve

# Pull DeepSeek model if missing
ollama pull deepseek-r1:8b
```

#### **2. OCR Not Working**
```bash
# Check Tesseract installation
tesseract --version

# Install Tesseract if missing
sudo apt-get install tesseract-ocr  # Ubuntu/Debian
brew install tesseract              # macOS
```

#### **3. File Upload Issues**
- Check file size limits (default: 10MB)
- Verify file extensions are allowed
- Ensure upload directory has write permissions

#### **4. CORS Issues**
- Add your frontend URL to `CORS_ORIGINS` in `.env`
- Restart the server after configuration changes

## 📊 **Performance Considerations**

### **Optimization Tips**
- **File Size**: Keep uploads under 10MB for best performance
- **OCR Processing**: Large images may take longer to process
- **AI Responses**: DeepSeek-R1:8b responses typically take 5-30 seconds
- **Memory Usage**: Monitor memory with large document uploads

### **Production Deployment**
- Use a proper database (PostgreSQL) instead of in-memory storage
- Add Redis for caching and session management
- Use a reverse proxy (nginx) for static file serving
- Implement proper authentication and authorization
- Add rate limiting and request validation

## 🔐 **Security Notes**

- **File Validation**: All uploads are validated for type and size
- **Path Security**: File paths are sanitized to prevent directory traversal
- **Input Sanitization**: All user inputs are validated
- **CORS Configuration**: Properly configured for frontend integration
- **Error Handling**: Sensitive information is not exposed in error messages

## 🤝 **Integration with Frontend**

This backend is designed to work seamlessly with the React frontend:

1. **CORS**: Pre-configured for frontend origins
2. **API Endpoints**: Match frontend service calls
3. **Response Format**: Compatible with frontend data models
4. **Streaming**: Server-Sent Events for real-time chat
5. **File Handling**: Supports frontend upload component

## 📈 **Next Steps**

### **Production Enhancements**
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] User authentication and authorization
- [ ] Document versioning and history
- [ ] Advanced OCR with layout detection
- [ ] Caching layer with Redis
- [ ] Rate limiting and API quotas
- [ ] Monitoring and analytics
- [ ] Docker containerization
- [ ] CI/CD pipeline setup

---

**🎉 Backend Complete!** This FastAPI backend provides a robust foundation for AI-powered legal document analysis with DeepSeek-R1:8b integration via Ollama.