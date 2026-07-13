import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');
    const employeeId = localStorage.getItem('employeeId');

    if (token) {
      setUser({ 
        token, 
        role, 
        username, 
        employeeId: employeeId && employeeId !== 'null' ? parseInt(employeeId) : null 
      });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await API.post('/api/auth/login', { username, password });
      const { token, role, employeeId } = res.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('username', res.data.username);
      
      if (employeeId) {
        localStorage.setItem('employeeId', employeeId.toString());
      } else {
        localStorage.removeItem('employeeId');
      }
      
      const loggedUser = { 
        token, 
        role, 
        username: res.data.username, 
        employeeId: employeeId || null 
      };
      
      setUser(loggedUser);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.response?.data || 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('employeeId');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
