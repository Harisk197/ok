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
  console.log('Session ID set:', sessionId);
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add session ID to headers if available
    const sessionId = getSessionId();
    if (sessionId) {
      config.headers['X-Session-ID'] = sessionId;
      console.log('Adding session ID to request:', sessionId);
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
      console.log('Updated session ID from response:', sessionId);
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
      console.log('✅ Session created:', sessionId);
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
      let sessionId = getSessionId();
      if (!sessionId) {
        console.log('No session found, creating new session...');
        const sessionResult = await apiService.createSession();
        if (!sessionResult.success) {
          return sessionResult;
        }
        sessionId = sessionResult.data.session_id;
        console.log('Created new session for upload:', sessionId);
      }
      
      const formData = new FormData();
      files.forEach((file) => {
        formData.append(`files`, file);
      });

      const response = await api.post('/upload-documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Session-ID': sessionId,
        },
      });

      console.log('Upload response:', response.data);
      
      // Ensure session ID is updated from response
      const responseSessionId = response.headers['x-session-id'] || response.data.session_id;
      if (responseSessionId && responseSessionId !== sessionId) {
        setSessionId(responseSessionId);
        console.log('Updated session ID from upload response:', responseSessionId);
      }
      
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Upload error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Upload failed' 
      };
    }
  },

  // Send chat message with proper error handling
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
        history: history.map(msg => ({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content,
          timestamp: msg.timestamp
        })),
        documents: documents || [],
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
        let errorMessage = 'Chat request failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
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
                  
                  // Handle errors in streaming response
                  if (data.error) {
                    throw new Error(data.error);
                  }
                  
                  // Handle content chunks
                  if (data.content) {
                    fullResponse += data.content;
                    onChunk(data.content);
                  }
                  
                  // Handle completion
                  if (data.done) {
                    return { success: true, data: { response: fullResponse } };
                  }
                } catch (parseError) {
                  console.warn('Failed to parse SSE data:', line);
                  // Don't throw here, just continue
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
      console.error('Chat API Error:', error);
      return { 
        success: false, 
        error: error.message || 'Chat request failed' 
      };
    }
  },

  // List documents
  listDocuments: async (): Promise<ApiResponse> => {
    try {
      const sessionId = getSessionId();
      console.log('Listing documents for session:', sessionId);
      
      if (!sessionId) {
        console.log('No session ID available for listing documents');
        return { success: true, data: { documents: [], count: 0 } };
      }
      
      const response = await api.get('/documents', {
        headers: {
          'X-Session-ID': sessionId,
        },
      });
      console.log('Documents response:', response.data);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('List documents error:', error);
      
      // If session not found, try to create a new one
      if (error.response?.status === 404 && error.response?.data?.detail?.includes('Session')) {
        console.log('Session not found, clearing local session');
        currentSessionId = null;
        localStorage.removeItem('sessionId');
      }
      
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

  // Clear all documents and session
  clearAllDocuments: async (): Promise<ApiResponse> => {
    try {
      const sessionId = getSessionId();
      if (sessionId) {
        // Delete the session which will clear all documents
        const response = await api.delete(`/session/${sessionId}`);
        // Clear local session
        currentSessionId = null;
        localStorage.removeItem('sessionId');
        return { success: true, data: response.data };
      }
      return { success: true, data: { message: 'No session to clear' } };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Failed to clear documents' 
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
    console.log('Session cleared');
  },
};

export default api;