// AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  // returns token on success
  login: (email: string, password: string) => Promise<string>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: async () => {
    return '';
  },
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    setIsAuthenticated(!!token);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post('/auth/login', { email, password });
      const token = res.data?.token;
      if (!token) throw new Error('Invalid server response');
      localStorage.setItem('jwt', token);
      setIsAuthenticated(true);
      return token;
    } catch (err: any) {
      if (err.response && err.response.data) {
        const msg = err.response.data.message || 'Invalid credentials';
        throw new Error(msg);
      }
      throw new Error('Unable to connect to authentication server');
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
