/**
 * فرمت عدد به عنوان قیمت با واحد تومان (با جداکننده هزارگان برای فارسی)
 */
export function formatPriceToman(price: number): string {
  return `${Number(price).toLocaleString('fa-IR')} تومان`;
}
