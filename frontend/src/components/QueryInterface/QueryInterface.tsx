import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import VoiceInput from '../VoiceInput/VoiceInput';
import { QueryResponse } from '../../types';

interface QueryInterfaceProps {
  onSubmitQuery: (query: string) => void;
  isLoading: boolean;
  response: QueryResponse | null;
}

const QueryInterface: React.FC<QueryInterfaceProps> = ({ 
  onSubmitQuery, 
  isLoading, 
  response 
}) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSubmitQuery(query.trim());
      setQuery('');
    }
  };

  const handleVoiceInput = (voiceText: string) => {
    setQuery(voiceText);
  };

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('askQuestion')}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-3">
            <div className="flex-1">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('questionPlaceholder')}
                className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                disabled={isLoading}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <VoiceInput
                onVoiceInput={handleVoiceInput}
                isListening={isListening}
                onToggleListening={toggleListening}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!query.trim() || isLoading}
                className="p-3 bg-blue-800 text-white rounded-full hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <Loader className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </motion.button>
            </div>
          </div>
          
          {isListening && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-red-600 flex items-center space-x-2"
            >
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>{t('listening')}</span>
            </motion.div>
          )}
        </form>
      </motion.div>

      <AnimatePresence>
        {response && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">{t('questionAsked')}:</h4>
                <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{response.query}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">{t('answer')}:</h4>
                <p className="text-gray-800 leading-relaxed">{response.answer}</p>
              </div>
              
              <div className="text-xs text-gray-500 flex items-center justify-between">
                <span>{t('source')}: {response.documentName}</span>
                <span>{response.timestamp.toLocaleTimeString()}</span>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Answer:</h4>
                <p className="text-gray-800 leading-relaxed">{response.answer}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QueryInterface;