# 🏛️ Smart Legal & Insurance Document Assistant

A premium **React + TypeScript + Tailwind CSS** application that helps users analyze legal and insurance documents using AI-powered assistance. This application provides an intuitive **ChatGPT-style interface** for uploading documents, asking questions via text or voice, and receiving detailed analysis with real-time streaming responses.

## 🌟 **Complete Frontend Features**

### 🚀 **Core Functionality**
- ✅ **Multi-Document Upload**: Drag & drop support for PDF, JPEG, PNG with progress indicators
- ✅ **Real Voice Input**: Web Speech API integration for voice-to-text conversion
- ✅ **ChatGPT-Style Interface**: Multi-turn persistent chat with message bubbles
- ✅ **Real-Time Streaming**: Word-by-word AI response display with typing indicators
- ✅ **Document Preview**: Interactive viewer with clause highlighting and glassmorphism effects
- ✅ **Trilingual Support**: English, Hindi, and Hinglish with live language switching

### 🎨 **Premium UI/UX**
- ✅ **Glassmorphism Design**: Deep shadows, blur effects, and premium aesthetics
- ✅ **Responsive Layout**: Fully optimized for mobile, tablet, and desktop
- ✅ **Framer Motion Animations**: Smooth micro-interactions and page transitions
- ✅ **Accessibility Ready**: ARIA roles, focus rings, and keyboard navigation
- ✅ **Modern Chat Interface**: WhatsApp/ChatGPT-style bubbles with copy functionality

### 🔧 **Technical Features**
- ✅ **TypeScript**: Full type safety with comprehensive interfaces
- ✅ **Zustand/Context API**: Advanced state management for chat and documents
- ✅ **Axios Integration**: Ready for FastAPI backend communication
- ✅ **Web Speech API**: Real voice recognition and transcription
- ✅ **Component Architecture**: Modular, reusable components
- ✅ **Error Handling**: Comprehensive validation and user feedback

## 📁 **Enhanced Project Structure**

```
src/
├── components/
│   ├── Chat/
│   │   ├── ChatInterface.tsx    # Main chat component with voice input
│   │   ├── ChatBubble.tsx       # Individual message bubbles
│   │   ├── StreamingText.tsx    # Real-time text streaming
│   │   └── TypingIndicator.tsx  # AI typing animation
│   ├── Layout/
│   │   ├── Navigation.tsx      # Main navigation bar
│   │   └── Layout.tsx          # App layout wrapper
│   ├── FileUpload/
│   │   └── FileUpload.tsx      # Enhanced upload with progress & previews
│   ├── LanguageToggle/
│   │   └── LanguageToggle.tsx  # Language switcher with flags
│   └── DocumentPreview/
│       └── DocumentPreview.tsx # Enhanced document viewer
├── hooks/
│   └── useSpeechRecognition.ts # Web Speech API hook
├── services/
│   └── api.ts                  # Axios API service layer
├── pages/
│   ├── Home.tsx               # Landing page
│   ├── Upload.tsx             # Document upload page
│   └── Query.tsx              # Chat interface page
├── contexts/
│   └── LanguageContext.tsx    # Trilingual support context
├── types/
│   ├── index.ts               # Main type definitions
│   └── global.d.ts            # Web Speech API types
├── data/
│   └── mockData.ts            # Sample data and responses
└── App.tsx                    # Main app component
```

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js (v14 or higher)
- npm or yarn package manager
- Modern browser with Web Speech API support

### **Installation**
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### **Development**
Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### **Build for Production**
```bash
npm run build
```

## 🛠 **Technologies Used**

### **Frontend Stack**
- **React 18** - Modern UI framework with hooks
- **TypeScript** - Type safety and enhanced development experience
- **Tailwind CSS** - Utility-first CSS with custom glassmorphism effects
- **Framer Motion** - Advanced animations and micro-interactions
- **Axios** - HTTP client for API communication
- **Web Speech API** - Native browser voice recognition
- **React Router** - Client-side routing and navigation
- **Lucide React** - Beautiful icon library
- **Vite** - Lightning-fast build tool and development server

## 📄 **Pages Overview**

### **1. Home Page (`/`)**
- Premium landing page with glassmorphism effects
- Feature showcase with animated cards and statistics
- Call-to-action for document upload
- Responsive design with mobile-first approach

### **2. Upload Page (`/upload`)**
- Advanced drag-and-drop interface with progress indicators
- Real-time file validation and error handling
- Image previews and file metadata display
- Batch upload support with individual file management
- Seamless navigation to chat interface

### **3. Query/Chat Page (`/query`)**
- **ChatGPT-style interface** with message bubbles
- **Real voice input** using Web Speech API
- **Streaming AI responses** with typing indicators
- **Multi-turn conversations** with persistent history
- **Copy, regenerate, and clear chat** functionality
- **Side-by-side document preview** with clause highlighting

## 🔧 **Implementation Status**

