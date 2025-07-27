import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Trash2, Eye } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { UploadedDocument, Clause } from '../../types';

interface DocumentPreviewProps {
  documents: UploadedDocument[];
  selectedDocument?: UploadedDocument;
  highlightedClause?: Clause;
  onSelectDocument: (document: UploadedDocument) => void;
  onClearDocuments: () => void;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  documents,
  selectedDocument,
  highlightedClause,
  onSelectDocument,
  onClearDocuments,
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleClearDocuments = async () => {
    try {
      await onClearDocuments();
      navigate('/upload');
    } catch (error) {
      console.error('Failed to clear documents:', error);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 text-center h-full">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">{t('noDocumentsUploaded')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full flex flex-col px-1">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">{t('documentPreview')}</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleClearDocuments}
          className="flex items-center space-x-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all shadow-md hover:shadow-lg text-sm font-medium"
        >
          <Trash2 className="h-4 w-4" />
          <span>{t('clearDocuments')}</span>
        </motion.button>
      </div>
      
      {/* Document Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {documents.map((doc) => (
          <motion.button
            key={doc.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectDocument(doc)}
            className={`px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 shadow-sm ${
              selectedDocument?.id === doc.id
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200'
            }`}
          >
            {doc.name.length > 20 ? `${doc.name.substring(0, 20)}...` : doc.name}
          </motion.button>
        ))}
      </div>

      {/* Document Preview Area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 overflow-hidden"
      >
        {selectedDocument ? (
          <div className="space-y-6 h-full flex flex-col">
            <div className="flex justify-center border-b border-gray-200 pb-4 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="text-center">
                  <h4 className="font-medium text-gray-900">{selectedDocument.name}</h4>
                  <p className="text-sm text-gray-500">
                    {selectedDocument.type} • {Math.round(selectedDocument.size / 1024)} KB
                  </p>
                </div>
              </div>
            </div>
            
            {/* Document Content */}
            <div className="flex-1 overflow-y-auto space-y-6 text-sm text-gray-700 leading-relaxed px-2">
              {selectedDocument.textContent ? (
                <div className="space-y-4">
                  {/* Document Summary Section */}
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <h5 className="font-bold text-lg text-gray-900 mb-3 flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span>Document Summary:</span>
                    </h5>
                    <div className="text-gray-800 leading-relaxed">
                      {selectedDocument.textContent.length > 500 ? (
                        <div>
                          <p className="mb-2">
                            <strong>Document Type:</strong> {selectedDocument.type}
                          </p>
                          <p className="mb-2">
                            <strong>Size:</strong> {Math.round(selectedDocument.size / 1024)} KB
                          </p>
                          <p className="mb-2">
                            <strong>Content Preview:</strong>
                          </p>
                          <p className="text-sm bg-white p-3 rounded-lg border">
                            {selectedDocument.textContent.substring(0, 300)}...
                          </p>
                        </div>
                      ) : (
                        <p>This document contains {selectedDocument.textContent.length} characters of extracted text.</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <h5 className="font-bold text-lg text-gray-900 mb-3">Document Content:</h5>
                    <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                      {highlightedClause ? (
                        <div>
                          <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 shadow-lg mb-4"
                          >
                            <div className="font-bold text-lg text-gray-900 mb-2 flex items-center space-x-2">
                              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                              Highlighted Clause {highlightedClause.number}
                            </div>
                            <p className="text-base leading-relaxed">{highlightedClause.text}</p>
                          </motion.div>
                          <div className="text-gray-600">
                            {selectedDocument.textContent.substring(0, 1000)}
                            {selectedDocument.textContent.length > 1000 && '...'}
                          </div>
                        </div>
                      ) : (
                        <div>
                          {selectedDocument.textContent.substring(0, 2000)}
                          {selectedDocument.textContent.length > 2000 && '...'}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {selectedDocument.clauses && selectedDocument.clauses.length > 0 && (
                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-xl border border-gray-200">
                      <h5 className="font-bold text-lg text-gray-900 mb-3 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span>Extracted Clauses ({selectedDocument.clauses.length}):</span>
                      </h5>
                      <div className="space-y-2">
                        {selectedDocument.clauses.slice(0, 8).map((clause, index) => (
                          <div key={index} className="p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-start space-x-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                clause.type === 'critical' ? 'bg-red-100 text-red-700' :
                                clause.type === 'supportive' ? 'bg-green-100 text-green-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {clause.type}
                              </span>
                              <div className="flex-1">
                                <p className="font-semibold text-blue-600 mb-1">{clause.number}</p>
                                <p className="text-gray-700">{clause.text.substring(0, 200)}...</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Confidence: {Math.round(clause.confidence * 100)}%
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-8">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No text content extracted from this document</p>
                  <p className="text-sm text-gray-400">
                    This might be a scanned document or image that needs OCR processing.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 min-h-[400px]">
            <div className="text-center">
              <div className="text-6xl mb-6">📄</div>
              <p className="text-lg font-medium">{t('selectDocumentToPreview')}</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DocumentPreview;