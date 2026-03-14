import api from './api';
import type { AuthUser } from './auth.service';

export interface ProfileUpdateDto {
  name?: string;
  lastName?: string;
  job?: string;
  nationalCode?: string;
}

export const userService = {
  getProfile: async (): Promise<AuthUser> => {
    const { data } = await api.get<AuthUser>('/user/profile');
    return data;
  },

  updateProfile: async (body: ProfileUpdateDto): Promise<AuthUser> => {
    const { data } = await api.put<AuthUser>('/user/profile', body);
    return data;
  },
};
