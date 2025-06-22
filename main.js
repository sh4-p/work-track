const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Uygulama verilerini saklamak için dosya yolu
const userDataPath = app.getPath('userData');
const dataFilePath = path.join(userDataPath, 'worktrack-data.json');

let mainWindow;

function createWindow() {
  // Ana pencere oluştur
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset',
    vibrancy: 'under-window',
    backgroundMaterial: 'acrylic',
    show: false,
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  // HTML dosyasını yükle
  mainWindow.loadFile('index.html');

  // Pencere hazır olduğunda göster
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Geliştirici araçları (development modunda)
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

// Uygulama hazır olduğunda pencereyi oluştur
app.whenReady().then(createWindow);

// Tüm pencereler kapatıldığında uygulamayı kapat (macOS hariç)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers
ipcMain.handle('load-data', async () => {
  try {
    if (fs.existsSync(dataFilePath)) {
      const data = fs.readFileSync(dataFilePath, 'utf8');
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Veri yükleme hatası:', error);
    return null;
  }
});

ipcMain.handle('save-data', async (event, data) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Veri kaydetme hatası:', error);
    return false;
  }
});

ipcMain.handle('export-data', async () => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Verileri Dışa Aktar',
      defaultPath: 'worktrack-backup.json',
      filters: [
        { name: 'JSON Files', extensions: ['json'] }
      ]
    });

    if (!result.canceled) {
      const data = fs.readFileSync(dataFilePath, 'utf8');
      fs.writeFileSync(result.filePath, data);
      return { success: true, path: result.filePath };
    }
    return { success: false };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('import-data', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Verileri İçe Aktar',
      filters: [
        { name: 'JSON Files', extensions: ['json'] }
      ],
      properties: ['openFile']
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const importedData = fs.readFileSync(result.filePaths[0], 'utf8');
      const parsedData = JSON.parse(importedData);
      fs.writeFileSync(dataFilePath, importedData);
      return { success: true, data: parsedData };
    }
    return { success: false };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Menü oluştur
const template = [
  {
    label: 'Dosya',
    submenu: [
      {
        label: 'Verileri Dışa Aktar',
        click: async () => {
          mainWindow.webContents.send('export-data');
        }
      },
      {
        label: 'Verileri İçe Aktar',
        click: async () => {
          mainWindow.webContents.send('import-data');
        }
      },
      { type: 'separator' },
      {
        label: 'Çıkış',
        role: 'quit'
      }
    ]
  },
  {
    label: 'Düzenle',
    submenu: [
      { label: 'Geri Al', role: 'undo' },
      { label: 'Yinele', role: 'redo' },
      { type: 'separator' },
      { label: 'Kes', role: 'cut' },
      { label: 'Kopyala', role: 'copy' },
      { label: 'Yapıştır', role: 'paste' }
    ]
  },
  {
    label: 'Görünüm',
    submenu: [
      { label: 'Yeniden Yükle', role: 'reload' },
      { label: 'Geliştirici Araçları', role: 'toggleDevTools' },
      { type: 'separator' },
      { label: 'Tam Ekran', role: 'togglefullscreen' }
    ]
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);