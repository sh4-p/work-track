const { contextBridge, ipcRenderer } = require('electron');

// Ana süreçle güvenli iletişim için API oluştur
contextBridge.exposeInMainWorld('electronAPI', {
  // Veri yükleme
  loadData: () => ipcRenderer.invoke('load-data'),
  
  // Veri kaydetme
  saveData: (data) => ipcRenderer.invoke('save-data', data),
  
  // Veri dışa aktarma
  exportData: () => ipcRenderer.invoke('export-data'),
  
  // Veri içe aktarma
  importData: () => ipcRenderer.invoke('import-data'),
  
  // Pencere kontrolü
  toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  setWindowSize: (width, height) => ipcRenderer.invoke('set-window-size', width, height),
  
  // Bildirimler
  sendNotification: (options) => ipcRenderer.invoke('send-notification', options),
  
  // Menü olaylarını dinle
  onExportData: (callback) => ipcRenderer.on('export-data', callback),
  onImportData: (callback) => ipcRenderer.on('import-data', callback),
  onMenuAction: (callback) => ipcRenderer.on('menu-action', (event, action) => callback(action)),
  onChangeTheme: (callback) => ipcRenderer.on('change-theme', (event, theme) => callback(theme)),
  onFullscreenChanged: (callback) => ipcRenderer.on('fullscreen-changed', (event, isFullscreen) => callback(isFullscreen)),
  onShowNotification: (callback) => ipcRenderer.on('show-notification', (event, options) => callback(options)),
  
  // Olay dinleyicilerini temizle
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});