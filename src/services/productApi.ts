/**
 * Product API for divine-style-style frontend.
 * Fetches product by ID and maps API response to UI Product type.
 */

import { Product, ProductVariant } from '../types';
import { getApiBaseUrl, resolveImageUrl } from '../utils/imageUrl';

function getImageUrl(path: string | undefined | null): string {
  return resolveImageUrl(path) ?? '';
}

export type ApiSpecificationValue = string | number | boolean | null;

export interface ApiProductVariant {
  sku: string;
  size?: string | null;
  color?: string | null;
  colorCode?: string | null;
  price: number | string;
  discountPrice?: number | string | null;
  discountPercent?: number | null;
  stock: number;
  specifications?: Record<string, ApiSpecificationValue>;
}

export interface ApiProduct {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  category?: { id: string; title: string };
  collectionIds?: string[];
  collections?: { id: string; title: string }[];
  images: string[];
  variants?: ApiProductVariant[];
  createdAt?: string;
  updatedAt?: string;
}

function num(val: unknown): number {
  if (typeof val === 'number' && !Number.isNaN(val)) return val;
  if (typeof val === 'string') {
    const n = parseFloat(val);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

/**
 * Map API product to divine-style-style Product with full details:
 * gallery, sizes from variants, price/discount from first variant,
 * optional fabric/specs from variant specifications.
 */
export function mapApiProductToProduct(api: ApiProduct): Product {
  const variants = api.variants || [];
  const firstVariant = variants[0];

  const priceRaw = firstVariant?.price ?? 0;
  const discountPriceRaw = firstVariant?.discountPrice;
  const price = typeof priceRaw === 'string' ? Number(priceRaw) || 0 : Number(priceRaw);
  const discountPrice =
    discountPriceRaw != null && discountPriceRaw !== ''
      ? typeof discountPriceRaw === 'string'
        ? Number(discountPriceRaw) || undefined
        : Number(discountPriceRaw)
      : undefined;

  const images = api.images || [];
  const image = images[0];
  const gallery = images.length > 0 ? images.map(getImageUrl) : [];

  const toSpec = (s?: Record<string, ApiSpecificationValue>): Record<string, string | number> | undefined => {
    if (!s) return undefined;
    const out = Object.fromEntries(
      Object.entries(s).filter(
        ([_, val]) =>
          val != null &&
          val !== '' &&
          (typeof val === 'string' || typeof val === 'number')
      )
    ) as Record<string, string | number>;
    return Object.keys(out).length > 0 ? out : undefined;
  };

  const productVariants: ProductVariant[] = variants.map((v) => {
    const p = typeof v.price === 'string' ? Number(v.price) || 0 : Number(v.price);
    const dp =
      v.discountPrice != null && v.discountPrice !== ''
        ? typeof v.discountPrice === 'string'
          ? Number(v.discountPrice) || undefined
          : Number(v.discountPrice)
        : undefined;
    return {
      size: v.size != null ? String(v.size) : undefined,
      color: v.color != null ? String(v.color) : undefined,
      colorCode: v.colorCode != null ? String(v.colorCode) : undefined,
      price: p,
      discountPrice: dp,
      stock: v.stock ?? 0,
      specifications: toSpec(v.specifications),
    };
  });

  // Build sizes from variants: یک ورودی به ازای هر سایز با مشخصات اولین واریانتی که آن سایز را دارد
  const sizeMap = new Map<
    string,
    { available: boolean; specs?: Record<string, ApiSpecificationValue> }
  >();
  for (const v of variants) {
    const label = v.size != null ? String(v.size) : 'One Size';
    const current = sizeMap.get(label);
    const available = (current?.available ?? false) || (v.stock > 0);
    // اولین واریانت برای این سایز را نگه می‌داریم تا با تغییر سایز مقادیر جدول عوض شوند
    const specs = current?.specs ?? v.specifications ?? undefined;
    sizeMap.set(label, { available, specs });
  }

  const sizes =
    sizeMap.size > 0
      ? Array.from(sizeMap.entries()).map(([label, { available, specs }]) => {
          const bust = num(specs?.['dor_sine'] ?? specs?.['bust']);
          const waist = num(specs?.['dor_kamar'] ?? specs?.['waist']);
          const hips = num(specs?.['dor_basan'] ?? specs?.['hips']);
          const length = num(specs?.['height'] ?? specs?.['length']);
          const sleeve = num(specs?.['qad_astin'] ?? specs?.['sleeve']);
          const hasDims =
            bust > 0 || waist > 0 || hips > 0 || length > 0 || sleeve > 0;
          const dims = hasDims
            ? {
                bust: bust || 0,
                waist: waist || 0,
                hips: hips || 0,
                length: length || 0,
                ...(sleeve > 0 ? { sleeve } : {}),
              }
            : {
                bust: 86,
                waist: 70,
                hips: 94,
                length: 100,
              };
          const specifications: Record<string, string | number> | undefined =
            specs
              ? (Object.fromEntries(
                  Object.entries(specs).filter(
                    ([_, val]) =>
                      val != null &&
                      val !== '' &&
                      (typeof val === 'string' || typeof val === 'number')
                  )
                ) as Record<string, string | number>)
              : undefined;
          const hasSpecs =
            specifications && Object.keys(specifications).length > 0;
          return {
            label: String(label),
            available,
            dims,
            ...(hasSpecs ? { specifications } : {}),
          };
        })
      : undefined;

  // Optional fabric from first variant specifications
  let fabric: Product['fabric'] = undefined;
  const fabricName =
    firstVariant?.specifications?.['fabricName'] ??
    firstVariant?.specifications?.['fabric'];
  const composition =
    firstVariant?.specifications?.['composition'] ??
    firstVariant?.specifications?.['material'];
  const fabricImage = firstVariant?.specifications?.['fabricImage'];
  if (
    (typeof fabricName === 'string' && fabricName) ||
    (typeof composition === 'string' && composition)
  ) {
    fabric = {
      name: typeof fabricName === 'string' ? fabricName : 'Fabric',
      composition:
        typeof composition === 'string' ? composition : 'See description',
      image:
        typeof fabricImage === 'string' && fabricImage
          ? getImageUrl(fabricImage)
          : 'https://images.unsplash.com/photo-1575459286821-6531398c8c64?q=80&w=200&auto=format&fit=crop',
    };
  }

  return {
    id: api.id,
    name: api.title,
    price,
    discountPrice,
    description: api.description ?? '',
    image: getImageUrl(image) || '',
    gallery: gallery.length > 0 ? gallery : undefined,
    category: api.category?.title ?? '',
    categoryId: api.categoryId,
    sizes,
    variants: productVariants.length > 0 ? productVariants : undefined,
    fabric,
    reviews: [],
  };
}

export async function fetchProductById(id: string): Promise<Product> {
  const base = getApiBaseUrl();
  const url = `${base}/products/${id}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Product ${id} not found (${res.status})`);
  }
  const data = (await res.json()) as ApiProduct;
  return mapApiProductToProduct(data);
}

export interface FetchProductListParams {
  isFeatured?: boolean;
  showInIntro?: boolean;
  categoryId?: string;
  limit?: number;
  page?: number;
}

export async function fetchProductList(
  params: FetchProductListParams = {}
): Promise<Product[]> {
  const base = getApiBaseUrl();
  const search = new URLSearchParams();
  if (params.page != null) search.set('page', String(params.page));
  search.set('limit', String(params.limit ?? 20));
  if (params.isFeatured === true) search.set('isFeatured', 'true');
  if (params.showInIntro === true) search.set('showInIntro', 'true');
  if (params.categoryId) search.set('categoryId', params.categoryId);
  const url = `${base}/products?${search.toString()}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const json = (await res.json()) as { data?: ApiProduct[] };
  const list = json.data ?? [];
  return list.map((p) => mapApiProductToProduct(p));
}
