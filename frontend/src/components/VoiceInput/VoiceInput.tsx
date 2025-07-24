import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';

interface VoiceInputProps {
  onVoiceInput: (text: string) => void;
  isListening: boolean;
  onToggleListening: () => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ 
  onVoiceInput, 
  isListening, 
  onToggleListening 
}) => {
  const handleVoiceInput = () => {
    onToggleListening();
    
    // Simulate voice input after 2 seconds
    if (!isListening) {
      setTimeout(() => {
        const sampleQueries = [
          "Can I terminate my contract early?",
          "What are the cancellation fees?",
          "What is covered under my insurance policy?",
          "How do I file a claim?",
        ];
        const randomQuery = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
        onVoiceInput(randomQuery);
        onToggleListening(); // Stop listening
      }, 2000);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleVoiceInput}
      className={`p-3 rounded-full transition-all duration-300 ${
        isListening 
          ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
          : 'bg-blue-800 hover:bg-blue-900 text-white'
      }`}
      title={isListening ? 'Stop listening' : 'Start voice input'}
    >
      {isListening ? (
        <MicOff className="h-5 w-5" />
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </motion.button>
  );
};

export default VoiceInput;