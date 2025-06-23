const { app, BrowserWindow, Menu, ipcMain, dialog, globalShortcut, Tray, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

// Uygulama verilerini saklamak için dosya yolu
const userDataPath = app.getPath('userData');
const dataFilePath = path.join(userDataPath, 'worktrack-data.json');

let mainWindow;
let widgetWindow;
let tray;
let isQuitting = false;

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

  // Ana pencere kapatıldığında widget'a minimize et
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      createWidgetWindow();
    }
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

function createWidgetWindow() {
  if (widgetWindow) {
    widgetWindow.show();
    return;
  }

  // Widget penceresi oluştur
  widgetWindow = new BrowserWindow({
    width: 320,
    height: 480,
    resizable: false,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    transparent: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'widget-preload.js')
    },
    show: false
  });

  // Widget HTML dosyasını yükle
  widgetWindow.loadFile('widget.html');

  // Widget hazır olduğunda göster
  widgetWindow.once('ready-to-show', () => {
    widgetWindow.show();
    
    // Widget'ı sağ alt köşeye konumlandır
    const { screen } = require('electron');
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;
    
    widgetWindow.setPosition(width - 340, height - 500);
  });

  // Widget kapatıldığında ana uygulamayı da kapat
  widgetWindow.on('closed', () => {
    widgetWindow = null;
    if (!mainWindow || !mainWindow.isVisible()) {
      app.quit();
    }
  });

  // Geliştirici araçları (development modunda)
  if (process.argv.includes('--dev')) {
    widgetWindow.webContents.openDevTools();
  }
}

function createTray() {
  // Tray ikonu oluştur
  const iconPath = path.join(__dirname, 'assets', 'tray-icon.png');
  let trayIcon;
  
  try {
    trayIcon = nativeImage.createFromPath(iconPath);
  } catch (error) {
    // Varsayılan ikon kullan
    trayIcon = nativeImage.createEmpty();
  }
  
  tray = new Tray(trayIcon);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Ana Pencereyi Aç',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
        } else {
          createWindow();
        }
      }
    },
    {
      label: 'Widget\'ı Göster/Gizle',
      click: () => {
        if (widgetWindow) {
          if (widgetWindow.isVisible()) {
            widgetWindow.hide();
          } else {
            widgetWindow.show();
          }
        } else {
          createWidgetWindow();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Yeni Görev',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.webContents.send('menu-action', 'new-task');
        }
      }
    },
    {
      label: 'Bugünün Görevleri',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.webContents.send('menu-action', 'switch-to-today');
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Çıkış',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip('Work Track - İş Takip Uygulaması');
  tray.setContextMenu(contextMenu);
  
  // Tray'e çift tıklamada ana pencereyi aç
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
    } else {
      createWindow();
    }
  });
}

