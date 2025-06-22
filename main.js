const { app, BrowserWindow, Menu, ipcMain, dialog, globalShortcut } = require('electron');
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
    icon: path.join(__dirname, 'assets', 'icon.png'),
    resizable: true,
    fullscreenable: true
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

  // Pencere olayları
  mainWindow.on('enter-full-screen', () => {
    mainWindow.webContents.send('fullscreen-changed', true);
  });

  mainWindow.on('leave-full-screen', () => {
    mainWindow.webContents.send('fullscreen-changed', false);
  });
}

// Uygulama hazır olduğunda pencereyi oluştur
app.whenReady().then(() => {
  createWindow();
  
  // Global kısayol tuşları
  globalShortcut.register('F11', () => {
    if (mainWindow) {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
  });

  globalShortcut.register('CommandOrControl+Shift+D', () => {
    if (mainWindow) {
      mainWindow.webContents.openDevTools();
    }
  });
});

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

app.on('will-quit', () => {
  // Tüm global kısayol tuşlarını temizle
  globalShortcut.unregisterAll();
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

// Pencere kontrolü
ipcMain.handle('toggle-fullscreen', () => {
  if (mainWindow) {
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
    return mainWindow.isFullScreen();
  }
  return false;
});

ipcMain.handle('minimize-window', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
    return mainWindow.isMaximized();
  }
  return false;
});

ipcMain.handle('close-window', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.handle('set-window-size', (event, width, height) => {
  if (mainWindow) {
    mainWindow.setSize(width, height);
    mainWindow.center();
  }
});

// Bildirim gönderme
ipcMain.handle('send-notification', (event, options) => {
  if (mainWindow) {
    mainWindow.webContents.send('show-notification', options);
  }
});

// Menü oluştur
const template = [
  {
    label: 'Dosya',
    submenu: [
      {
        label: 'Yeni Görev',
        accelerator: 'CommandOrControl+N',
        click: () => {
          mainWindow.webContents.send('menu-action', 'new-task');
        }
      },
      {
        label: 'Yeni Proje',
        accelerator: 'CommandOrControl+Shift+N',
        click: () => {
          mainWindow.webContents.send('menu-action', 'new-project');
        }
      },
      { type: 'separator' },
      {
        label: 'Verileri Dışa Aktar',
        accelerator: 'CommandOrControl+E',
        click: async () => {
          mainWindow.webContents.send('export-data');
        }
      },
      {
        label: 'Verileri İçe Aktar',
        accelerator: 'CommandOrControl+I',
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
      { label: 'Yapıştır', role: 'paste' },
      { type: 'separator' },
      {
        label: 'Arama',
        accelerator: 'CommandOrControl+F',
        click: () => {
          mainWindow.webContents.send('menu-action', 'focus-search');
        }
      }
    ]
  },
  {
    label: 'Görünüm',
    submenu: [
      {
        label: 'Tam Ekran',
        accelerator: 'F11',
        click: () => {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
        }
      },
      { type: 'separator' },
      {
        label: 'Küçük Pencere (800x600)',
        click: () => {
          mainWindow.setSize(800, 600);
          mainWindow.center();
        }
      },
      {
        label: 'Orta Pencere (1200x800)',
        click: () => {
          mainWindow.setSize(1200, 800);
          mainWindow.center();
        }
      },
      {
        label: 'Büyük Pencere (1600x1000)',
        click: () => {
          mainWindow.setSize(1600, 1000);
          mainWindow.center();
        }
      },
      { type: 'separator' },
      { label: 'Yeniden Yükle', role: 'reload' },
      { label: 'Geliştirici Araçları', role: 'toggleDevTools' }
    ]
  },
  {
    label: 'Tema',
    submenu: [
      {
        label: 'Klasik Mavi',
        click: () => {
          mainWindow.webContents.send('change-theme', 'classic-blue');
        }
      },
      {
        label: 'Karanlık Mor',
        click: () => {
          mainWindow.webContents.send('change-theme', 'dark-purple');
        }
      },
      {
        label: 'Yeşil Doğa',
        click: () => {
          mainWindow.webContents.send('change-theme', 'nature-green');
        }
      },
      {
        label: 'Gün Batımı',
        click: () => {
          mainWindow.webContents.send('change-theme', 'sunset-orange');
        }
      }
    ]
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);