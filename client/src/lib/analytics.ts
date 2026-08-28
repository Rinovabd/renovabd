/** Ribbon Modernism analytics: GTM-first, consent-gated commerce signals use only public catalogue and anonymous order values. */
import type { CartLine } from "@/contexts/CartContext";
import type { Order } from "@/lib/api";
import type { Product } from "@/lib/catalog";

declare global { interface Window { dataLayer?: Record<string, unknown>[]; } }

const consentKey = "rinovabd-v2-analytics-consent";
const privateRoute = (path: string) => /^(\/admin|\/account|\/cart|\/checkout|\/invoice\/|\/track\/)/.test(path);
const consentGranted = () => window.localStorage.getItem(consentKey) === "granted";
const push = (payload: Record<string, unknown>) => { window.dataLayer = window.dataLayer || []; window.dataLayer.push(payload); };
const item = (product: Pick<Product, "id" | "name" | "category" | "price">, quantity = 1) => ({ item_id: product.id, item_name: product.name, item_category: product.category, price: product.price, quantity });

export const setAnalyticsConsent = (granted: boolean) => { window.localStorage.setItem(consentKey, granted ? "granted" : "denied"); push({ event: "consent", analytics_storage: granted ? "granted" : "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" }); if (granted) window.dispatchEvent(new Event("rinova-consent-granted")); };
export const analyticsConsentIsKnown = () => window.localStorage.getItem(consentKey) !== null;
export const trackPage = (path: string) => { if (!consentGranted() || privateRoute(path)) return; push({ event: "rinova_page_view", page_path: path, page_location: window.location.origin + path, page_title: document.title }); };
export const trackItemList = (listName: string, products: Product[]) => { if (!consentGranted()) return; push({ event: "view_item_list", item_list_name: listName, items: products.map((product, index) => ({ ...item(product), index })) }); };
export const trackAddToCart = (product: Product) => { if (!consentGranted()) return; push({ event: "add_to_cart", currency: "BDT", value: product.price, items: [item(product)] }); };
export const trackCart = (lines: CartLine[]) => { if (!consentGranted() || !lines.length) return; push({ event: "view_cart", currency: "BDT", value: lines.reduce((sum, line) => sum + line.price * line.quantity, 0), items: lines.map((line) => item(line, line.quantity)) }); };
export const trackBeginCheckout = (lines: CartLine[]) => { if (!consentGranted() || !lines.length) return; push({ event: "begin_checkout", currency: "BDT", value: lines.reduce((sum, line) => sum + line.price * line.quantity, 0), items: lines.map((line) => item(line, line.quantity)) }); };
export const trackPurchase = (order: Order) => { if (!consentGranted()) return; push({ event: "purchase", transaction_id: order.id, currency: "BDT", value: order.total, shipping: order.delivery, items: order.items.map((line) => ({ item_id: line.id, item_name: line.name, price: line.unitPrice, quantity: line.quantity })) }); };
