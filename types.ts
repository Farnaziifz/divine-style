export interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  date: string;
  rating: number; // 1-5
  comment: string;
  role?: string; // e.g. "Verified Buyer"
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
  }[];
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
}

export type ChatRole = 'user' | 'model';

export interface ChatMessage {
  role: ChatRole;
  text: string;
}