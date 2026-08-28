/** Ribbon Modernism commerce: one lightweight shared bag keeps purchase choices local to the customer browser until secure checkout. */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "@/lib/catalog";
import { trackAddToCart } from "@/lib/analytics";

export type CartLine = Product & { quantity: number };
type CartValue = { lines: CartLine[]; count: number; subtotal: number; add: (product: Product) => void; adjust: (id: string, amount: number) => void; remove: (id: string) => void; clear: () => void; };
const CartContext = createContext<CartValue | null>(null);
const storageKey = "rinovabd-v2-cart";

function initialLines() { try { const stored = window.localStorage.getItem(storageKey); return stored ? JSON.parse(stored) as CartLine[] : []; } catch { return []; } }
export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(initialLines);
  useEffect(() => { window.localStorage.setItem(storageKey, JSON.stringify(lines)); }, [lines]);
  const value = useMemo<CartValue>(() => ({
    lines,
    count: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: lines.reduce((sum, line) => sum + line.quantity * line.price, 0),
    add: (product) => setLines((current) => { const existing = current.find((line) => line.id === product.id); const canAdd = product.stock > 0 && (!existing || existing.quantity < product.stock); if (canAdd) trackAddToCart(product); if (existing) return current.map((line) => line.id === product.id ? { ...line, quantity: Math.min(line.quantity + 1, Math.max(1, product.stock)) } : line); return product.stock > 0 ? [...current, { ...product, quantity: 1 }] : current; }),
    adjust: (id, amount) => setLines((current) => current.flatMap((line) => { if (line.id !== id) return [line]; const quantity = Math.min(line.quantity + amount, Math.max(1, line.stock)); return quantity > 0 ? [{ ...line, quantity }] : []; })),
    remove: (id) => setLines((current) => current.filter((line) => line.id !== id)),
    clear: () => setLines([]),
  }), [lines]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() { const context = useContext(CartContext); if (!context) throw new Error("useCart must be used inside CartProvider."); return context; }
