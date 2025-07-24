import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Upload, MessageCircle, Shield, Zap, Brain, ArrowRight, CheckCircle, Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const features = [
    {
      icon: Upload,
      title: t('uploadFeatureTitle'),
      description: t('uploadFeatureDesc'),
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Brain,
      title: t('queryFeatureTitle'),
      description: t('queryFeatureDesc'),
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Shield,
      title: t('secureFeatureTitle'),
      description: t('secureFeatureDesc'),
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const stats = [
    { number: '10K+', label: 'Documents Analyzed' },
    { number: '95%', label: 'Accuracy Rate' },
    { number: '24/7', label: 'Available' },
  ];

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-8 py-12"
      >
        <div className="space-y-6">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-5xl sm:text-7xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent leading-tight"
          >
            {t('heroTitle')}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl sm:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-medium"
          >
            {t('heroSubtitle')}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-6 justify-center pt-8"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/upload')}
            className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
          >
            <span className="flex items-center space-x-3">
              <span>{t('uploadDocuments')}</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-8 pt-16 max-w-2xl mx-auto"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl sm:text-4xl font-black text-blue-600 mb-2">{stat.number}</div>
              <div className="text-sm text-slate-600 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="space-y-12"
      >
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-slate-900">Powerful Features</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Everything you need to understand your legal documents
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative bg-white p-8 rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-500" 
                   style={{ backgroundImage: `linear-gradient(135deg, ${feature.color.split(' ')[1]}, ${feature.color.split(' ')[3]})` }} />
              
              <div className={`bg-gradient-to-br ${feature.color} p-4 rounded-2xl w-fit mb-6 shadow-lg`}>
                <Icon className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                {feature.title}
              </h3>
              
              <p className="text-slate-600 leading-relaxed text-lg">
                {feature.description}
              </p>
              
              <motion.div
                className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                whileHover={{ scale: 1.1 }}
              >
                <ArrowRight className="h-5 w-5 text-blue-500" />
              </motion.div>
            </motion.div>
          );
        })}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
        className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 rounded-3xl p-12 text-white overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20" />
        <div className="relative z-10">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold">Ready to Get Started?</h2>
              <p className="text-xl text-blue-200 max-w-2xl mx-auto">
                Join thousands of users who trust our AI-powered legal assistant
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/upload')}
                className="px-8 py-4 bg-white text-blue-900 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg"
              >
                Start Analyzing Documents
              </motion.button>
            </div>
            
            <div className="flex items-center justify-center space-x-6 pt-8">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-sm text-blue-200">Free to try</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-sm text-blue-200">Secure & private</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-sm text-blue-200">Instant results</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;