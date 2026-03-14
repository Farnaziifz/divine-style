import api from './api';

export interface SendOtpResponse {
  message: string;
  expiresAt: string;
  code?: string;
}

export interface AuthUser {
  id: string;
  mobile: string;
  role?: string;
  name?: string | null;
  lastName?: string | null;
  job?: string | null;
  nationalCode?: string | null;
}

export interface VerifyOtpResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export const authService = {
  sendOtp: async (mobile: string): Promise<SendOtpResponse> => {
    const response = await api.post('/auth/otp', { mobile });
    return response.data;
  },

  verifyOtp: async (mobile: string, code: string): Promise<VerifyOtpResponse> => {
    const response = await api.post('/auth/verify', { mobile, code });
    return response.data;
  },

  login: async (mobile: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', { mobile, password });
    return response.data;
  },
};