// Uygulama hazır olduğunda pencereyi oluştur
app.whenReady().then(() => {
  createWindow();
  createTray();
  
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

  // Widget gösterme kısayolu
  globalShortcut.register('CommandOrControl+Shift+W', () => {
    if (widgetWindow) {
      if (widgetWindow.isVisible()) {
        widgetWindow.hide();
      } else {
        widgetWindow.show();
      }
    } else {
      createWidgetWindow();
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

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('will-quit', () => {
  // Tüm global kısayol tuşlarını temizle
  globalShortcut.unregisterAll();
});

// IPC handlers (mevcut olanlar korundu)
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
    
    // Widget'a veri güncellemesi gönder
    if (widgetWindow) {
      widgetWindow.webContents.send('data-updated', data);
    }
    
    return true;
  } catch (error) {
    console.error('Veri kaydetme hatası:', error);
    return false;
  }
});

// Widget için yeni IPC handlers
ipcMain.handle('show-main-window', () => {
  if (mainWindow) {
    mainWindow.show();
  } else {
    createWindow();
  }
});

ipcMain.handle('hide-widget', () => {
  if (widgetWindow) {
    widgetWindow.hide();
  }
});

ipcMain.handle('close-widget', () => {
  if (widgetWindow) {
    widgetWindow.close();
    widgetWindow = null;
  }
});

ipcMain.handle('widget-move-to', (event, x, y) => {
  if (widgetWindow) {
    widgetWindow.setPosition(x, y);
  }
});

ipcMain.handle('create-task-from-widget', (event, taskData) => {
  if (mainWindow) {
    mainWindow.webContents.send('create-task-from-widget', taskData);
  }
});

ipcMain.handle('toggle-widget-always-on-top', () => {
  if (widgetWindow) {
    const isOnTop = widgetWindow.isAlwaysOnTop();
    widgetWindow.setAlwaysOnTop(!isOnTop);
    return !isOnTop;
  }
  return false;
});

// Mevcut IPC handlers (korundu)
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
      
      // Widget'a veri güncellemesi gönder
      if (widgetWindow) {
        widgetWindow.webContents.send('data-updated', parsedData);
      }
      
      return { success: true, data: parsedData };
    }
    return { success: false };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Pencere kontrolü (mevcut)
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

// Bildirim gönderme (mevcut)
ipcMain.handle('send-notification', (event, options) => {
  if (mainWindow) {
    mainWindow.webContents.send('show-notification', options);
  }
  
  // Widget'a da bildirim gönder
  if (widgetWindow) {
    widgetWindow.webContents.send('show-notification', options);
  }
});

// Menü oluştur (mevcut - güncellendi)
const template = [
  {
    label: 'Dosya',
    submenu: [
      {
        label: 'Yeni Görev',
        accelerator: 'CommandOrControl+N',
        click: () => {
          if (mainWindow) {
            mainWindow.webContents.send('menu-action', 'new-task');
          }
        }
      },
      {
        label: 'Yeni Proje',
        accelerator: 'CommandOrControl+Shift+N',
        click: () => {
          if (mainWindow) {
            mainWindow.webContents.send('menu-action', 'new-project');
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Widget\'ı Göster/Gizle',
        accelerator: 'CommandOrControl+Shift+W',
        click: () => {
          if (widgetWindow) {
            if (widgetWindow.isVisible()) {
              widgetWindow.hide();
            } else {
              widgetWindow.show();
            }
          } else {
            createWidgetWindow();
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Verileri Dışa Aktar',
        accelerator: 'CommandOrControl+E',
        click: async () => {
          if (mainWindow) {
            mainWindow.webContents.send('export-data');
          }
        }
      },
      {
        label: 'Verileri İçe Aktar',
        accelerator: 'CommandOrControl+I',
        click: async () => {
          if (mainWindow) {
            mainWindow.webContents.send('import-data');
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Çıkış',
        click: () => {
          isQuitting = true;
          app.quit();
        }
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
          if (mainWindow) {
            mainWindow.webContents.send('menu-action', 'focus-search');
          }
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
          if (mainWindow) {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Ana Pencereyi Göster',
        accelerator: 'CommandOrControl+1',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
          }
        }
      },
      {
        label: 'Widget\'ı Göster',
        accelerator: 'CommandOrControl+2',
        click: () => {
          if (widgetWindow) {
            widgetWindow.show();
          } else {
            createWidgetWindow();
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Küçük Pencere (800x600)',
        click: () => {
          if (mainWindow) {
            mainWindow.setSize(800, 600);
            mainWindow.center();
          }
        }
      },
      {
        label: 'Orta Pencere (1200x800)',
        click: () => {
          if (mainWindow) {
            mainWindow.setSize(1200, 800);
            mainWindow.center();
          }
        }
      },
      {
        label: 'Büyük Pencere (1600x1000)',
        click: () => {
          if (mainWindow) {
            mainWindow.setSize(1600, 1000);
            mainWindow.center();
          }
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
          if (mainWindow) {
            mainWindow.webContents.send('change-theme', 'classic-blue');
          }
        }
      },
      {
        label: 'Karanlık Mor',
        click: () => {
          if (mainWindow) {
            mainWindow.webContents.send('change-theme', 'dark-purple');
          }
        }
      },
      {
        label: 'Yeşil Doğa',
        click: () => {
          if (mainWindow) {
            mainWindow.webContents.send('change-theme', 'nature-green');
          }
        }
      },
      {
        label: 'Gün Batımı',
        click: () => {
          if (mainWindow) {
            mainWindow.webContents.send('change-theme', 'sunset-orange');
          }
        }
      }
    ]
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);