export const ROUTES = {
  // Auth
  SPLASH: '/',
  ONBOARDING: '/onboarding',
  LOGIN: '/login',
  SIGNUP: '/signup',
  OTP: '/otp',
  FORGOT_PASSWORD: '/forgot-password',

  // Dashboard
  CHATS: '/chats',
  CALLS: '/calls',
  CONTACTS: '/contacts',
  EXPLORE: '/explore',
  SETTINGS: '/settings',

  // Settings sub-pages
  SETTINGS_PROFILE: '/settings/profile',
  SETTINGS_PRIVACY: '/settings/privacy',
  SETTINGS_NOTIFICATIONS: '/settings/notifications',
  SETTINGS_APPEARANCE: '/settings/appearance',
  SETTINGS_DEVICES: '/settings/devices',
  SETTINGS_BLOCKED: '/settings/blocked',
} as const;
