import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ExternalLink, Trash2 } from 'lucide-react';
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
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            onClearDocuments();
            navigate('/upload');
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
        >
          <Trash2 className="h-4 w-4" />
          <span className="text-sm font-medium">{t('clearDocuments')}</span>
        </motion.button>
      </div>
      
      {/* Document Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 justify-center">
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
              </div>            {/* Mock Document Content */}
            <div className="flex-1 overflow-y-auto space-y-6 text-sm text-gray-700 leading-relaxed px-2">
              <div className="font-bold text-xl text-gray-900 mb-6 text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 mx-auto max-w-xl">
                {selectedDocument.name.includes('Insurance') ? 'HEALTH INSURANCE POLICY' : 'EMPLOYMENT CONTRACT'}
              </div>
              
              {highlightedClause ? (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="p-6 rounded-2xl bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 shadow-lg"
                >
                  <div className="font-bold text-lg text-gray-900 mb-4 flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                    Clause {highlightedClause.number}
                  </div>
                  <p className="text-base leading-relaxed">{highlightedClause.text}</p>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                    <p className="text-base leading-relaxed">
                    This is a preview of your uploaded document. The full document content 
                    would be displayed here in a production application with proper PDF 
                    rendering capabilities.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-2xl border border-gray-200">
                    <h5 className="font-bold text-lg text-gray-900 mb-4 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span>Sample Clauses:</span>
                    </h5>
                    <div className="space-y-3">
                      <div className="p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        <p><strong className="text-blue-600">12.2</strong> Early Termination. Either party may terminate this Agreement...</p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        <p><strong className="text-purple-600">15.4</strong> Cancellation Fees. In the event of early termination...</p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        <p><strong className="text-green-600">8.1</strong> Coverage Benefits. This policy covers...</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
                    <p className="text-sm text-amber-700 italic">
                    {t('clickClauseToHighlight')}
                    </p>
                  </div>
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