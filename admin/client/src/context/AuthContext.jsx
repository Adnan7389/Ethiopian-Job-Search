import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const res = await api.get('/auth/verify', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (res.data.success) {
          setIsAuthenticated(true);
          setUser(res.data.user);
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        localStorage.removeItem('token');
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const res = await api.post('/auth/login', { username, password });
      
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setIsAuthenticated(true);
        setUser(res.data.user);
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        loading,
        user,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};