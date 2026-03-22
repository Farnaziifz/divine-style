import api from './api';
import type { AuthUser } from './auth.service';

export interface ProfileUpdateDto {
  name?: string;
  lastName?: string;
  job?: string;
  nationalCode?: string;
  addresses?: Array<{
    id?: string;
    province: string;
    city: string;
    address: string;
    plaque?: string;
    unit?: string;
    postalCode?: string;
    isDefault?: boolean;
  }>;
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
