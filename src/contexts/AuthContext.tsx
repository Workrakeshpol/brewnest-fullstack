import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import supabase from '../lib/supabase';
import { authApi } from '../lib/api';

import { Profile as AuthUser, UserRoleType as UserRole } from '../types';

interface AuthContextValue {
  user: AuthUser | null;
  role: UserRole;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<UserRole>('customer');
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setUser(null);
        setRole('customer');
        return;
      }

      const result = await authApi.getCurrentUser();
      setUser(result.user);
      setRole(result.role);
    } catch {
      setUser(null);
      setRole('customer');
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser().finally(() => setLoading(false));

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchCurrentUser();
    });

    return () => subscription.unsubscribe();
  }, [fetchCurrentUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await authApi.signIn(email, password);
    // Set the session in the Supabase client
    await supabase.auth.setSession({
      access_token: result.session.access_token,
      refresh_token: result.session.refresh_token,
    });
    setUser(result.user);
    setRole(result.role);
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    await authApi.signUp(email, password, name);
    // Auto sign-in after sign-up
    await signIn(email, password);
  }, [signIn]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole('customer');
  }, []);

  const refresh = useCallback(async () => {
    await fetchCurrentUser();
  }, [fetchCurrentUser]);

  return (
    <AuthContext.Provider value={{ user, role, loading, signIn, signUp, signOut, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
