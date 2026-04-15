// API configuration utility
// This helps manage API URLs across different environments

export const getApiUrl = () => {
  // In production (Vercel), use the environment variable
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://api.campuscare.com';
  }
  
  // In development, use localhost
  return import.meta.env.VITE_API_URL || 'http://localhost:4000';
};

export const apiCall = async (endpoint, options = {}) => {
  const url = `${getApiUrl()}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};

export default { getApiUrl, apiCall };
