import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language, LanguageContextType } from '../types';

const translations = {
  en: {
    // Navigation
    home: 'Home',
    upload: 'Upload',
    query: 'Query',
    
    // Home Page
    appTitle: 'Smart Legal Assistant',
    appSubtitle: 'AI-Powered Document Analysis',
    heroTitle: 'Understand Your Legal Documents',
    heroSubtitle: 'Upload contracts, policies, and legal documents. Get instant AI-powered analysis with clause-by-clause explanations.',
    uploadDocuments: 'Upload Documents',
    tryDemo: 'Try Demo',
    
    // Features
    uploadFeatureTitle: 'Smart Upload',
    uploadFeatureDesc: 'Drag & drop multiple documents with instant validation',
    queryFeatureTitle: 'AI Analysis',
    queryFeatureDesc: 'Ask questions in natural language, get precise answers',
    secureFeatureTitle: 'Secure & Private',
    secureFeatureDesc: 'Your documents are processed securely and privately',
    
    // Upload Page
    uploadPageTitle: 'Upload Legal Documents',
    uploadPageSubtitle: 'Upload your legal and insurance documents for analysis',
    supportedDocTypes: 'Supported Document Types',
    dragDropFiles: 'Drag and drop your files here',
    orClickToBrowse: 'or click to browse your files',
    supportedFormats: 'Supported formats: PDF, JPEG, PNG • Maximum size: 10MB per file',
    browseFiles: 'Browse Files',
    proceedToQuery: 'Proceed to Analysis',
    clearAll: 'Clear All',
    uploadedDocuments: 'Uploaded Documents',
    insurancePolicies: 'Insurance Policies',
    employmentContracts: 'Employment Contracts',
    legalAgreements: 'Legal Agreements',
    termsConditions: 'Terms & Conditions',
    propertyDocuments: 'Property Documents',
    serviceContracts: 'Service Contracts',
    
    // Query Page
    queryPageTitle: 'Document Analysis',
    askQuestion: 'Ask your question about the documents',
    questionPlaceholder: 'Type your question about the legal documents...',
    listening: 'Listening...',
    noDocumentsFound: 'Please upload some legal documents first to start asking questions.',
    documentsReady: '{count} document(s) ready for analysis',
    startOver: 'Start Over',
    backToUpload: 'Back to Upload',
    questionAsked: 'Question Asked',
    source: 'Source',
    
    // Document Preview
    documentPreview: 'Document Preview',
    noDocumentsUploaded: 'No documents uploaded yet',
    openFullView: 'Open Full View',
    selectDocumentToPreview: 'Select a document to preview',
    clickClauseToHighlight: 'Click on a clause from the results to highlight it in this preview',
    
    // Results
    relevantClauses: 'Relevant Clauses Found',
    confidence: 'confidence',
    highlightInDoc: 'Highlight in Document',
    
    // Common
    loading: 'Processing...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    download: 'Download',
    share: 'Share',
    
    // Chat Interface
    chatWithAI: 'Chat with AI Assistant',
    askAboutDocuments: 'Ask questions about your documents',
    regenerateResponse: 'Regenerate Response',
    clearChat: 'Clear Chat',
    startConversation: 'Start a Conversation',
    askFirstQuestion: 'Ask your first question about the uploaded documents',
    typeMessage: 'Type your message...',
    stopListening: 'Stop Listening',
    startVoiceInput: 'Start Voice Input',
    copyMessage: 'Copy Message',
    aiTyping: 'AI is typing',
    
    // File Upload
    uploading: 'Uploading...',
    processingFiles: 'Processing files...',
    previewFile: 'Preview File',
    downloadFile: 'Download File',
    removeFile: 'Remove File',
    
    // Accessibility
    answer: 'Answer',
  },
  hi: {
    // Navigation
    home: 'होम',
    upload: 'अपलोड',
    query: 'प्रश्न',
    
    // Home Page
    appTitle: 'स्मार्ट कानूनी सहायक',
    appSubtitle: 'AI-संचालित दस्तावेज़ विश्लेषण',
    heroTitle: 'अपने कानूनी दस्तावेज़ समझें',
    heroSubtitle: 'अनुबंध, नीतियां और कानूनी दस्तावेज़ अपलोड करें। तुरंत AI-संचालित विश्लेषण प्राप्त करें।',
    uploadDocuments: 'दस्तावेज़ अपलोड करें',
    tryDemo: 'डेमो आज़माएं',
    
    // Features
    uploadFeatureTitle: 'स्मार्ट अपलोड',
    uploadFeatureDesc: 'तुरंत सत्यापन के साथ कई दस्तावेज़ खींचें और छोड़ें',
    queryFeatureTitle: 'AI विश्लेषण',
    queryFeatureDesc: 'प्राकृतिक भाषा में प्रश्न पूछें, सटीक उत्तर पाएं',
    secureFeatureTitle: 'सुरक्षित और निजी',
    secureFeatureDesc: 'आपके दस्तावेज़ सुरक्षित और निजी रूप से संसाधित होते हैं',
    
    // Upload Page
    uploadPageTitle: 'कानूनी दस्तावेज़ अपलोड करें',
    uploadPageSubtitle: 'विश्लेषण के लिए अपने कानूनी और बीमा दस्तावेज़ अपलोड करें',
    supportedDocTypes: 'समर्थित दस्तावेज़ प्रकार',
    dragDropFiles: 'अपनी फ़ाइलें यहाँ खींचें और छोड़ें',
    orClickToBrowse: 'या अपनी फ़ाइलें ब्राउज़ करने के लिए क्लिक करें',
    supportedFormats: 'समर्थित प्रारूप: PDF, JPEG, PNG • अधिकतम आकार: 10MB प्रति फ़ाइल',
    browseFiles: 'फ़ाइलें ब्राउज़ करें',
    proceedToQuery: 'विश्लेषण के लिए आगे बढ़ें',
    clearAll: 'सभी साफ़ करें',
    uploadedDocuments: 'अपलोड किए गए दस्तावेज़',
    insurancePolicies: 'बीमा पॉलिसी',
    employmentContracts: 'रोजगार अनुबंध',
    legalAgreements: 'कानूनी समझौते',
    termsConditions: 'नियम व शर्तें',
    propertyDocuments: 'संपत्ति दस्तावेज़',
    serviceContracts: 'सेवा अनुबंध',
    
    // Query Page
    queryPageTitle: 'दस्तावेज़ विश्लेषण',
    askQuestion: 'दस्तावेज़ों के बारे में अपना प्रश्न पूछें',
    questionPlaceholder: 'कानूनी दस्तावेज़ों के बारे में अपना प्रश्न टाइप करें...',
    listening: 'सुन रहा है...',
    noDocumentsFound: 'प्रश्न पूछना शुरू करने के लिए पहले कुछ कानूनी दस्तावेज़ अपलोड करें।',
    documentsReady: '{count} दस्तावेज़ विश्लेषण के लिए तैयार',
    startOver: 'फिर से शुरू करें',
    backToUpload: 'अपलोड पर वापस जाएं',
    questionAsked: 'पूछा गया प्रश्न',
    source: 'स्रोत',
    
    // Document Preview
    documentPreview: 'दस्तावेज़ पूर्वावलोकन',
    noDocumentsUploaded: 'अभी तक कोई दस्तावेज़ अपलोड नहीं किया गया',
    openFullView: 'पूर्ण दृश्य खोलें',
    selectDocumentToPreview: 'पूर्वावलोकन के लिए एक दस्तावेज़ चुनें',
    clickClauseToHighlight: 'इस पूर्वावलोकन में हाइलाइट करने के लिए परिणामों से एक खंड पर क्लिक करें',
    
    // Results
    relevantClauses: 'संबंधित खंड मिले',
    confidence: 'विश्वास',
    highlightInDoc: 'दस्तावेज़ में हाइलाइट करें',
    
    // Common
    loading: 'प्रसंस्करण...',
    error: 'त्रुटि',
    success: 'सफलता',
    cancel: 'रद्द करें',
    save: 'सहेजें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    view: 'देखें',
    download: 'डाउनलोड',
    share: 'साझा करें',
    
    // Chat Interface
    chatWithAI: 'AI सहायक के साथ चैट करें',
    askAboutDocuments: 'अपने दस्तावेज़ों के बारे में प्रश्न पूछें',
    regenerateResponse: 'उत्तर पुनः जेनरेट करें',
    clearChat: 'चैट साफ़ करें',
    startConversation: 'बातचीत शुरू करें',
    askFirstQuestion: 'अपलोड किए गए दस्तावेज़ों के बारे में अपना पहला प्रश्न पूछें',
    typeMessage: 'अपना संदेश टाइप करें...',
    stopListening: 'सुनना बंद करें',
    startVoiceInput: 'वॉइस इनपुट शुरू करें',
    copyMessage: 'संदेश कॉपी करें',
    aiTyping: 'AI टाइप कर रहा है',
    
    // File Upload
    uploading: 'अपलोड हो रहा है...',
    processingFiles: 'फ़ाइलें प्रोसेस हो रही हैं...',
    previewFile: 'फ़ाइल पूर्वावलोकन',
    downloadFile: 'फ़ाइल डाउनलोड करें',
    removeFile: 'फ़ाइल हटाएं',
    
    answer: 'उत्तर',
  },
  hinglish: {
    // Navigation
    home: 'Home',
    upload: 'Upload करें',
    query: 'Query करें',
    
    // Home Page
    appTitle: 'Smart Legal Assistant',
    appSubtitle: 'AI-Powered Document Analysis',
    heroTitle: 'Apne Legal Documents Samjhiye',
    heroSubtitle: 'Contracts, policies aur legal documents upload kariye. Instant AI-powered analysis paiye.',
    uploadDocuments: 'Documents Upload करें',
    tryDemo: 'Demo Try करें',
    
    // Features
    uploadFeatureTitle: 'Smart Upload',
    uploadFeatureDesc: 'Multiple documents ko drag & drop kariye instant validation ke saath',
    queryFeatureTitle: 'AI Analysis',
    queryFeatureDesc: 'Natural language mein questions puchiye, precise answers paiye',
    secureFeatureTitle: 'Secure & Private',
    secureFeatureDesc: 'Aapke documents securely aur privately process hote hain',
    
    // Upload Page
    uploadPageTitle: 'Legal Documents Upload करें',
    uploadPageSubtitle: 'Analysis ke liye apne legal aur insurance documents upload kariye',
    supportedDocTypes: 'Supported Document Types',
    dragDropFiles: 'Apni files yahan drag aur drop kariye',
    orClickToBrowse: 'ya files browse karne ke liye click kariye',
    supportedFormats: 'Supported formats: PDF, JPEG, PNG • Maximum size: 10MB per file',
    browseFiles: 'Files Browse करें',
    proceedToQuery: 'Analysis ke liye Proceed करें',
    clearAll: 'Sab Clear करें',
    uploadedDocuments: 'Upload kiye gaye Documents',
    insurancePolicies: 'Insurance Policies',
    employmentContracts: 'Employment Contracts',
    legalAgreements: 'Legal Agreements',
    termsConditions: 'Terms & Conditions',
    propertyDocuments: 'Property Documents',
    serviceContracts: 'Service Contracts',
    
    // Query Page
    queryPageTitle: 'Document Analysis',
    askQuestion: 'Documents ke baare mein apna question puchiye',
    questionPlaceholder: 'Legal documents ke baare mein apna question type kariye...',
    listening: 'Sun raha hai...',
    noDocumentsFound: 'Questions puchne ke liye pehle kuch legal documents upload kariye.',
    documentsReady: '{count} documents analysis ke liye ready hain',
    startOver: 'Start Over करें',
    backToUpload: 'Upload par wapas jaiye',
    questionAsked: 'Pucha gaya Question',
    source: 'Source',
    
    // Document Preview
    documentPreview: 'Document Preview',
    noDocumentsUploaded: 'Abhi tak koi documents upload nahi kiye gaye',
    openFullView: 'Full View kholiye',
    selectDocumentToPreview: 'Preview ke liye ek document select kariye',
    clickClauseToHighlight: 'Is preview mein highlight karne ke liye results se ek clause par click kariye',
    
    // Results
    relevantClauses: 'Relevant Clauses Mile',
    confidence: 'confidence',
    highlightInDoc: 'Document mein Highlight करें',
    
    // Common
    loading: 'Process ho raha hai...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel करें',
    save: 'Save करें',
    delete: 'Delete करें',
    edit: 'Edit करें',
    view: 'View करें',
    download: 'Download करें',
    share: 'Share करें',
    
    // Chat Interface
    chatWithAI: 'AI Assistant ke saath Chat करें',
    askAboutDocuments: 'Apne documents ke baare mein questions puchiye',
    regenerateResponse: 'Response Regenerate करें',
    clearChat: 'Chat Clear करें',
    startConversation: 'Conversation Start करें',
    askFirstQuestion: 'Upload kiye gaye documents ke baare mein apna pehla question puchiye',
    typeMessage: 'Apna message type करें...',
    stopListening: 'Listening Band करें',
    startVoiceInput: 'Voice Input Start करें',
    copyMessage: 'Message Copy करें',
    aiTyping: 'AI type kar raha hai',
    
    // File Upload
    uploading: 'Upload ho raha hai...',
    processingFiles: 'Files process ho rahi hain...',
    previewFile: 'File Preview करें',
    downloadFile: 'File Download करें',
    removeFile: 'File Remove करें',
    
    answer: 'Answer',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};