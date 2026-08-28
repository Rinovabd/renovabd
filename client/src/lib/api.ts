/** Ribbon Modernism: API calls are explicit, small, and restricted to the dedicated Rinovabd v2 origin. */
import type { Product } from "./catalog";

export const API_BASE = (import.meta.env.VITE_RINOVABD_API_URL || "https://api-v2.rinovabd.com").replace(/\/$/, "");

type ApiErrorShape = { error?: { message?: string } };

async function request<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers: { "content-type": "application/json", ...(options.headers || {}) } });
  if (!response.ok) {
    const details = await response.json().catch(() => ({})) as ApiErrorShape;
    throw new Error(details.error?.message || `Request failed with ${response.status}.`);
  }
  return response.json() as Promise<T>;
}

export async function fetchProducts() {
  const result = await request<{ products: Product[] }>("/api/products");
  return result.products;
}

export async function adminLogin(token: string) {
  return request<{ session: string; expiresInSeconds: number }>("/api/admin/login", { method: "POST", body: JSON.stringify({ token }) });
}

const sessionHeaders = (session: string) => ({ "x-admin-session": session });

export async function fetchAdminProducts(session: string) {
  const result = await request<{ products: Product[] }>("/api/admin/products", { headers: sessionHeaders(session) });
  return result.products;
}

export async function saveAdminProduct(session: string, product: Product, existing: boolean) {
  const path = existing ? `/api/admin/products/${encodeURIComponent(product.id)}` : "/api/admin/products";
  const result = await request<{ product: Product }>(path, { method: existing ? "PATCH" : "POST", headers: sessionHeaders(session), body: JSON.stringify(product) });
  return result.product;
}

export async function uploadMedia(session: string, file: File) {
  const response = await fetch(`${API_BASE}/api/media`, { method: "POST", headers: { "x-admin-session": session, "content-type": file.type, "x-filename": file.name }, body: file });
  if (!response.ok) {
    const details = await response.json().catch(() => ({})) as ApiErrorShape;
    throw new Error(details.error?.message || `Image upload failed with ${response.status}.`);
  }
  return response.json() as Promise<{ asset: { id: string; key: string; url: string; type: string; size: number } }>;
}
