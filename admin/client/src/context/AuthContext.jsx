import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

// Create the context
const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        setIsAuthenticated(false);
        return;
      }
      
      try {
        const res = await api.get('/auth/verify');
        
        if (res.data.success) {
          setIsAuthenticated(true);
          setUser(res.data.user);
        } else {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth verification error:', error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
      }
      
      setLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = '/login';
  };

  const value = {
    isAuthenticated,
    loading,
    user,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export both named and default exports
export { AuthContext };
export default AuthContext;