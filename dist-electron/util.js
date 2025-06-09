"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDateTime = exports.formatDate = exports.formatFileSize = exports.platform = exports.log = exports.config = exports.checkForUpdates = exports.getAssetPath = exports.isDev = void 0;
const electron_1 = require("electron");
// Check if running in development mode
exports.isDev = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';
// Get the correct path for resources
const getAssetPath = (...paths) => {
    const RESOURCES_PATH = electron_1.app.isPackaged
        ? process.resourcesPath
        : __dirname;
    return require('path').join(RESOURCES_PATH, 'assets', ...paths);
};
exports.getAssetPath = getAssetPath;
// Auto-updater configuration
const checkForUpdates = () => {
    // Implement auto-updater logic here
    console.log('Checking for updates...');
};
exports.checkForUpdates = checkForUpdates;
// App configuration
exports.config = {
    appName: 'Gym Manager',
    version: electron_1.app.getVersion(),
    isDev: exports.isDev,
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
        openDevTools: true,
    },
    // Production settings
    prod: {
        enableAutoUpdater: true,
        enableCrashReporting: false,
    }
};
// Logging utility
exports.log = {
    info: (message, ...args) => {
        console.log(`[INFO] ${message}`, ...args);
    },
    warn: (message, ...args) => {
        console.warn(`[WARN] ${message}`, ...args);
    },
    error: (message, ...args) => {
        console.error(`[ERROR] ${message}`, ...args);
    },
};
// Platform utilities
exports.platform = {
    isMac: process.platform === 'darwin',
    isWindows: process.platform === 'win32',
    isLinux: process.platform === 'linux',
};
// File utilities
const formatFileSize = (bytes) => {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
exports.formatFileSize = formatFileSize;
// Date utilities
const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};
exports.formatDate = formatDate;
const formatDateTime = (date) => {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};
exports.formatDateTime = formatDateTime;
