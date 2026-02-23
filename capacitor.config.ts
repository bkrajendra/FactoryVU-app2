import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rajendrakhope.factoryvu2',
  appName: 'FactoryVU',
  webDir: 'www',
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    CapacitorCommunityNativeAudio: {
      audioFocus: true,
    },
  },
};

export default config;
