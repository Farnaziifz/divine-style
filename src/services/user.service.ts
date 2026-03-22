import api from './api';
import type { AuthUser } from './auth.service';

export interface ProfileUpdateDto {
  name?: string;
  lastName?: string;
  job?: string;
  nationalCode?: string;
}

export type UserAddress = {
  id: string;
  province: string;
  city: string;
  address: string;
  plaque?: string;
  unit?: string;
  postalCode?: string;
  isDefault?: boolean;
};

export type CreateUserAddressDto = Omit<UserAddress, 'id'>;
export type UpdateUserAddressDto = Partial<Omit<UserAddress, 'id'>>;

export const userService = {
  getProfile: async (): Promise<AuthUser> => {
    const { data } = await api.get<AuthUser>('/user/profile');
    return data;
  },

  updateProfile: async (body: ProfileUpdateDto): Promise<AuthUser> => {
    const { data } = await api.put<AuthUser>('/user/profile', body);
    return data;
  },

  getMyAddresses: async (): Promise<UserAddress[]> => {
    const { data } = await api.get<UserAddress[]>('/user/profile/addresses');
    return data;
  },

  addMyAddress: async (body: CreateUserAddressDto): Promise<UserAddress[]> => {
    const { data } = await api.post<UserAddress[]>('/user/profile/addresses', body);
    return data;
  },

  updateMyAddress: async (addressId: string, body: UpdateUserAddressDto): Promise<UserAddress[]> => {
    const { data } = await api.patch<UserAddress[]>(`/user/profile/addresses/${addressId}`, body);
    return data;
  },

  deleteMyAddress: async (addressId: string): Promise<UserAddress[]> => {
    const { data } = await api.delete<UserAddress[]>(`/user/profile/addresses/${addressId}`);
    return data;
  },
};
