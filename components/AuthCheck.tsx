import React, { useEffect } from 'react';
import { router } from 'expo-router';
import useAuthStore from '../store/auth';
import { isTokenValid } from '../utils/auth';

export const AuthCheck: React.FC = () => {
  const { tokens, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      console.log('AuthCheck - Current state:', {
        hasTokens: !!tokens,
        isAuthenticated,
        tokenValid: tokens?.access ? isTokenValid(tokens.access) : false
      });

      // Check if we need to logout
      const shouldLogout = !isAuthenticated || (tokens?.access && !isTokenValid(tokens.access));
      
      if (shouldLogout && isMounted) {
        console.log('AuthCheck - Logging out due to:', {
          noAuth: !isAuthenticated,
          invalidToken: tokens?.access ? !isTokenValid(tokens.access) : false
        });
        
        await logout();
        
        // Check current route to avoid unnecessary navigation
        const currentRoute = router.canGoBack() ? 'unknown' : 'login';
        if (currentRoute !== 'login') {
          console.log('AuthCheck - Navigating to login');
          router.replace('/login');
        }
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