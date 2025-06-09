import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const electronAPI = {
  // App info
  getVersion: () => ipcRenderer.invoke('app-version'),
  
  // Dialog methods
  showMessageBox: (options: Electron.MessageBoxOptions) => 
    ipcRenderer.invoke('show-message-box', options),
  showSaveDialog: (options: Electron.SaveDialogOptions) => 
    ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options: Electron.OpenDialogOptions) => 
    ipcRenderer.invoke('show-open-dialog', options),
  
  // Menu event listeners
  onMenuNewSubscription: (callback: () => void) => {
    ipcRenderer.on('menu-new-subscription', callback);
    return () => ipcRenderer.removeListener('menu-new-subscription', callback);
  },
  onMenuExportData: (callback: (filePath: string) => void) => {
    ipcRenderer.on('menu-export-data', (event, filePath) => callback(filePath));
    return () => ipcRenderer.removeListener('menu-export-data', callback);
  },
  
  // System info
  platform: process.platform,
  
  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  
  // File operations
  writeFile: (filePath: string, data: string) => 
    ipcRenderer.invoke('write-file', filePath, data),
  readFile: (filePath: string) => 
    ipcRenderer.invoke('read-file', filePath),
  
  // Notifications
  showNotification: (title: string, body: string) => 
    ipcRenderer.send('show-notification', { title, body }),
};

// Define the type for the exposed API
export type ElectronAPI = typeof electronAPI;

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Type declaration for global window object
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// Remove the following line in production
console.log('Preload script loaded successfully');