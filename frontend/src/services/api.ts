import axios from 'axios';
import { ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Session management
let currentSessionId: string | null = null;

const getSessionId = (): string | null => {
  if (!currentSessionId) {
    currentSessionId = localStorage.getItem('sessionId');
  }
  return currentSessionId;
};

const setSessionId = (sessionId: string) => {
  currentSessionId = sessionId;
  localStorage.setItem('sessionId', sessionId);
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add session ID to headers if available
    const sessionId = getSessionId();
    if (sessionId) {
      config.headers['X-Session-ID'] = sessionId;
    }
    
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Extract session ID from response headers
    const sessionId = response.headers['x-session-id'];
    if (sessionId && sessionId !== getSessionId()) {
      setSessionId(sessionId);
    }
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle session-related errors
    if (error.response?.status === 404 && error.response?.data?.detail?.includes('Session')) {
      // Session expired or not found, clear local session
      currentSessionId = null;
      localStorage.removeItem('sessionId');
    }
    
    return Promise.reject(error);
  }
);

export const apiService = {
  // Session management
  createSession: async (): Promise<ApiResponse> => {
    try {
      const response = await api.post('/session');
      const sessionId = response.data.session_id;
      setSessionId(sessionId);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to create session' 
      };
    }
  },

  getSessionInfo: async (): Promise<ApiResponse> => {
    try {
      const sessionId = getSessionId();
      if (!sessionId) {
        return { success: false, error: 'No active session' };
      }
      
      const response = await api.get(`/session/${sessionId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to get session info' 
      };
    }
  },
  // Upload documents
  uploadDocuments: async (files: File[]): Promise<ApiResponse> => {
    try {
      // Ensure we have a session
      if (!getSessionId()) {
        const sessionResult = await apiService.createSession();
        if (!sessionResult.success) {
          return sessionResult;
        }
      }
      
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`files`, file);
      });

      const response = await api.post('/upload-documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Upload failed' 
      };
    }
  },

  // Send chat message
  sendChatMessage: async (
    message: string, 
    history: any[] = [], 
    documents?: any[],
    onChunk?: (chunk: string) => void
  ): Promise<ApiResponse> => {
    try {
      // Ensure we have a session
      if (!getSessionId()) {
        const sessionResult = await apiService.createSession();
        if (!sessionResult.success) {
          return sessionResult;
        }
      }
      
      const requestData = {
        message,
        history,
        documents,
      };
      
      // Use fetch for streaming instead of axios
      const sessionId = getSessionId();
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionId && { 'X-Session-ID': sessionId }),
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Chat request failed');
      }
      
      // Handle streaming response
      if (onChunk && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.error) {
                    throw new Error(data.error);
                  }
                  if (data.content) {
                    fullResponse += data.content;
                    onChunk(data.content);
                  }
                  if (data.done) {
                    return { success: true, data: { response: fullResponse } };
                  }
                } catch (parseError) {
                  console.warn('Failed to parse SSE data:', line);
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
        
        return { success: true, data: { response: fullResponse } };
      }

      // Fallback for non-streaming
      const data = await response.json();
      return { success: true, data };
      
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Chat request failed' 
      };
    }
  },

  // List documents
  listDocuments: async (): Promise<ApiResponse> => {
    try {
      const response = await api.get('/documents');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to list documents' 
      };
    }
  },

  // Delete document
  deleteDocument: async (documentId: string): Promise<ApiResponse> => {
    try {
      const response = await api.delete(`/documents/${documentId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to delete document' 
      };
    }
  },
  // Health check
  healthCheck: async (): Promise<ApiResponse> => {
    try {
      const response = await api.get('/health');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Health check failed' 
      };
    }
  },

  // Get current session ID
  getCurrentSessionId: (): string | null => {
    return getSessionId();
  },

  // Clear session
  clearSession: (): void => {
    currentSessionId = null;
    localStorage.removeItem('sessionId');
  },
};

export default api;