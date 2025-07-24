import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const TypingIndicator: React.FC = () => {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex justify-start mb-4"
    >
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
          <Bot className="h-5 w-5 text-white" />
        </div>

        {/* Typing Bubble */}
        <div className="bg-white border border-gray-200 rounded-2xl px-6 py-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600 text-sm">{t('aiTyping')}</span>
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="w-2 h-2 bg-gray-400 rounded-full"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;