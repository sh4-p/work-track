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
  
  // Menü olaylarını dinle
  onExportData: (callback) => ipcRenderer.on('export-data', callback),
  onImportData: (callback) => ipcRenderer.on('import-data', callback),
  
  // Olay dinleyicilerini temizle
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});