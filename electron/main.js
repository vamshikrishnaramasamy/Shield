import { app, BrowserWindow, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        titleBarStyle: 'hiddenInset', // Native mac style
        backgroundColor: '#09090b', // Set opaque background to prevent blank screen
        webPreferences: {
            nodeIntegration: false, // Important: web-llm needs browser mode
            contextIsolation: true,
            webviewTag: true,
            webSecurity: false
        },
        show: false // Don't show until ready
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        console.error('Failed to load:', errorCode, errorDescription);
    });

    // In development, Vite dev server will be running
    // We can detect this by checking if we're running via electron . (dev) vs packaged app
    const isDev = !app.isPackaged;

    console.log('Running in', isDev ? 'DEVELOPMENT' : 'PRODUCTION', 'mode');

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Open external links in the OS default browser (optional, or handle them in-app)
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        // For a real browser, we might want to handle this differently,
        // but for now let's keep it simple.
        return { action: 'allow' };
    });
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
