import { app } from 'electron';

// Check if running in development mode
export const isDev = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

// Get the correct path for resources
export const getAssetPath = (...paths: string[]): string => {
  const RESOURCES_PATH = app.isPackaged
    ? process.resourcesPath
    : __dirname;

  return require('path').join(RESOURCES_PATH, 'assets', ...paths);
};

// Auto-updater configuration
export const checkForUpdates = () => {
  // Implement auto-updater logic here
  console.log('Checking for updates...');
};

// App configuration
export const config = {
  appName: 'Gym Manager',
  version: app.getVersion(),
  isDev,
  
  // Window settings
  window: {
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
  },

  // Development settings
  dev: {
    devServerUrl: 'http://localhost:5173',
    openDevTools: false,
  },

  // Production settings
  prod: {
    enableAutoUpdater: true,
    enableCrashReporting: false,
  }
};

// Logging utility
export const log = {
  info: (message: string, ...args: any[]) => {
    console.log(`[INFO] ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
};

// Platform utilities
export const platform = {
  isMac: process.platform === 'darwin',
  isWindows: process.platform === 'win32',
  isLinux: process.platform === 'linux',
};

// File utilities
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Date utilities
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};