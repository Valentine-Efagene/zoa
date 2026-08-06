"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  getSession,
  signIn as authSignIn,
  signOut as authSignOut,
  type AuthSession,
} from "@/lib/auth";

interface AuthContextValue {
  session: AuthSession | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Cached client session so useSyncExternalStore snapshots stay referentially stable. */
let cachedSession: AuthSession | null | undefined;
const listeners = new Set<() => void>();

function getClientSession(): AuthSession | null {
  if (cachedSession === undefined) {
    cachedSession = getSession();
  }
  return cachedSession;
}

function setClientSession(session: AuthSession | null) {
  cachedSession = session;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** true on server / during hydration, false once the client snapshot is used. */
function subscribeHydrated() {
  return () => {};
}
function getClientHydrated() {
  return true;
}
function getServerHydrated() {
  return false;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = useSyncExternalStore(
    subscribe,
    getClientSession,
    () => null,
  );
  const hydrated = useSyncExternalStore(
    subscribeHydrated,
    getClientHydrated,
    getServerHydrated,
  );
  const loading = !hydrated;

  const refresh = useCallback(() => {
    setClientSession(getSession());
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const s = await authSignIn(email, password);
    setClientSession(s);
  }, []);

  const signOut = useCallback(() => {
    authSignOut();
    setClientSession(null);
  }, []);

  const value = useMemo(
    () => ({ session, loading, signIn, signOut, refresh }),
    [session, loading, signIn, signOut, refresh],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
