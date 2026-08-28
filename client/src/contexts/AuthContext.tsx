/** Ribbon Modernism security: customer sessions remain in session storage and are exchanged only with the new Cloudflare v2 API. */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { customerLogin, customerLogout, customerMe, customerRegister, type Customer } from "@/lib/api";

type AuthValue = { user: Customer | null; ready: boolean; signIn: (email: string, password: string) => Promise<void>; register: (name: string, email: string, password: string) => Promise<void>; signOut: () => Promise<void>; };
const AuthContext = createContext<AuthValue | null>(null);
const key = "rinovabd-v2-customer-session";
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Customer | null>(null); const [ready, setReady] = useState(false);
  const save = (session: string, next: Customer) => { window.sessionStorage.setItem(key, session); setUser(next); };
  useEffect(() => { const session = window.sessionStorage.getItem(key); if (!session) { setReady(true); return; } customerMe(session).then((result) => setUser(result.user)).catch(() => window.sessionStorage.removeItem(key)).finally(() => setReady(true)); }, []);
  const value = useMemo<AuthValue>(() => ({ user, ready,
    signIn: async (email, password) => { const result = await customerLogin(email, password); save(result.session, result.user); },
    register: async (name, email, password) => { const result = await customerRegister(name, email, password); save(result.session, result.user); },
    signOut: async () => { const session = window.sessionStorage.getItem(key); if (session) await customerLogout(session).catch(() => undefined); window.sessionStorage.removeItem(key); setUser(null); },
  }), [user, ready]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error("useAuth must be used inside AuthProvider."); return context; }
