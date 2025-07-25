export interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  preview?: string;
  textContent?: string;
  clauses?: Clause[];
}

export interface QueryResponse {
  query: string;
  answer: string;
  clauses: Clause[];
  documentName: string;
  timestamp: Date;
}

export interface Clause {
  number: string;
  text: string;
  confidence: number;
  type: 'supportive' | 'critical' | 'neutral';
  documentId?: string;
}

export interface QueryHistory {
  id: string;
  query: string;
  response: QueryResponse;
  timestamp: Date;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export type Language = 'en' | 'hi' | 'hinglish';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}