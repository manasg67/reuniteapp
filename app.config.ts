import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'reunite',
  slug: 'reunite',
  extra: {
    API_BASE_URL: process.env.API_BASE_URL,
  },
}); 