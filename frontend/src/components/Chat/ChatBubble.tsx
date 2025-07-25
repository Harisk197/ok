import React from 'react';
import { motion } from 'framer-motion';
import { Copy, User, Bot, Check } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { ChatMessage } from '../../types';
import StreamingText from './StreamingText';

interface ChatBubbleProps {
  message: ChatMessage;
  onCopy: (text: string) => void;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onCopy }) => {
  const { t } = useLanguage();
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    onCopy(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = message.type === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
        {/* Avatar */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            isUser 
              ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
              : 'bg-gradient-to-br from-green-500 to-emerald-600'
          } shadow-lg`}
        >
          {isUser ? (
            <User className="h-5 w-5 text-white" />
          ) : (
            <Bot className="h-5 w-5 text-white" />
          )}
        </motion.div>

        {/* Message Bubble */}
        <div className={`relative group ${isUser ? 'mr-3' : 'ml-3'}`}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`relative px-6 py-4 rounded-2xl shadow-lg backdrop-blur-sm ${
              isUser
                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                : 'bg-white border border-gray-200 text-gray-800'
            }`}
          >
            {/* Message Content */}
            <div className="relative z-10">
              {message.isStreaming ? (
                <StreamingText 
                  text={message.content} 
                  showThinking={message.content === ''}
                />
              ) : (
                <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
              )}
            </div>

            {/* Glassmorphism effect */}
            <div className="absolute inset-0 bg-white/10 rounded-2xl backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Message tail */}
            <div
              className={`absolute top-4 w-3 h-3 transform rotate-45 ${
                isUser
                  ? 'right-[-6px] bg-gradient-to-br from-blue-500 to-purple-600'
                  : 'left-[-6px] bg-white border-l border-t border-gray-200'
              }`}
            />
          </motion.div>

          {/* Copy Button */}
          {!message.isStreaming && message.content && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCopy}
              className={`absolute top-2 ${
                isUser ? 'left-[-40px]' : 'right-[-40px]'
              } p-2 bg-white rounded-full shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-gray-50`}
              title={t('copyMessage')}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-gray-600" />
              )}
            </motion.button>
          )}

          {/* Timestamp */}
          <div className={`mt-2 text-xs text-gray-500 ${isUser ? 'text-right' : 'text-left'}`}>
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatBubble;