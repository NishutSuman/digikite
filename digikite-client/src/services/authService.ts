import api from '../utils/api';
import type { AuthResponse, LoginCredentials, RegisterCredentials } from '../types/auth';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data.data; // Extract the nested data
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', credentials);
    return response.data.data; // Extract the nested data
  },

  googleAuth: async (tokenResponse: any): Promise<AuthResponse> => {
    const response = await api.post('/auth/google', {
      token: tokenResponse.credential,
    });
    return response.data.data; // Extract the nested data
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data.data; // Extract the nested data
  },
};