export interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  date: string;
  rating: number; // 1-5
  comment: string;
  role?: string; // e.g. "Verified Buyer"
}

/** واریانت محصول: هر ترکیب سایز + رنگ مشخصات و قیمت خودش را دارد */
export interface ProductVariant {
  size?: string;
  color?: string;
  colorCode?: string;
  price: number;
  discountPrice?: number;
  stock: number;
  /** مشخصات این واریانت (سایز+رنگ) */
  specifications?: Record<string, string | number>;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice?: number; // Optional discounted price
  description: string;
  image: string;
  gallery?: string[]; // Array of images for 3D view
  video?: string; // URL to video
  category: string;
  categoryId?: string;
  isFeatured?: boolean;
  reviews?: Review[];
  fabric?: {
    name: string;
    image: string; // URL to fabric texture
    composition: string;
  };
  sizes?: {
    label: string;
    available: boolean;
    dims: {
      bust: number;
      waist: number;
      hips: number;
      length: number;
      sleeve?: number;
    };
    /** مشخصات خام از API برای نمایش در جدول اندازه (مثلاً dor_sine، height، qad_astin، baft) */
    specifications?: Record<string, string | number>;
  }[];
  /** واریانت‌ها (هر ترکیب سایز+رنگ با مشخصات و قیمت خودش) */
  variants?: ProductVariant[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  basketItemId?: string;
}

export type ChatRole = 'user' | 'model';

export interface ChatMessage {
  role: ChatRole;
  text: string;
}
