/**
 * KisanGuard AI — AuthContext
 *
 * Provides a React context wrapping native JWT authentication.
 * Single source of truth for user authentication state.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentAccount, getMe, loginAccount, registerAccount, logoutAccount } from '../services/authService.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getCurrentAccount());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const verifiedUser = await getMe();
        if (isMounted) {
          setUser(verifiedUser || null);
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials) => {
    const loggedUser = await loginAccount(credentials);
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (userData) => {
    const registeredUser = await registerAccount(userData);
    setUser(registeredUser);
    return registeredUser;
  };

  const logout = async () => {
    await logoutAccount();
    setUser(null);
  };

  const refreshUser = () => {
    const cached = getCurrentAccount();
    setUser(cached);
  };

  const isAuthenticated = Boolean(user && (user.id || user._id));

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};

export default AuthContext;
