import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface StreamingTextProps {
  text: string;
  speed?: number;
  showThinking?: boolean;
}

const StreamingText: React.FC<StreamingTextProps> = ({ text, speed = 20, showThinking = false }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isThinking, setIsThinking] = useState(showThinking);

  useEffect(() => {
    // Reset when text changes
    setDisplayedText('');
    setCurrentIndex(0);
    setIsThinking(showThinking);
  }, [text, showThinking]);

  useEffect(() => {
    if (isThinking) {
      // Show thinking for 1 second before starting to type
      const thinkingTimer = setTimeout(() => {
        setIsThinking(false);
      }, 1000);
      return () => clearTimeout(thinkingTimer);
    }

    if (!isThinking && currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed, isThinking]);

  if (isThinking) {
    return (
      <div className="flex items-center space-x-2 text-gray-500 italic">
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
              className="w-2 h-2 bg-blue-400 rounded-full"
            />
          ))}
        </div>
        <span>Thinking...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <span className="whitespace-pre-wrap">{displayedText}</span>
      {currentIndex < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="inline-block w-2 h-5 bg-current ml-1"
        />
      )}
    </div>
  );
};

export default StreamingText;