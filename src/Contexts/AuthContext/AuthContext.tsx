import { createContext, useContext, useState } from "react";
import type { AuthContextValues, User } from "./AuthContext.types";
import { useCookies } from "@/Hooks/useCookies/useCookies";
import { jwtDecode } from "jwt-decode";
import { refreshAccessToken } from "@/Services/Auth0/Auth0";

export const AuthContext = createContext<AuthContextValues>({} as AuthContextValues);

const TOKEN_KEY = 'FAIAccessToken';
const REFRESH_TOKEN_KEY = 'FAIRefreshToken';
const USER_KEY = 'FAIUser';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

  const { readCookie, createCookie, deleteCookie } = useCookies();
  const [user, setUser] = useState<User | null>(readCookie(USER_KEY) || null);
  const [token, setToken] = useState<string | null>(readCookie(TOKEN_KEY) || null);
  const [refreshToken, setRefreshToken] = useState<string | null>(readCookie(REFRESH_TOKEN_KEY) || null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!user && !!token);
  const [isLoading] = useState<boolean>(false);

  const login = (accessToken: string, userData: User, newRefreshToken?: string) => {
    setToken(accessToken);
    setUser(userData);
    setIsAuthenticated(true);

    const decodedToken = jwtDecode(accessToken);
    
    if (!decodedToken.exp) return;

    const expiresInDays = (new Date(decodedToken.exp * 1000).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);

    createCookie(TOKEN_KEY, accessToken, { expires: expiresInDays });
    createCookie(USER_KEY, userData, { expires: expiresInDays });

    if (newRefreshToken) {
      setRefreshToken(newRefreshToken);
      createCookie(REFRESH_TOKEN_KEY, newRefreshToken, { expires: 30 });
    }
  }

  const logout = () => {
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    setIsAuthenticated(false);
    deleteCookie(TOKEN_KEY);
    deleteCookie(REFRESH_TOKEN_KEY);
    deleteCookie(USER_KEY);
  }

  const renewToken = async (): Promise<string | null> => {
    if (!refreshToken) return null;

    try {
      const result = await refreshAccessToken(refreshToken);
      
      if (result.access_token) {
        setToken(result.access_token);
        
        const decodedToken = jwtDecode(result.access_token);
        if (decodedToken.exp) {
          const expiresInDays = (new Date(decodedToken.exp * 1000).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
          createCookie(TOKEN_KEY, result.access_token, { expires: expiresInDays });
        }

        if (result.refresh_token) {
          setRefreshToken(result.refresh_token);
          createCookie(REFRESH_TOKEN_KEY, result.refresh_token, { expires: 30 });
        }

        return result.access_token;
      }
    } catch {
      logout();
    }

    return null;
  }

  const value = {
    user,
    token,
    refreshToken,
    isAuthenticated,
    isLoading,
    login,
    logout,
    renewToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  return useContext(AuthContext);
}
