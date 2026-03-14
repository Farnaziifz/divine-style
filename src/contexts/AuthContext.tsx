import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthUser } from '../services/auth.service';

const USER_STORAGE_KEY = 'user';
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (accessToken: string, refreshToken: string, user: AuthUser) => void;
  logout: () => void;
  updateUser: (userData: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    const storedUser = parseStoredUser();
    if (token && storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const login = useCallback((accessToken: string, refreshToken: string, userData: AuthUser) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const updateUser = useCallback((userData: AuthUser) => {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
