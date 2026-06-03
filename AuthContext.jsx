import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

const API_URL = 'http://localhost:5000/api/auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('crm_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clear errors helper
  const clearError = () => setError(null);

  // Get User Profile
  const fetchUserProfile = useCallback(async (authToken) => {
    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setUser(resData.data || resData);
      } else {
        // Token is invalid/expired
        handleLogout();
        setError(resData.message || 'Session expired');
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
      // Don't log out on network error, just stop loading
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize Auth State from LocalStorage
  useEffect(() => {
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, [token, fetchUserProfile]);

  // Login Handler
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        localStorage.setItem('crm_token', resData.token);
        setToken(resData.token);
        setUser({
          _id: resData._id,
          name: resData.name,
          email: resData.email,
          role: resData.role,
        });
        return { success: true };
      } else {
        setError(resData.message || 'Invalid email or password');
        return { success: false, message: resData.message || 'Invalid email or password' };
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error, please try again.');
      return { success: false, message: 'Network error, please try again.' };
    } finally {
      setLoading(false);
    }
  };

  // Register Handler (for initial setups if needed)
  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        localStorage.setItem('crm_token', resData.token);
        setToken(resData.token);
        setUser({
          _id: resData._id,
          name: resData.name,
          email: resData.email,
          role: resData.role,
        });
        return { success: true };
      } else {
        setError(resData.message || 'Registration failed');
        return { success: false, message: resData.message || 'Registration failed' };
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Network error, please try again.');
      return { success: false, message: 'Network error, please try again.' };
    } finally {
      setLoading(false);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('crm_token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const logout = () => {
    handleLogout();
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
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
