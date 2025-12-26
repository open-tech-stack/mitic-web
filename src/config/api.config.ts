// @/config/app.config.ts
/**
 * Configuration globale de l'application
 */
export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
  };
  auth: {
    tokenRefreshThreshold: number; // En secondes
    sessionTimeout: number; // En millisecondes
  };
}

export const APP_CONFIG: AppConfig = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://192.168.11.254:8081',
    timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000')
  },
  auth: {
    tokenRefreshThreshold: 300, // 5 minutes avant expiration
    sessionTimeout: 30 * 60 * 1000 // 30 minutes
  }
};
