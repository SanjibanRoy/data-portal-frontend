// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://192.168.0.236:9900';
const TOKEN_REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    
    if (token) {
      setAuthToken(token);
      setIsAdmin(adminStatus);
      startTokenRefreshTimer();
    }
    setIsLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/users/login`,
        { username, password },
        { timeout: 10000 }
      );
     console.log(response.data)
      if (response.data.access_token) {
        setAuthToken(response.data.access_token);
        setIsAdmin(response.data.is_admin || false);
        
        localStorage.setItem('authToken', response.data.access_token);
        localStorage.setItem('isAdmin', response.data.is_admin ? 'true' : 'false');
        
        startTokenRefreshTimer();
        return true;
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
    return false;
  };

  const logout = () => {
    setAuthToken(null);
    setIsAdmin(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAdmin');
    clearTokenRefreshTimer();
    navigate('/login');
  };

  let tokenRefreshTimer;

  const startTokenRefreshTimer = () => {
    clearTokenRefreshTimer();
    tokenRefreshTimer = setInterval(refreshToken, TOKEN_REFRESH_INTERVAL);
  };

  const clearTokenRefreshTimer = () => {
    if (tokenRefreshTimer) {
      clearInterval(tokenRefreshTimer);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/users/refresh`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.data.access_token) {
        setAuthToken(response.data.access_token);
        localStorage.setItem('authToken', response.data.access_token);
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ 
      authToken, 
      isAdmin, 
      isLoading, 
      login, 
      logout, 
      refreshToken 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);