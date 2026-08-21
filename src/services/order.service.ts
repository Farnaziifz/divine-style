import api from './api';

export type OrderItemDto = {
  id: string;
  productId: string;
  productVariantId: string;
  sku: string;
  title: string;
  color?: string | null;
  size?: string | null;
  quantity: number;
  unitPrice: number;
  unitDiscountPrice: number | null;
  imageUrl?: string | null;
  createdAt: string;
};

export type OrderPaymentDto = {
  id: string;
  provider: string;
  status: string;
  amount: number;
  authority: string | null;
  refId: string | null;
  createdAt: string;
  verifiedAt: string | null;
};

export type OrderCommentDto = {
  id: string;
  orderId: string;
  authorRole: 'USER' | 'ADMIN';
  authorUser: {
    id: string;
    mobile: string;
    name?: string | null;
    lastName?: string | null;
  } | null;
  parentId: string | null;
  message: string;
  createdAt: string;
};

export type OrderDto = {
  id: string;
  orderCode: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  orderStatus?: 'PENDING_PAYMENT' | 'PAID' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELED';
  totalAmount: number;
  discountCode: string | null;
  discountAmount: number;
  shippingCost: number;
  shippingMethodId?: string | null;
  shippingMethodTitle?: string | null;
  shippingMethodPrice?: number | null;
  payableAmount: number;
  shippingAddress: any;
  createdAt: string;
  updatedAt: string;
  items: OrderItemDto[];
  payment: OrderPaymentDto | null;
};

export type OrderDetailsDto = Omit<OrderDto, 'payment'> & {
  paidAt?: string | null;
  payments: OrderPaymentDto[];
  comments: OrderCommentDto[];
};

export type Paginated<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  };
};

export const orderService = {
  getMyOrders: async (params?: { page?: number; limit?: number }): Promise<Paginated<OrderDto>> => {
    const { data } = await api.get<Paginated<OrderDto>>('/orders', {
      params: {
        ...(params?.page ? { page: params.page } : {}),
        ...(params?.limit ? { limit: params.limit } : {}),
      },
    });
    return data;
  },

  getOrderByCode: async (orderCode: string): Promise<OrderDetailsDto> => {
    const { data } = await api.get<OrderDetailsDto>(
      `/orders/${encodeURIComponent(orderCode)}`,
    );
    return data;
  },

  createComment: async (params: {
    orderCode: string;
    message: string;
    parentId?: string;
  }): Promise<OrderCommentDto> => {
    const { data } = await api.post<OrderCommentDto>(
      `/orders/${encodeURIComponent(params.orderCode)}/comments`,
      {
        message: params.message,
        ...(params.parentId ? { parentId: params.parentId } : {}),
      },
    );
    return data;
  },
};
