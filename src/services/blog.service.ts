import api from './api';

export interface BlogCategory {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    title: string;
    slug: string;
  } | null;
}

export interface BlogPostDetail extends BlogPost {
  content: string;
  seo?: {
    title?: string | null;
    description?: string | null;
    keywords?: string[] | null;
    canonicalUrl?: string | null;
    ogTitle?: string | null;
    ogDescription?: string | null;
    ogImageUrl?: string | null;
    robotsNoIndex?: boolean;
    robotsNoFollow?: boolean;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  };
}

export const blogService = {
  getCategories: async () => {
    const res = await api.get<BlogCategory[]>('/blog/categories');
    return res.data;
  },
  getPosts: async (params?: {
    page?: number;
    limit?: number;
    categorySlug?: string;
    search?: string;
  }) => {
    const res = await api.get<PaginatedResponse<BlogPost>>('/blog/posts', {
      params,
    });
    return res.data;
  },
  getPostBySlug: async (slug: string) => {
    const res = await api.get<BlogPostDetail>(`/blog/posts/${slug}`);
    return res.data;
  },
};

