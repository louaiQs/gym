"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
const util_js_1 = require("./util.js");

// Keep a global reference of the window object
let mainWindow = null;

const createWindow = () => {
    // Create the browser window
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: (0, path_1.join)(__dirname, 'preload.js'),
        },
        icon: (0, path_1.join)(__dirname, '../../assets/icon.png'), // Add your app icon
        show: false, // Don't show until ready-to-show
        titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    });

    // Hide menu bar
    mainWindow.setMenuBarVisibility(false);
    mainWindow.setAutoHideMenuBar(true);

    // Load the app
    if (util_js_1.isDev) {
        mainWindow.loadURL('http://localhost:5173'); // Vite dev server
        // Open DevTools in development
        //mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile((0, path_1.join)(__dirname, '../../dist/index.html'));
    }

    // Show window when ready to prevent visual flash
    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
        // Focus on window creation
        if (util_js_1.isDev) {
            //mainWindow?.webContents.openDevTools();
        }
    });

    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Handle external links
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        electron_1.shell.openExternal(url);
        return { action: 'deny' };
    });

    // Handle new-window event for older Electron versions compatibility
    mainWindow.webContents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
        electron_1.shell.openExternal(navigationUrl);
    });
};

// App event listeners
electron_1.app.whenReady().then(() => {
    createWindow();
    // Set up the menu
    createMenu();

    // On macOS, re-create window when dock icon is clicked
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed
electron_1.app.on('window-all-closed', () => {
    // On macOS, keep app running even when all windows are closed
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});

// Security: Prevent navigation to external websites
electron_1.app.on('web-contents-created', (event, contents) => {
    contents.on('will-navigate', (navigationEvent, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        if (parsedUrl.origin !== 'http://localhost:5173' && parsedUrl.origin !== 'file://') {
            navigationEvent.preventDefault();
        }
    });
});

// Create application menu
const createMenu = () => {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New Subscription',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        mainWindow?.webContents.send('menu-new-subscription');
                    }
                },
                {
                    label: 'Export Data',
                    accelerator: 'CmdOrCtrl+E',
                    click: async () => {
                        const result = await electron_1.dialog.showSaveDialog(mainWindow, {
                            filters: [
                                { name: 'CSV Files', extensions: ['csv'] },
                                { name: 'JSON Files', extensions: ['json'] }
                            ]
                        });
                        if (!result.canceled && result.filePath) {
                            mainWindow?.webContents.send('menu-export-data', result.filePath);
                        }
                    }
                },
                { type: 'separator' },
                {
                    role: 'quit'
                }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectall' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'close' }
            ]
        },
        {
            role: 'help',
            submenu: [
                {
                    label: 'About Gym Manager',
                    click: () => {
                        electron_1.dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'About',
                            message: 'Gym Management System',
                            detail: 'A modern gym management application built with Electron and React.'
                        });
                    }
                }
            ]
        }
    ];

    // macOS specific menu adjustments
    if (process.platform === 'darwin') {
        template.unshift({
            label: electron_1.app.getName(),
            submenu: [
                { role: 'about' },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        });
        // Window menu
        template[4].submenu.push({ type: 'separator' }, { role: 'front' });
    }

    const menu = electron_1.Menu.buildFromTemplate(template);
    electron_1.Menu.setApplicationMenu(menu);
};

// IPC handlers
electron_1.ipcMain.handle('app-version', () => {
    return electron_1.app.getVersion();
});

electron_1.ipcMain.handle('show-message-box', async (event, options) => {
    const result = await electron_1.dialog.showMessageBox(mainWindow, options);
    return result;
});

electron_1.ipcMain.handle('show-save-dialog', async (event, options) => {
    const result = await electron_1.dialog.showSaveDialog(mainWindow, options);
    return result;
});

electron_1.ipcMain.handle('show-open-dialog', async (event, options) => {
    const result = await electron_1.dialog.showOpenDialog(mainWindow, options);
    return result;
});

// Handle app closing
electron_1.app.on('before-quit', (event) => {
    // You can add cleanup logic here
    console.log('App is about to quit');
});

// Prevent multiple instances
const gotTheLock = electron_1.app.requestSingleInstanceLock();
if (!gotTheLock) {
    electron_1.app.quit();
}
else {
    electron_1.app.on('second-instance', () => {
        // Someone tried to run a second instance, focus our window instead
        if (mainWindow) {
            if (mainWindow.isMinimized())
                mainWindow.restore();
            mainWindow.focus();
        }
    });
}