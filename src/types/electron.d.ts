export interface ElectronAPI {
  // App info
  getVersion: () => Promise<string>;
  
  // Dialog methods
  showMessageBox: (options: Electron.MessageBoxOptions) => Promise<Electron.MessageBoxReturnValue>;
  showSaveDialog: (options: Electron.SaveDialogOptions) => Promise<Electron.SaveDialogReturnValue>;
  showOpenDialog: (options: Electron.OpenDialogOptions) => Promise<Electron.OpenDialogReturnValue>;
  
  // Menu event listeners
  onMenuNewSubscription: (callback: () => void) => () => void;
  onMenuExportData: (callback: (filePath: string) => void) => () => void;
  
  // System info
  platform: NodeJS.Platform;
  
  // Window controls
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  
  // File operations
  writeFile: (filePath: string, data: string) => Promise<void>;
  readFile: (filePath: string) => Promise<string>;
  
  // Notifications
  showNotification: (title: string, body: string) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};