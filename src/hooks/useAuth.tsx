import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, AuthState } from '@/types';
import { apiGet, apiPost } from '@/lib/api';

const STORAGE_KEY = 'surveypanelgo_auth';
const TOKEN_KEY = 'surveypanelgo_token';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface GoogleLoginPayload {
  token: string;
}

export interface LoginResult {
  success: boolean;
  user?: User;
  error?: string;
}

interface AuthContextType extends AuthState {
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<LoginResult>;
  register: (payload: RegisterPayload) => Promise<LoginResult>;
  googleLogin: (payload: GoogleLoginPayload) => Promise<LoginResult>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAdmin: () => boolean;
  isUser: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) {
      setState((s) => ({ ...s, isLoading: false }));
      setToken(null);
      return;
    }
    setToken(t);
    void apiGet<{ user: User }>('/api/auth/me', t)
      .then(({ user }) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        setState({ user, isAuthenticated: true, isLoading: false });
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(STORAGE_KEY);
        setState({ user: null, isAuthenticated: false, isLoading: false });
        setToken(null);
      });
  }, []);

  const login = async (credentials: LoginCredentials): Promise<LoginResult> => {
    try {
      const data = await apiPost<{ token: string; user: User }>('/api/auth/login', credentials);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setState({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true, user: data.user };
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : 'Login failed',
      };
    }
  };

  const register = async (payload: RegisterPayload): Promise<LoginResult> => {
    try {
      const data = await apiPost<{ token: string; user: User }>('/api/auth/register', payload);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setState({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true, user: data.user };
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : 'Registration failed',
      };
    }
  };

  const googleLogin = async (payload: GoogleLoginPayload): Promise<LoginResult> => {
    try {
      console.log('Attempting Google login with token:', payload.token?.substring(0, 50) + '...');
      const data = await apiPost<{ token: string; user: User }>('/api/auth/google', payload);
      console.log('Google login successful, user data:', data);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
      setToken(data.token);
      setState({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });
      return { success: true, user: data.user };
    } catch (e) {
      console.error('Google login error in frontend:', e);
      return {
        success: false,
        error: e instanceof Error ? e.message : 'Google login failed',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const refreshUser = async () => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) return;
    const { user } = await apiGet<{ user: User }>('/api/auth/me', t);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    setState((prev) => ({ ...prev, user }));
  };

  const isAdmin = () => state.user?.role === 'admin';
  const isUser = () => state.user?.role === 'user';

  return (
    <AuthContext.Provider
      value={{
        ...state,
        token,
        login,
        register,
        googleLogin,
        logout,
        refreshUser,
        isAdmin,
        isUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
