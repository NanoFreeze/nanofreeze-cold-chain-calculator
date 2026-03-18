export interface AuthContextValues {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User, refreshToken?: string) => void;
  logout: () => void;
  renewToken: () => Promise<string | null>;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  sub?: string;
  roles?: Array<{
    id: string;
    name: string;
    hierarchy: number;
    description: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  teams?: Array<{
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }>;
  activeTeamId?: string;
  locations?: Array<unknown>;
  activeLocationId?: string;
}
