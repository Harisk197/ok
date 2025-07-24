import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowLeft, RotateCcw, FileText } from 'lucide-react';
import ChatInterface from '../components/Chat/ChatInterface';
import DocumentPreview from '../components/DocumentPreview/DocumentPreview';
import { UploadedDocument, ChatMessage, Clause } from '../types';
import { mockQueryResponse } from '../data/mockData';
import { apiService } from '../services/api';

const Query: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<UploadedDocument>();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedClause, setHighlightedClause] = useState<Clause>();

  useEffect(() => {
    // Load uploaded documents from localStorage
    const storedDocs = localStorage.getItem('uploadedDocuments');
    if (storedDocs) {
      const docs = JSON.parse(storedDocs);
      setUploadedDocuments(docs);
      setSelectedDocument(docs[0]);
    }
  }, []);

  const handleSendMessage = useCallback(async (message: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: message,
      timestamp: new Date(),
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Call the API with documents context
      const result = await apiService.sendChatMessage(
        message, 
        chatMessages,
        uploadedDocuments
      );
      
      if (!result.success) {
        throw new Error(result.error);
      }
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      };
      
      setChatMessages(prev => [...prev, assistantMessage]);
      
      // Simulate streaming response
      const fullResponse = mockQueryResponse.answer;
      const words = fullResponse.split(' ');
      
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        const partialResponse = words.slice(0, i + 1).join(' ');
        
        setChatMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { ...msg, content: partialResponse }
              : msg
          )
        );
      }
      
      // Mark streaming as complete
      setChatMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, isStreaming: false }
            : msg
        )
      );
      
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [chatMessages]);

  const handleClearChat = useCallback(() => {
    setChatMessages([]);
    setHighlightedClause(undefined);
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

  const handleClearDocuments = useCallback(() => {
    localStorage.removeItem('uploadedDocuments');
    setUploadedDocuments([]);
    setSelectedDocument(undefined);
    navigate('/upload');
  }, [navigate]);

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
        <div className="lg:col-span-1 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
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