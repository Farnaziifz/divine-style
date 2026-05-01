function normalizeBaseUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error('VITE_API_URL is required');
  }
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `http://${trimmed}`;
  return withProtocol.replace(/\/+$/, '');
}

export const API_BASE_URL = normalizeBaseUrl(
  (import.meta.env.VITE_API_URL as string | undefined) ?? '',
);

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

export function resolveImageUrl(path?: string | null): string | null {
  if (!path) return null;
  const value = path.trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('/')) return `${API_BASE_URL}${value}`;
  return `${API_BASE_URL}/${value}`;
}
