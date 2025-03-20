import React, { useEffect } from 'react';
import { router } from 'expo-router';
import useAuthStore from '../store/auth';
import { isTokenValid } from '../utils/auth';

export const AuthCheck: React.FC = () => {
  const { tokens, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      const shouldLogout = !isAuthenticated || (tokens?.access && !isTokenValid(tokens.access));
      
      if (shouldLogout && isMounted) {
        await logout();
        // Delay navigation to ensure root layout is mounted
        setTimeout(() => {
          router.replace('/login');
        }, 0);
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, tokens, logout]);

  return null;
};

export default AuthCheck; 