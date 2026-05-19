import React, { createContext, useContext, useState } from "react";
import { apiClient, tokenStorage } from "@/lib/axios";
import { AuthResponse, User } from "@shared/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string, isPhone?: boolean) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  register: (phone: string, username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    const token = tokenStorage.get();
    if (!token) return;
    setIsLoading(true);
    apiClient
      .get<{ user: User }>("/auth/me")
      .then((response) => setUser(response.data.user))
      .catch(() => {
        tokenStorage.remove();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (identifier: string, password: string, isPhone = false) => {
    setIsLoading(true);
    try {
      const payload = isPhone
        ? { phone: identifier, password }
        : { email: identifier, password };
      const response = await apiClient.post<AuthResponse>("/auth/login", payload);
      tokenStorage.set(response.data.token);
      setUser(response.data.user);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Login failed";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (phone: string, username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<AuthResponse>("/auth/register", {
        phone,
        username,
        password,
      });
      tokenStorage.set(response.data.token);
      setUser(response.data.user);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Registration failed";
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    tokenStorage.remove();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
