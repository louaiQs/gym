import { useEffect, useState, useCallback } from 'react';

// Hook to check if running in Electron
export const useElectron = () => {
  const [isElectron, setIsElectron] = useState(false);
  
  useEffect(() => {
    setIsElectron(typeof window !== 'undefined' && !!window.electronAPI);
  }, []);
  
  return isElectron;
};

// Hook for app version
export const useAppVersion = () => {
  const [version, setVersion] = useState<string>('');
  const isElectron = useElectron();
  
  useEffect(() => {
    if (isElectron) {
      window.electronAPI.getVersion().then(setVersion);
    }
  }, [isElectron]);
  
  return version;
};

// Hook for menu events
export const useMenuEvents = (callbacks: {
  onNewSubscription?: () => void;
  onExportData?: (filePath: string) => void;
}) => {
  const isElectron = useElectron();
  
  useEffect(() => {
    if (!isElectron) return;
    
    const unsubscribers: (() => void)[] = [];
    
    if (callbacks.onNewSubscription) {
      const unsubscribe = window.electronAPI.onMenuNewSubscription(callbacks.onNewSubscription);
      unsubscribers.push(unsubscribe);
    }
    
    if (callbacks.onExportData) {
      const unsubscribe = window.electronAPI.onMenuExportData(callbacks.onExportData);
      unsubscribers.push(unsubscribe);
    }
    
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [isElectron, callbacks.onNewSubscription, callbacks.onExportData]);
};

// Hook for dialogs
export const useElectronDialogs = () => {
  const isElectron = useElectron();
  
  const showMessageBox = useCallback(async (options: Electron.MessageBoxOptions) => {
    if (!isElectron) {
      // Fallback for web
      return { response: window.confirm(options.message || '') ? 0 : 1, checkboxChecked: false };
    }
    return window.electronAPI.showMessageBox(options);
  }, [isElectron]);
  
  const showSaveDialog = useCallback(async (options: Electron.SaveDialogOptions) => {
    if (!isElectron) {
      // Fallback for web - could use File System Access API
      return { canceled: true, filePath: undefined };
    }
    return window.electronAPI.showSaveDialog(options);
  }, [isElectron]);
  
  const showOpenDialog = useCallback(async (options: Electron.OpenDialogOptions) => {
    if (!isElectron) {
      // Fallback for web - could use File System Access API
      return { canceled: true, filePaths: [] };
    }
    return window.electronAPI.showOpenDialog(options);
  }, [isElectron]);
  
  return {
    showMessageBox,
    showSaveDialog,
    showOpenDialog,
  };
};

// Hook for file operations
export const useElectronFile = () => {
  const isElectron = useElectron();
  
  const writeFile = useCallback(async (filePath: string, data: string) => {
    if (!isElectron) {
      // Fallback for web - download as file
      const blob = new Blob([data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop() || 'file.txt';
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
    return window.electronAPI.writeFile(filePath, data);
  }, [isElectron]);
  
  const readFile = useCallback(async (filePath: string) => {
    if (!isElectron) {
      throw new Error('File reading not supported in web mode');
    }
    return window.electronAPI.readFile(filePath);
  }, [isElectron]);
  
  return {
    writeFile,
    readFile,
  };
};

// Hook for notifications
export const useElectronNotification = () => {
  const isElectron = useElectron();
  
  const showNotification = useCallback((title: string, body: string) => {
    if (isElectron) {
      window.electronAPI.showNotification(title, body);
    } else {
      // Fallback to web notifications
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
      } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(title, { body });
          }
        });
      }
    }
  }, [isElectron]);
  
  return { showNotification };
};

// Hook for platform detection
export const usePlatform = () => {
  const isElectron = useElectron();
  const [platform, setPlatform] = useState<NodeJS.Platform>('darwin');
  
  useEffect(() => {
    if (isElectron) {
      setPlatform(window.electronAPI.platform);
    } else {
      // Web fallback
      const userAgent = navigator.userAgent;
      if (userAgent.includes('Mac')) setPlatform('darwin');
      else if (userAgent.includes('Win')) setPlatform('win32');
      else if (userAgent.includes('Linux')) setPlatform('linux');
    }
  }, [isElectron]);
  
  return {
    platform,
    isMac: platform === 'darwin',
    isWindows: platform === 'win32',
    isLinux: platform === 'linux',
  };
};