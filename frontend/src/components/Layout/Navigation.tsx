import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scale, Upload, MessageCircle, Home, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import LanguageToggle from '../LanguageToggle/LanguageToggle';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { path: '/', icon: Home, label: t('home') },
    { path: '/upload', icon: Upload, label: t('upload') },
    { path: '/query', icon: MessageCircle, label: t('query') },
  ];

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 shadow-2xl border-b border-blue-800/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="relative bg-gradient-to-br from-blue-400 to-purple-600 p-3 rounded-2xl shadow-lg"
            >
              <Scale className="h-8 w-8 text-white" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
              >
                <Sparkles className="h-3 w-3 text-yellow-600" />
              </motion.div>
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                {t('appTitle')}
              </h1>
              <p className="text-xs text-blue-300 font-medium">{t('appSubtitle')}</p>
            </div>
          </Link>

          <div className="flex items-center space-x-6">
            <div className="hidden md:flex space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path} className="relative">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-6 py-3 rounded-xl flex items-center space-x-3 transition-all duration-300 ${
                      isActive 
                        ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/30' 
                        : 'text-blue-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm font-semibold">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-white/10 rounded-xl border border-white/20"
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
            </div>
            
            <LanguageToggle />
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;