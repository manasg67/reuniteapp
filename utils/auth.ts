import { Tokens } from '../types/auth';

export const isTokenValid = (token: string | null): boolean => {
  if (!token) return false;
  
  try {
    const tokenData = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = tokenData.exp * 1000; // Convert to milliseconds
    return Date.now() < expirationTime;
  } catch {
    return false;
  }
}; 