### ✅ **Fully Implemented Frontend Features**
- ✅ **ChatGPT-style chat interface** with message bubbles
- ✅ **Real Web Speech API integration** for voice input
- ✅ **Streaming text responses** with word-by-word display
- ✅ **Advanced file upload** with drag-drop and progress
- ✅ **Trilingual support** (English, Hindi, Hinglish)
- ✅ **Glassmorphism design** with premium aesthetics
- ✅ **Full responsiveness** across all devices
- ✅ **Accessibility features** with ARIA support
- ✅ **Copy, regenerate, clear chat** functionality
- ✅ **Document preview** with clause highlighting

### 🔄 **Ready for Backend Integration**
- **API Service Layer**: Axios configured for FastAPI endpoints
- **Document Processing**: Ready for OCR and PDF parsing integration
- **AI Responses**: Mock streaming ready for real LLM integration
- **File Storage**: Ready for cloud storage integration

## 🔌 **Backend Integration Points**

### **FastAPI Endpoints Ready**
The frontend is fully prepared for FastAPI backend integration:

1. **POST /upload-documents**
   - **Location**: `src/services/api.ts` → `uploadDocuments()`
   - **Ready for**: Multi-file upload with progress tracking
   - **Supports**: PDF, JPEG, PNG files up to 10MB each

2. **POST /chat**
   - **Location**: `src/services/api.ts` → `sendChatMessage()`
   - **Ready for**: Multi-turn conversations with DeepSeek-R1
   - **Supports**: Message history and context preservation

3. **GET /health**
   - **Location**: `src/services/api.ts` → `healthCheck()`
   - **Ready for**: Backend health monitoring

### **Environment Variables**
Create a `.env` file for API configuration:
```env
VITE_API_BASE_URL=http://localhost:8000
```

## 🎯 **Key Features Showcase**

### **🗣️ Voice Input**
```typescript
// Real Web Speech API integration
const { transcript, isListening, startListening } = useSpeechRecognition();
```

### **💬 Chat Interface**
```typescript
// ChatGPT-style message bubbles with streaming
<ChatInterface 
  messages={chatMessages}
  onSendMessage={handleSendMessage}
  isLoading={isLoading}
/>
```

### **📁 Advanced File Upload**
```typescript
// Drag-drop with progress and previews
<FileUpload 
  onFilesUploaded={handleFilesUploaded}
  uploadedFiles={uploadedFiles}
/>
```

### **🌐 Trilingual Support**
```typescript
// Dynamic language switching
const { t, language, setLanguage } = useLanguage();
```

## 📱 **Responsive Design**

- **Mobile First**: < 768px - Touch-optimized single column
- **Tablet**: 768px - 1024px - Adaptive grid layouts  
- **Desktop**: > 1024px - Full multi-column experience
- **Ultra-wide**: > 1440px - Enhanced spacing and typography

## 🎨 **Design System**

### **Colors**
- **Primary Gradient**: Blue to Purple (`from-blue-600 to-purple-600`)
- **Success**: Green shades for positive feedback
- **Warning**: Amber/Yellow for attention
- **Error**: Red shades for critical issues
- **Glassmorphism**: White/blur overlays with transparency

### **Typography**
- **Headings**: Bold, gradient text effects
- **Body**: 150% line height for readability
- **Code**: Monospace with syntax highlighting
- **Multilingual**: Proper font stacks for Hindi/English

### **Animations**
- **Framer Motion**: Smooth page transitions and micro-interactions
- **Glassmorphism**: Blur effects and backdrop filters
- **Loading States**: Skeleton screens and progress indicators
- **Voice Feedback**: Pulsing animations during speech recognition

## 🚀 **Next Steps: Backend Integration**

The frontend is **100% ready** for FastAPI backend integration. Next steps:

1. **🔧 FastAPI Backend**: Implement the three main endpoints
2. **📄 OCR Integration**: Add Tesseract for document text extraction  
3. **🤖 LLM Integration**: Connect DeepSeek-R1 via Ollama
4. **🔄 Real-time Streaming**: Implement Server-Sent Events for responses
5. **📊 Analytics**: Add usage tracking and performance monitoring

## ⚠️ **Important Notes**

- **Voice Input**: Requires HTTPS in production for Web Speech API
- **File Size**: 10MB limit per file (configurable)
- **Browser Support**: Modern browsers with ES2020+ support
- **No Authentication**: Ready for guest usage, can add auth later
- **Local Storage**: Documents stored temporarily in browser

## 🤝 **Contributing**

The codebase follows modern React best practices:
- ✅ **Functional Components** with hooks
- ✅ **TypeScript** for complete type safety
- ✅ **Component Composition** over inheritance
- ✅ **Clean Architecture** with clear separation of concerns
- ✅ **Consistent Naming** and file organization
- ✅ **Accessibility First** with ARIA support

---

**🎉 Frontend Complete!** This is a production-ready frontend with all requested features implemented. The application is fully prepared for FastAPI backend integration and provides a premium user experience with ChatGPT-style interface, real voice input, streaming responses, and beautiful glassmorphism design.