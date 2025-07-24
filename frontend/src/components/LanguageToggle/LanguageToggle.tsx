import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Language } from '../../types';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
    { code: 'hinglish', label: 'Hinglish', flag: '🌐' },
  ];

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300"
      >
        <Globe className="h-4 w-4" />
        <span className="text-sm font-medium">
          {languages.find(l => l.code === language)?.flag}
        </span>
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
        >
          {languages.map((lang) => (
            <motion.button
              key={lang.code}
              whileHover={{ backgroundColor: '#f8fafc' }}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left flex items-center space-x-3 transition-colors ${
                language === lang.code 
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="font-medium">{lang.label}</span>
              {language === lang.code && (
                <motion.div
                  layoutId="activeLanguage"
                  className="ml-auto w-2 h-2 bg-blue-500 rounded-full"
                />
              )}
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default LanguageToggle;