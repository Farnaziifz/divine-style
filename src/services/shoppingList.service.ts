import api from './api';
import type { Product } from '../types';
import type { ApiProduct } from './productApi';
import { mapApiProductToProduct } from './productApi';

export interface ShoppingListItemResponse {
  id: string;
  productId: string;
  addedAt: string;
  product: ApiProduct;
}

export interface ShoppingListResponse {
  items: ShoppingListItemResponse[];
}

export const shoppingListService = {
  add: async (productId: string): Promise<ShoppingListItemResponse> => {
    const { data } = await api.post<ShoppingListItemResponse>('/shopping-list', {
      productId,
    });
    return data;
  },

  remove: async (productId: string): Promise<void> => {
    await api.delete(`/shopping-list/${productId}`);
  },

  getList: async (): Promise<{ items: { id: string; productId: string; addedAt: string; product: Product }[] }> => {
    const { data } = await api.get<ShoppingListResponse>('/shopping-list');
    return {
      items: data.items.map((row) => ({
        id: row.id,
        productId: row.productId,
        addedAt: row.addedAt,
        product: mapApiProductToProduct(row.product),
      })),
    };
  },

  checkInList: async (productId: string): Promise<boolean> => {
    const { data } = await api.get<{ inList: boolean }>(`/shopping-list/has/${productId}`);
    return data.inList;
  },
};
