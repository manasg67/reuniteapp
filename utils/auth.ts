import { Tokens } from '../types/auth';

export const isTokenValid = (tokens: Tokens | null): boolean => {
  if (!tokens?.access) return false;
  
  try {
    const tokenData = JSON.parse(atob(tokens.access.split('.')[1]));
    const expirationTime = tokenData.exp * 1000; // Convert to milliseconds
    return Date.now() < expirationTime;
  } catch {
    return false;
  }
}; 