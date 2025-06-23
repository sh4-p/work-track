const { contextBridge, ipcRenderer } = require('electron');

// Ana süreçle güvenli iletişim için API oluştur
contextBridge.exposeInMainWorld('electronAPI', {
  // Veri yükleme ve kaydetme
  loadData: () => ipcRenderer.invoke('load-data'),
  saveData: (data) => ipcRenderer.invoke('save-data', data),
  
  // Veri dışa/içe aktarma
  exportData: () => ipcRenderer.invoke('export-data'),
  importData: () => ipcRenderer.invoke('import-data'),
  
  // Pencere kontrolü
  toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  setWindowSize: (width, height) => ipcRenderer.invoke('set-window-size', width, height),
  
  // Widget kontrolü
  showWidget: () => ipcRenderer.invoke('show-widget'),
  hideWidget: () => ipcRenderer.invoke('hide-widget'),
  toggleWidget: () => ipcRenderer.invoke('toggle-widget'),
  
  // Bildirimler
  sendNotification: (options) => ipcRenderer.invoke('send-notification', options),
  
  // Widget'tan görev oluşturma
  onCreateTaskFromWidget: (callback) => ipcRenderer.on('create-task-from-widget', (event, taskData) => callback(taskData)),
  
  // Menü olaylarını dinle
  onExportData: (callback) => ipcRenderer.on('export-data', callback),
  onImportData: (callback) => ipcRenderer.on('import-data', callback),
  onMenuAction: (callback) => ipcRenderer.on('menu-action', (event, action) => callback(action)),
  onChangeTheme: (callback) => ipcRenderer.on('change-theme', (event, theme) => callback(theme)),
  onFullscreenChanged: (callback) => ipcRenderer.on('fullscreen-changed', (event, isFullscreen) => callback(isFullscreen)),
  onShowNotification: (callback) => ipcRenderer.on('show-notification', (event, options) => callback(options)),
  
  // Widget olayları
  onWidgetDataUpdate: (callback) => ipcRenderer.on('widget-data-update', (event, data) => callback(data)),
  onWidgetShow: (callback) => ipcRenderer.on('widget-show', callback),
  onWidgetHide: (callback) => ipcRenderer.on('widget-hide', callback),
  
  // Sistem tray olayları
  onTrayAction: (callback) => ipcRenderer.on('tray-action', (event, action) => callback(action)),
  
  // Uygulama durumu
  onAppFocus: (callback) => ipcRenderer.on('app-focus', callback),
  onAppBlur: (callback) => ipcRenderer.on('app-blur', callback),
  onAppQuit: (callback) => ipcRenderer.on('app-quit', callback),
  
  // Keyboard shortcuts
  onGlobalShortcut: (callback) => ipcRenderer.on('global-shortcut', (event, shortcut) => callback(shortcut)),
  
  // Dosya sistemi işlemleri
  selectFile: (options) => ipcRenderer.invoke('select-file', options),
  saveFile: (options, data) => ipcRenderer.invoke('save-file', options, data),
  
  // Widget pozisyon kaydetme
  saveWidgetPosition: (x, y) => ipcRenderer.invoke('save-widget-position', x, y),
  loadWidgetPosition: () => ipcRenderer.invoke('load-widget-position'),
  
  // Widget ayarları
  saveWidgetSettings: (settings) => ipcRenderer.invoke('save-widget-settings', settings),
  loadWidgetSettings: () => ipcRenderer.invoke('load-widget-settings'),
  
  // Ana pencere - widget senkronizasyonu
  syncWithWidget: (data) => ipcRenderer.invoke('sync-with-widget', data),
  requestWidgetSync: () => ipcRenderer.invoke('request-widget-sync'),
  
  // Otomatik başlatma
  setAutoStart: (enabled) => ipcRenderer.invoke('set-auto-start', enabled),
  getAutoStartStatus: () => ipcRenderer.invoke('get-auto-start-status'),
  
  // Sistem bildirimleri
  createSystemNotification: (title, body, options) => ipcRenderer.invoke('create-system-notification', title, body, options),
  
  // Widget özellik kontrolleri
  widgetFeatures: {
    setAlwaysOnTop: (enabled) => ipcRenderer.invoke('widget-set-always-on-top', enabled),
    setOpacity: (opacity) => ipcRenderer.invoke('widget-set-opacity', opacity),
    setSize: (width, height) => ipcRenderer.invoke('widget-set-size', width, height),
    resetPosition: () => ipcRenderer.invoke('widget-reset-position'),
    toggleVisibility: () => ipcRenderer.invoke('widget-toggle-visibility')
  },
  
  // Performans monitörü
  getPerformanceStats: () => ipcRenderer.invoke('get-performance-stats'),
  
  // Debug ve geliştirici araçları
  openDevTools: (target) => ipcRenderer.invoke('open-dev-tools', target), // 'main' veya 'widget'
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  
  // Olay dinleyicilerini temizle
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  
  // İleri seviye widget kontrolleri
  widget: {
    create: (options) => ipcRenderer.invoke('widget-create', options),
    destroy: () => ipcRenderer.invoke('widget-destroy'),
    show: () => ipcRenderer.invoke('widget-show'),
    hide: () => ipcRenderer.invoke('widget-hide'),
    focus: () => ipcRenderer.invoke('widget-focus'),
    blur: () => ipcRenderer.invoke('widget-blur'),
    minimize: () => ipcRenderer.invoke('widget-minimize'),
    restore: () => ipcRenderer.invoke('widget-restore'),
    setPosition: (x, y) => ipcRenderer.invoke('widget-set-position', x, y),
    getPosition: () => ipcRenderer.invoke('widget-get-position'),
    setAlwaysOnTop: (flag) => ipcRenderer.invoke('widget-set-always-on-top', flag),
    isAlwaysOnTop: () => ipcRenderer.invoke('widget-is-always-on-top'),
    setSkipTaskbar: (flag) => ipcRenderer.invoke('widget-set-skip-taskbar', flag),
    flashFrame: (flag) => ipcRenderer.invoke('widget-flash-frame', flag),
    
    // Widget olayları
    onMove: (callback) => ipcRenderer.on('widget-move', (event, x, y) => callback(x, y)),
    onResize: (callback) => ipcRenderer.on('widget-resize', (event, width, height) => callback(width, height)),
    onFocus: (callback) => ipcRenderer.on('widget-focus', callback),
    onBlur: (callback) => ipcRenderer.on('widget-blur', callback),
    onShow: (callback) => ipcRenderer.on('widget-show', callback),
    onHide: (callback) => ipcRenderer.on('widget-hide', callback),
    onMinimize: (callback) => ipcRenderer.on('widget-minimize', callback),
    onRestore: (callback) => ipcRenderer.on('widget-restore', callback),
    onClose: (callback) => ipcRenderer.on('widget-close', callback)
  },
  
  // System tray kontrolleri  
  tray: {
    setToolTip: (tooltip) => ipcRenderer.invoke('tray-set-tooltip', tooltip),
    setImage: (imagePath) => ipcRenderer.invoke('tray-set-image', imagePath),
    displayBalloon: (options) => ipcRenderer.invoke('tray-display-balloon', options),
    setContextMenu: (menuItems) => ipcRenderer.invoke('tray-set-context-menu', menuItems),
    
    // Tray olayları
    onClick: (callback) => ipcRenderer.on('tray-click', callback),
    onDoubleClick: (callback) => ipcRenderer.on('tray-double-click', callback),
    onRightClick: (callback) => ipcRenderer.on('tray-right-click', callback),
    onBalloonShow: (callback) => ipcRenderer.on('tray-balloon-show', callback),
    onBalloonClick: (callback) => ipcRenderer.on('tray-balloon-click', callback),
    onBalloonClosed: (callback) => ipcRenderer.on('tray-balloon-closed', callback)
  },
  
  // Platform bilgisi
  platform: {
    isWindows: () => ipcRenderer.invoke('platform-is-windows'),
    isMac: () => ipcRenderer.invoke('platform-is-mac'),
    isLinux: () => ipcRenderer.invoke('platform-is-linux'),
    getVersion: () => ipcRenderer.invoke('platform-get-version'),
    getArch: () => ipcRenderer.invoke('platform-get-arch')
  },
  
  // Güvenlik ve izinler
  security: {
    requestNotificationPermission: () => ipcRenderer.invoke('security-request-notification-permission'),
    checkNotificationPermission: () => ipcRenderer.invoke('security-check-notification-permission'),
    requestFileSystemAccess: () => ipcRenderer.invoke('security-request-filesystem-access')
  },
  
  // Widget theme ve stil kontrolleri
  widgetTheme: {
    setTheme: (themeName) => ipcRenderer.invoke('widget-theme-set', themeName),
    getTheme: () => ipcRenderer.invoke('widget-theme-get'),
    setCustomColors: (colors) => ipcRenderer.invoke('widget-theme-set-custom-colors', colors),
    resetTheme: () => ipcRenderer.invoke('widget-theme-reset')
  },
  
  // Widget animasyonları
  widgetAnimation: {
    fadeIn: (duration) => ipcRenderer.invoke('widget-animation-fade-in', duration),
    fadeOut: (duration) => ipcRenderer.invoke('widget-animation-fade-out', duration),
    slideIn: (direction, duration) => ipcRenderer.invoke('widget-animation-slide-in', direction, duration),
    slideOut: (direction, duration) => ipcRenderer.invoke('widget-animation-slide-out', direction, duration),
    bounce: (intensity) => ipcRenderer.invoke('widget-animation-bounce', intensity),
    shake: (intensity) => ipcRenderer.invoke('widget-animation-shake', intensity)
  }
});