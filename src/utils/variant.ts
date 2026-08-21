import { Product } from '../types';

/** آیا محصول بیش از یک رنگ دارد؟ در این حالت افزودن سریع به سبد بدون انتخاب رنگ مجاز نیست */
export function hasMultipleColors(product: Pick<Product, 'variants'>): boolean {
  const colors = new Set((product.variants ?? []).map((v) => v.color).filter(Boolean));
  return colors.size > 1;
}
