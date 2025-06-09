"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const electronAPI = {
    // App info
    getVersion: () => electron_1.ipcRenderer.invoke('app-version'),
    // Dialog methods
    showMessageBox: (options) => electron_1.ipcRenderer.invoke('show-message-box', options),
    showSaveDialog: (options) => electron_1.ipcRenderer.invoke('show-save-dialog', options),
    showOpenDialog: (options) => electron_1.ipcRenderer.invoke('show-open-dialog', options),
    // Menu event listeners
    onMenuNewSubscription: (callback) => {
        electron_1.ipcRenderer.on('menu-new-subscription', callback);
        return () => electron_1.ipcRenderer.removeListener('menu-new-subscription', callback);
    },
    onMenuExportData: (callback) => {
        electron_1.ipcRenderer.on('menu-export-data', (event, filePath) => callback(filePath));
        return () => electron_1.ipcRenderer.removeListener('menu-export-data', callback);
    },
    // System info
    platform: process.platform,
    // Window controls
    minimize: () => electron_1.ipcRenderer.send('window-minimize'),
    maximize: () => electron_1.ipcRenderer.send('window-maximize'),
    close: () => electron_1.ipcRenderer.send('window-close'),
    // File operations
    writeFile: (filePath, data) => electron_1.ipcRenderer.invoke('write-file', filePath, data),
    readFile: (filePath) => electron_1.ipcRenderer.invoke('read-file', filePath),
    // Notifications
    showNotification: (title, body) => electron_1.ipcRenderer.send('show-notification', { title, body }),
};
// Expose the API to the renderer process
electron_1.contextBridge.exposeInMainWorld('electronAPI', electronAPI);
// Remove the following line in production
console.log('Preload script loaded successfully');
