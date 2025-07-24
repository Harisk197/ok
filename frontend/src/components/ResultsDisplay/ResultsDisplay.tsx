import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Clause } from '../../types';

interface ResultsDisplayProps {
  clauses: Clause[];
  onClauseClick: (clause: Clause) => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ clauses, onClauseClick }) => {
  const { t } = useLanguage();
  const [expandedClauses, setExpandedClauses] = useState<Set<string>>(new Set());

  const toggleClause = (clauseNumber: string) => {
    const newExpanded = new Set(expandedClauses);
    if (newExpanded.has(clauseNumber)) {
      newExpanded.delete(clauseNumber);
    } else {
      newExpanded.add(clauseNumber);
    }
    setExpandedClauses(newExpanded);
  };

  const getClauseIcon = (type: string) => {
    switch (type) {
      case 'supportive':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getClauseColor = (type: string) => {
    switch (type) {
      case 'supportive':
        return 'border-green-200 bg-green-50';
      case 'critical':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-100';
    if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (clauses.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <h3 className="text-lg font-semibold text-gray-900">
        {t('relevantClauses')} ({clauses.length})
      </h3>
      
      <div className="space-y-3">
        {clauses.map((clause, index) => (
          <motion.div
            key={clause.number}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`border rounded-lg transition-all duration-200 ${getClauseColor(clause.type)}`}
          >
            <div
              className="p-4 cursor-pointer"
              onClick={() => toggleClause(clause.number)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getClauseIcon(clause.type)}
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Clause {clause.number}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(clause.confidence)}`}>
                        {Math.round(clause.confidence * 100)}% {t('confidence')}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">
                        {clause.type}
                      </span>
                    </div>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: expandedClauses.has(clause.number) ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </motion.div>
              </div>
            </div>
            
            <AnimatePresence>
              {expandedClauses.has(clause.number) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-200 overflow-hidden"
                >
                  <div className="p-4 bg-white">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {clause.text}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onClauseClick(clause)}
                      className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors text-sm"
                    >
                      {t('highlightInDoc')}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ResultsDisplay;