export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  phone_number: string;
  role: string;
  is_verified: boolean;
  is_approved: boolean;
  is_active: boolean;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  organization: string;
  organization_location: string;
  organization_latitude: string;
  organization_longitude: string;
  profile_picture: string | null;
  aadhaar_profile: string | null;
  verification_documents: string | null;
  families: any[];
}

export interface Tokens {
  refresh: string;
  access: string;
}

export interface AuthState {
  user: User | null;
  tokens: Tokens | null;
  isAuthenticated: boolean;
  login: (user: User, tokens: Tokens) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setTokens: (tokens: Tokens) => void;
} 