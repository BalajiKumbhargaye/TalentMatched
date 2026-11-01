import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getMe } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize user from token on app load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (err) {
          console.warn('Auth token validation failed:', err.message);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login action
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await loginUser({ email, password });
      if (res.success && res.token) {
        localStorage.setItem('token', res.token);
        setToken(res.token);
        setUser(res.user);
        return { success: true, user: res.user };
      }
    } catch (err) {
      setError(err.message || 'Login failed');
      return { success: false, message: err.message || 'Login failed' };
    }
  };

  // Register action
  const register = async (userData) => {
    setError(null);
    try {
      const res = await registerUser(userData);
      if (res.success && res.token) {
        localStorage.setItem('token', res.token);
        setToken(res.token);
        setUser(res.user);
        return { success: true, user: res.user };
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
      return { success: false, message: err.message || 'Registration failed' };
    }
  };

  // Logout action
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Refresh user data (e.g. after uploading resume or adding skill)
  const refreshUser = async () => {
    try {
      const res = await getMe();
      if (res.success && res.user) {
        setUser(res.user);
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  // Update user state locally
  const updateUserLocally = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
  };

  const isStudent = user?.role === 'student';
  const isRecruiter = user?.role === 'recruiter';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role,
        isStudent,
        isRecruiter,
        loading,
        error,
        login,
        register,
        logout,
        refreshUser,
        updateUserLocally,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
