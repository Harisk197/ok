import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, X, AlertCircle, CheckCircle2, FileText, Eye, Download } from 'lucide-react';
import { UploadedDocument } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { apiService } from '../../services/api';

interface FileUploadProps {
  onFilesUploaded: (files: UploadedDocument[]) => void;
  uploadedFiles: UploadedDocument[];
  onError?: (error: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesUploaded, uploadedFiles, onError }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const { t } = useLanguage();

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleFiles = useCallback(async (files: FileList) => {
    onError?.(null);
    setIsUploading(true);
    const fileArray = Array.from(files);
    
    // Validate files first
    for (const file of fileArray) {
      if (!allowedTypes.includes(file.type)) {
        onError?.(`File type not supported: ${file.name}. Please upload PDF, JPEG, or PNG files only.`);
        setIsUploading(false);
        return;
      }
      
      if (file.size > maxFileSize) {
        onError?.(`File too large: ${file.name}. Maximum size is 10MB.`);
        setIsUploading(false);
        return;
      }
    }

    try {
      console.log('Uploading files:', fileArray.map(f => f.name));
      // Upload files to backend
      const result = await apiService.uploadDocuments(fileArray);
      
      if (!result.success) {
        onError?.(result.error || 'Upload failed');
        setIsUploading(false);
        return;
      }
      
      console.log('Upload successful:', result.data);
      
      // Convert backend response to frontend format
      const processedFiles: UploadedDocument[] = result.data.documents.map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        size: doc.size,
        uploadedAt: new Date(doc.uploaded_at),
        textContent: doc.text_content,
        clauses: doc.clauses,
        preview: doc.type.startsWith('image/') ? `${import.meta.env.VITE_API_BASE_URL}/uploads/${doc.id}.${doc.name.split('.').pop()}` : undefined,
      }));

      const allFiles = [...uploadedFiles, ...processedFiles];
      console.log('All processed files:', allFiles);
      onFilesUploaded(allFiles);
      
    } catch (error) {
      console.error('Upload error:', error);
      onError?.(error instanceof Error ? error.message : 'Upload failed');
    }
    
    setIsUploading(false);
    setUploadProgress({});
  }, [onFilesUploaded, uploadedFiles, onError]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeFile = (fileId: string) => {
    const updatedFiles = uploadedFiles.filter(file => file.id !== fileId);
    onFilesUploaded(updatedFiles);
    
    // Also delete from backend
    apiService.deleteDocument(fileId).catch(error => {
      console.error('Failed to delete document from backend:', error);
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const previewFile = (file: UploadedDocument) => {
    if (file.preview) {
      window.open(file.preview, '_blank');
    }
  };

  const downloadFile = (file: UploadedDocument) => {
    // Create download link
    const link = document.createElement('a');
    link.href = file.preview || '#';
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
          isDragOver || isUploading
            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 scale-105' 
            : 'border-gray-300 hover:border-blue-400 bg-white'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <motion.div
          animate={isDragOver ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
          className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center relative ${
            isDragOver ? 'bg-blue-500' : 'bg-gradient-to-br from-blue-500 to-purple-600'
          }`}
        >
          <Upload className="h-10 w-10 text-white" />
        </motion.div>
        
        <h3 className="text-2xl font-bold text-slate-900 mb-3">
          {t('dragDropFiles')}
        </h3>
        
        <p className="text-lg text-slate-600 mb-6">
          {t('orClickToBrowse')}
        </p>
        
        <p className="text-sm text-slate-500 mb-8">
          {t('supportedFormats')}
        </p>
        
        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
          disabled={isUploading}
        />
        
        <label
          htmlFor="file-upload"
          className={`inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl ${
            isUploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Upload className="h-5 w-5 mr-3" />
          {isUploading ? t('uploading') : t('browseFiles')}
        </label>
        
        {isUploading && (
          <motion.div className="mt-4 text-sm text-blue-600">
            <div className="animate-pulse">{t('processingFiles')}</div>
          </motion.div>
        )}
      </motion.div>


      {uploadedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            <h4 className="text-xl font-bold text-slate-900">
              {t('uploadedDocuments')} ({uploadedFiles.length})
            </h4>
          </div>
          
          <div className="grid gap-4">
            {uploadedFiles.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      {file.preview ? (
                        <img 
                          src={file.preview} 
                          alt={file.name}
                          className="w-16 h-16 object-cover rounded-xl shadow-lg"
                        />
                      ) : (
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl w-16 h-16 flex items-center justify-center">
                          <FileText className="h-8 w-8 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-lg">{file.name}</p>
                      <p className="text-sm text-slate-500">
                        {formatFileSize(file.size)} • {file.uploadedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {file.preview && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => previewFile(file)}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title={t('previewFile')}
                      >
                        <Eye className="h-5 w-5" />
                      </motion.button>
                    )}
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => downloadFile(file)}
                      className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                      title={t('downloadFile')}
                    >
                      <Download className="h-5 w-5" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeFile(file.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title={t('removeFile')}
                    >
                      <X className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>
                
                {/* Upload Progress */}
                {uploadProgress[file.id] !== undefined && uploadProgress[file.id] < 100 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress[file.id]}%` }}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FileUpload;