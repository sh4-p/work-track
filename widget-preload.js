const { contextBridge, ipcRenderer } = require('electron');

// Widget için güvenli IPC API
contextBridge.exposeInMainWorld('widgetAPI', {
  // Veri yükleme ve kaydetme
  loadData: () => ipcRenderer.invoke('load-data'),
  saveData: (data) => ipcRenderer.invoke('save-data', data),
  
  // Widget kontrolü
  showMainWindow: () => ipcRenderer.invoke('show-main-window'),
  hideWidget: () => ipcRenderer.invoke('hide-widget'),
  closeWidget: () => ipcRenderer.invoke('close-widget'),
  moveWidgetTo: (x, y) => ipcRenderer.invoke('widget-move-to', x, y),
  toggleAlwaysOnTop: () => ipcRenderer.invoke('toggle-widget-always-on-top'),
  
  // Görev yönetimi
  createTaskFromWidget: (taskData) => ipcRenderer.invoke('create-task-from-widget', taskData),
  
  // Bildirimler
  sendNotification: (options) => ipcRenderer.invoke('send-notification', options),
  
  // Olay dinleyicileri
  onDataUpdated: (callback) => ipcRenderer.on('data-updated', (event, data) => callback(data)),
  onShowNotification: (callback) => ipcRenderer.on('show-notification', (event, options) => callback(options)),
  
  // Olay dinleyicilerini temizle
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});