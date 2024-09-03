import React, { createContext, useContext, useState, useEffect } from 'react';
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  username: string | null;
  role: 'student' | 'teacher' | 'admin' | null;
  login: (username: string, role: 'student' | 'teacher' | 'admin', token: string, id: number) => void;
  id: number | null;
  logout: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<'student' | 'teacher' | 'admin' | null>(null);
  const [id, setId] = useState<number | null>(null);
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          },
        });
        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          setUsername(data.username);
          setRole(data.role);
          setId(data.id);
        } else {
          setIsAuthenticated(false);
          setUsername(null);
          setRole(null);
          setId(null);
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        setUsername(null);
        setRole(null);
        setId(null);
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = (username: string, role: 'student' | 'teacher' | 'admin', token: string, id: number) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    setUsername(username);
    setRole(role);
    setId(id);
  };
  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });
      if (response.ok) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUsername(null);
        setRole(null);
        setId(null); 
      } else {
        console.error('Logout failed:', await response.text());
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, username, role, login, logout, id }}>
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