# 🏛️ Smart Legal & Insurance Document Assistant

A complete **React + TypeScript + FastAPI** application with **AI-powered legal document analysis** using **Ollama DeepSeek-R1**.

## 🚀 **Quick Start Guide**

### **Prerequisites**
- **Node.js** (v16 or higher)
- **Python** (3.8 or higher)
- **Ollama** (for AI functionality)

---

## 📋 **Step-by-Step Setup**

### **Step 1: Install Ollama**

#### **Windows:**
1. Download from: https://ollama.ai/download
2. Install and run the installer
3. Open Command Prompt and run:
```cmd
ollama serve
```

#### **macOS/Linux:**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve
```

### **Step 2: Install AI Model**
```bash
# Pull the DeepSeek model (this may take a few minutes)
ollama pull deepseek-r1:8b

# Verify installation
ollama list
```

### **Step 3: Setup Backend**
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
python run.py
```

**Backend will be available at:** `http://localhost:8000`

### **Step 4: Setup Frontend**
```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

**Frontend will be available at:** `http://localhost:5173`

---

## 🔧 **Troubleshooting**

### **Common Issues:**

#### **1. Ollama Connection Error**
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not working, restart Ollama
ollama serve
```

#### **2. Model Not Found**
```bash
# List installed models
ollama list

# Install DeepSeek model if missing
ollama pull deepseek-r1:8b
```

#### **3. Backend Port Issues**
- Make sure port 8000 is not in use
- Check backend logs for any errors

#### **4. Frontend Connection Issues**
- Ensure backend is running on port 8000
- Check browser console for errors

---

## 🧪 **Testing the Setup**

### **1. Test Ollama Connection**
```bash
cd backend
python test_ollama.py
```

### **2. Test Backend Health**
Visit: `http://localhost:8000/health`

Should show:
```json
{
  "status": "healthy",
  "services": {
    "api": "running",
    "ollama": "connected",
    "ocr": "available"
  }
}
```

### **3. Test Full Application**
1. **Upload Documents**: Go to `http://localhost:5173/upload`
2. **Upload a PDF or image file**
3. **Go to Query Page**: Click "Proceed to Analysis"
4. **Ask a Question**: Type something like "What are the key terms?"
5. **Check Response**: Should get AI-powered analysis

---

## 📁 **Project Structure**

```
smart-legal-assistant/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py         # Main FastAPI app
│   │   ├── config.py       # Configuration
│   │   ├── services/       # Business logic
│   │   └── models/         # Data models
│   ├── uploads/            # Document storage
│   ├── requirements.txt    # Python dependencies
│   └── run.py             # Server startup script
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript types
│   ├── package.json        # Node dependencies
│   └── index.html         # Entry point
└── README.md              # This file
```

---

## 🌟 **Features**

- ✅ **Document Upload**: PDF, JPEG, PNG support
- ✅ **OCR Text Extraction**: Automatic text extraction from documents
- ✅ **AI Chat Interface**: ChatGPT-style interface with streaming responses
- ✅ **Voice Input**: Web Speech API integration
- ✅ **Multi-language Support**: English, Hindi, Hinglish
- ✅ **Document Preview**: Side-by-side document viewing
- ✅ **Clause Extraction**: Automatic legal clause identification

---

## 🔍 **Development**

### **Backend Development**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python run.py
```

### **Frontend Development**
```bash
cd frontend
npm run dev
```

### **API Documentation**
Visit: `http://localhost:8000/docs` for interactive API documentation

---

## 🚨 **Important Notes**

1. **Ollama must be running** before starting the backend
2. **DeepSeek model must be installed** for AI functionality
3. **Both backend and frontend** must be running simultaneously
4. **Upload directory** is created automatically in `backend/uploads/`

---

## 📞 **Support**

If you encounter issues:

1. **Check all services are running**:
   - Ollama: `ollama serve`
   - Backend: `python run.py`
   - Frontend: `npm run dev`

2. **Check the logs** in terminal for error messages

3. **Test individual components**:
   - Ollama: `python test_ollama.py`
   - Backend: `http://localhost:8000/health`
   - Frontend: `http://localhost:5173`

---

**🎉 You're all set! The application should now be running with full AI functionality.**