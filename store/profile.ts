import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface AadhaarProfile {
  id: number;
  user: number;
  aadhaar_number_hash: string;
  name_in_aadhaar: string;
  dob: string;
  gender: string;
  address_in_aadhaar: string;
  last_verified: string;
  verification_count: number;
  is_active: boolean;
}

export interface Family {
  id: number;
  name: string;
  passkey: string;
  created_at: string;
  created_by: number;
}

export interface UserProfile {
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
  latitude: string;
  longitude: string;
  organization: string;
  organization_location: string;
  organization_latitude: string | null;
  organization_longitude: string | null;
  profile_picture: string;
  aadhaar_profile: AadhaarProfile;
  verification_documents: string | null;
  families: Family[];
}

interface ProfileState {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  clearProfile: () => void;
}

const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => {
        console.log('Setting profile:', profile);
        set({ profile });
      },
      clearProfile: () => {
        console.log('Clearing profile');
        set({ profile: null });
      },
    }),
    {
      name: 'profile-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        console.log('Rehydrated profile state:', state);
      },
    }
  )
)

export default useProfileStore; 