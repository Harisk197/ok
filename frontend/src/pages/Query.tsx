import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowLeft, FileText, AlertCircle } from 'lucide-react';
import ChatInterface from '../components/Chat/ChatInterface';
import DocumentPreview from '../components/DocumentPreview/DocumentPreview';
import { UploadedDocument, ChatMessage, Clause } from '../types';
import { apiService } from '../services/api';

const Query: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<UploadedDocument>();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedClause, setHighlightedClause] = useState<Clause>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load documents from backend session
    loadDocuments();
  }, []);
  
  const loadDocuments = async () => {
    try {
      const result = await apiService.listDocuments();
      if (result.success && result.data.documents) {
        // Convert backend format to frontend format
        const documents: UploadedDocument[] = result.data.documents.map((doc: any) => ({
          id: doc.id,
          name: doc.name,
          type: doc.type,
          size: doc.size,
          uploadedAt: new Date(doc.uploaded_at),
          textContent: doc.text_content,
          clauses: doc.clauses,
        }));
        
        setUploadedDocuments(documents);
        if (documents.length > 0) {
          setSelectedDocument(documents[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
      setError('Failed to load documents');
    }
  };

  const handleSendMessage = useCallback(async (message: string) => {
    setError(null);
    
    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: message,
      timestamp: new Date(),
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    // Add assistant message placeholder for streaming
    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };
    
    setChatMessages(prev => [...prev, assistantMessage]);
    
    try {
      let accumulatedResponse = '';
      let hasStartedStreaming = false;
      
      const result = await apiService.sendChatMessage(
        message, 
        chatMessages,
        uploadedDocuments,
        (chunk: string) => {
          // Handle streaming chunks
          if (!hasStartedStreaming) {
            hasStartedStreaming = true;
            // Show thinking indicator first
            setChatMessages(prev => 
              prev.map(msg => 
                msg.id === assistantMessage.id 
                  ? { ...msg, content: '', isStreaming: true }
                  : msg
              )
            );
          }
          
          accumulatedResponse += chunk;
          setChatMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { ...msg, content: accumulatedResponse, isStreaming: true }
                : msg
            )
          );
        }
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get response');
      }
      
      // Mark streaming as complete
      setChatMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { 
                ...msg, 
                isStreaming: false, 
                content: accumulatedResponse || result.data?.response || 'No response received' 
              }
            : msg
        )
      );
      
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      
      // Update the assistant message with error
      setChatMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { 
                ...msg, 
                content: `I apologize, but I encountered an error: ${errorMessage}. Please try again.`,
                isStreaming: false 
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [chatMessages, uploadedDocuments]);

  const handleClearChat = useCallback(() => {
    setChatMessages([]);
    setHighlightedClause(undefined);
    setError(null);
  }, []);

  const handleRegenerateResponse = useCallback(async () => {
    if (chatMessages.length === 0) return;
    
    // Find the last user message
    const lastUserMessage = [...chatMessages].reverse().find(msg => msg.type === 'user');
    if (lastUserMessage) {
      // Remove the last assistant response and regenerate
      setChatMessages(prev => {
        const lastUserIndex = prev.findLastIndex(msg => msg.type === 'user');
        return prev.slice(0, lastUserIndex + 1);
      });
      
      await handleSendMessage(lastUserMessage.content);
    }
  }, [chatMessages, handleSendMessage]);

  const handleClearDocuments = useCallback(async () => {
    try {
      // Clear documents from backend session
      const result = await apiService.clearAllDocuments();
      if (result.success) {
        setUploadedDocuments([]);
        setSelectedDocument(undefined);
        setChatMessages([]);
        setError(null);
      } else {
        setError(result.error || 'Failed to clear documents');
      }
    } catch (error) {
      console.error('Failed to clear documents:', error);
      setError('Failed to clear documents');
    }
  }, []);

  const goToUpload = () => {
    navigate('/upload');
  };

  if (uploadedDocuments.length === 0) {
    return (
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-8 py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20"
        >
          <div className="text-8xl mb-6">📄</div>
          <h1 className="text-4xl font-bold text-gray-900">{t('noDocumentsFound')}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('noDocumentsFound')}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToUpload}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
          >
            {t('uploadDocuments')}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3"
        >
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-700 font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 text-xl font-bold"
          >
            ×
          </button>
        </motion.div>
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('queryPageTitle')}
          </h1>
          <p className="text-xl text-gray-600 mt-2 flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>{t('documentsReady').replace('{count}', uploadedDocuments.length.toString())}</span>
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={goToUpload}
            className="flex items-center space-x-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t('backToUpload')}</span>
          </motion.button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6 min-h-[calc(100vh-180px)]">
        {/* Chat Interface - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <ChatInterface
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            onClearChat={handleClearChat}
            onRegenerateResponse={handleRegenerateResponse}
            isLoading={isLoading}
          />
        </div>

        {/* Document Preview - Takes 1 column */}
        <div className="lg:col-span-1">
          <DocumentPreview
            documents={uploadedDocuments}
            selectedDocument={selectedDocument}
            highlightedClause={highlightedClause}
            onSelectDocument={setSelectedDocument}
            onClearDocuments={handleClearDocuments}
          />
        </div>
      </div>
    </div>
  );
};

export default Query;