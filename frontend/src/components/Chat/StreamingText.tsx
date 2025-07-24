import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface StreamingTextProps {
  text: string;
  speed?: number;
}

const StreamingText: React.FC<StreamingTextProps> = ({ text, speed = 30 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);

  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

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