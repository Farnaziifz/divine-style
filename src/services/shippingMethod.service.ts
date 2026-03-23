import api from './api';

export type ShippingMethodDto = {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export const shippingMethodService = {
  getAll: async (): Promise<ShippingMethodDto[]> => {
    const { data } = await api.get<ShippingMethodDto[]>('/shipping-methods');
    return data;
  },
};

