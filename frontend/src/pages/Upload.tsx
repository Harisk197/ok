import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, RotateCcw } from 'lucide-react';
import FileUpload from '../components/FileUpload/FileUpload';
import { UploadedDocument } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { apiService } from '../services/api';

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedDocument[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load existing documents on component mount
  useEffect(() => {
    const loadExistingDocuments = async () => {
      try {
        const result = await apiService.listDocuments();
        if (result.success && result.data.documents) {
          const documents: UploadedDocument[] = result.data.documents.map((doc: any) => ({
            id: doc.id,
            name: doc.name,
            type: doc.type,
            size: doc.size,
            uploadedAt: new Date(doc.uploaded_at),
            textContent: doc.text_content,
            clauses: doc.clauses,
          }));
          setUploadedFiles(documents);
          console.log('Loaded existing documents:', documents);
        }
      } catch (error) {
        console.error('Failed to load existing documents:', error);
      }
    };

    loadExistingDocuments();
  }, []);

  const handleFilesUploaded = (files: UploadedDocument[]) => {
    console.log('Files uploaded callback:', files);
    setUploadedFiles(files);
    setError(null);
  };

  const clearAllFiles = () => {
    console.log('Clearing all files...');
    setUploadedFiles([]);
    // Clear session
    apiService.clearSession();
    setError(null);
  };

  const proceedToQuery = () => {
    if (uploadedFiles.length > 0) {
      console.log('Proceeding to query with files:', uploadedFiles);
      navigate('/query');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3"
        >
          <div className="text-red-500">⚠️</div>
          <div>
            <p className="text-red-700 font-medium">Upload Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            ✕
          </button>
        </motion.div>
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-3xl font-bold text-gray-900">
          {t('uploadPageTitle')}
        </h1>
        <p className="text-lg text-gray-600">
          {t('uploadPageSubtitle')}
        </p>
      </motion.div>

      <FileUpload 
        onFilesUploaded={handleFilesUploaded}
        uploadedFiles={uploadedFiles}
        onError={setError}
      />

      {uploadedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={proceedToQuery}
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors"
          >
            <span>{t('proceedToQuery')}</span>
            <ArrowRight className="h-4 w-4" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearAllFiles}
            className="flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>{t('clearAll')}</span>
          </motion.button>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-6"
      >
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          {t('supportedDocTypes')}
        </h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm text-blue-800">
          <ul className="space-y-2">
            <li>• {t('insurancePolicies')}</li>
            <li>• {t('employmentContracts')}</li>
            <li>• {t('legalAgreements')}</li>
          </ul>
          <ul className="space-y-2">
            <li>• {t('termsConditions')}</li>
            <li>• {t('propertyDocuments')}</li>
            <li>• {t('serviceContracts')}</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default Upload;