export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const API_CONFIG = {
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
};

export const getApiUrl = (endpoint: string): string => {
  return `${API_URL}${endpoint}`;
}; 