# Work Track Kurulum Rehberi

Bu rehber Work Track uygulamasının masaüstünüze kurulması için gerekli tüm adımları detaylarıyla açıklar.

## 📋 Gerekli Dosyalar

Work Track uygulamasını çalıştırmak için aşağıdaki dosyaların `work-track` klasörünüzde bulunması gerekir:

### Ana Dosyalar
```
work-track/
├── package.json              # Proje yapılandırması ve bağımlılıklar
├── main.js                   # Ana Electron süreç dosyası
├── preload.js               # Güvenlik katmanı
├── index.html               # Ana HTML arayüzü
├── style.css                # Glassmorphism tasarım stilleri
├── script.js                # Uygulama mantığı ve fonksiyonları
├── setup.js                 # Otomatik kurulum scripti
├── .gitignore              # Git göz ardı listesi
├── electron-builder.json   # Build yapılandırması
├── README.md               # Detaylı dokümantasyon
└── KURULUM.md             # Bu dosya
```

### Assets Klasörü
```
assets/
├── icon.png                # PNG ikon (512x512)
├── icon.ico               # Windows ikon
├── icon.icns              # macOS ikon
└── icon.svg               # SVG ikon (editlenebilir)
```

## 🚀 Hızlı Kurulum

### Yöntem 1: Otomatik Kurulum (Önerilen)

1. **Klasör Oluşturun:**
   ```bash
   mkdir work-track
   cd work-track
   ```

2. **Tüm dosyaları kopyalayın** (yukarıdaki dosya listesinden)

3. **Otomatik kurulum scriptini çalıştırın:**
   ```bash
   node setup.js
   ```

Bu script otomatik olarak:
- Node.js versiyonunu kontrol eder
- Gerekli klasörleri oluşturur
- Bağımlılıkları yükler
- İkon dosyalarını hazırlar
- Yapılandırma dosyalarını oluşturur

### Yöntem 2: Manuel Kurulum

1. **Node.js Kontrolü:**
   ```bash
   node --version
   # v16.0.0 veya üzeri olmalı
   ```

2. **Klasör Oluşturma:**
   ```bash
   mkdir work-track
   cd work-track
   ```

3. **Dosyaları Yerleştirme:**
   - Tüm dosyaları work-track klasörüne kopyalayın
   - Assets klasörünü oluşturun ve ikon dosyalarını ekleyin

4. **Bağımlılık Kurulumu:**
   ```bash
   npm install
   ```

5. **İlk Çalıştırma:**
   ```bash
   npm run dev
   ```

## 📦 Gerekli Bağımlılıklar

Kurulum sırasında aşağıdaki paketler otomatik olarak yüklenecek:

### Ana Bağımlılıklar
- `electron` (v28.0.0+) - Ana Electron framework
- `electron-builder` (v24.9.1+) - Uygulama paketleme

### Opsiyonel Bağımlılıklar
- `eslint` - Kod kalitesi kontrolü
- `prettier` - Kod formatlaması

## 🔧 Yapılandırma

### Sistem Gereksinimleri
- **İşletim Sistemi:** Windows 10+, macOS 10.14+, Ubuntu 18.04+
- **RAM:** Minimum 4GB (8GB önerilen)
- **Disk Alanı:** 500MB serbest alan
- **Node.js:** v16.0.0 veya üzeri

### Port Yapılandırması
Uygulama varsayılan olarak sistem portlarını kullanır. Özel port gerekirse `.env` dosyasında:
```
PORT=3000
DEV_PORT=3001
```

## 🎯 Çalıştırma Komutları

### Geliştirme Modu
```bash
npm run dev
# veya
npm start
```

### Üretim Derlemesi
```bash
npm run build
```

### Dağıtım Paketi Oluşturma
```bash
npm run dist
```

### Specific Platform Build
```bash
# Windows için
npm run build:win

# macOS için
npm run build:mac

# Linux için
npm run build:linux
```

## 🛠️ Sorun Giderme

### Yaygın Hatalar ve Çözümleri

#### 1. "command not found: npm"
**Çözüm:** Node.js'i yükleyin
```bash
# Node.js'i https://nodejs.org adresinden indirin
# Kurulum sonrası terminali yeniden başlatın
node --version
npm --version
```

#### 2. "Permission denied" hatası (Linux/macOS)
**Çözüm:** Sudo ile çalıştırın
```bash
sudo npm install -g electron
```

#### 3. "Module not found" hatası
**Çözüm:** Bağımlılıkları yeniden yükleyin
```bash
rm -rf node_modules
npm install
```

#### 4. "Electron failed to install correctly"
**Çözüm:** Cache temizleyin
```bash
npm cache clean --force
npm install
```

#### 5. Windows'ta "script execution disabled"
**Çözüm:** PowerShell execution policy değiştirin
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Detaylı Hata Ayıklama

#### Debug Modunda Çalıştırma
```bash
DEBUG=* npm run dev
```

#### Geliştirici Araçlarını Açma
Uygulama çalışırken: `Ctrl+Shift+I` (Windows/Linux) veya `Cmd+Option+I` (macOS)

#### Log Dosyaları
- Windows: `%APPDATA%/work-track/logs/`
- macOS: `~/Library/Logs/work-track/`
- Linux: `~/.local/share/work-track/logs/`

## 🔐 Güvenlik Notları

### Antivirus Uyarıları
Bazı antivirus yazılımları Electron uygulamalarını şüpheli görebilir. Bu durumda:
1. Uygulamayı güvenli listesine ekleyin
2. Geçici olarak real-time protection kapatın
3. Windows Defender SmartScreen'i atlayın

### Firewall Ayarları
İlk çalıştırmada Windows Firewall izin isteyebilir. "Allow access" seçeneğini seçin.

## 📱 Platform-Specific Kurulum

### Windows

1. **Gereksinimler:**
   - Windows 10 veya üzeri
   - Visual Studio Build Tools (opsiyonel)

2. **Kurulum:**
   ```cmd
   # Command Prompt veya PowerShell
   git clone https://github.com/your-repo/work-track.git
   cd work-track
   npm install
   npm run dev
   ```

### macOS

1. **Gereksinimler:**
   - macOS 10.14 veya üzeri
   - Xcode Command Line Tools

2. **Kurulum:**
   ```bash
   # Terminal
   xcode-select --install  # İlk kurulum için
   git clone https://github.com/your-repo/work-track.git
   cd work-track
   npm install
   npm run dev
   ```

### Linux (Ubuntu/Debian)

1. **Gereksinimler:**
   ```bash
   sudo apt update
   sudo apt install curl build-essential
   ```

2. **Node.js Kurulumu:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Uygulama Kurulumu:**
   ```bash
   git clone https://github.com/your-repo/work-track.git
   cd work-track
   npm install
   npm run dev
   ```

## 🔄 Güncelleme

### Otomatik Güncelleme
Uygulama içinde Settings > Check for Updates

### Manuel Güncelleme
```bash
git pull origin main
npm install
npm run build
```

## 💾 Veri Yedekleme

### Otomatik Yedek
Veriler otomatik olarak şu konumlarda saklanır:
- Windows: `%APPDATA%/work-track/`
- macOS: `~/Library/Application Support/work-track/`
- Linux: `~/.config/work-track/`

### Manuel Yedek
Menü > File > Export Data seçeneğini kullanın.

## 📞 Destek

### Dokümantasyon
- Ana rehber: `README.md`
- API dokümantasyonu: `/docs/api.md`
- FAQ: `/docs/faq.md`

### İletişim
- GitHub Issues: Bug raporları için
- Email: support@worktrack.app
- Discord: WorkTrack Community

## ✅ Kurulum Doğrulama

Kurulum başarılı olduysa:

1. **Uygulama açılıyor** ve ana ekran görünüyor
2. **Yeni görev** oluşturabiliyorsunuz
3. **Veriler kaydediliyor** (test görev oluşturup uygulamayı yeniden başlatın)
4. **Menüler çalışıyor** (File, Edit, View menüleri)

### Test Listesi
- [ ] Uygulama açılıyor
- [ ] Ana dashboard görünüyor
- [ ] Yeni görev modal'ı açılıyor
- [ ] Görev kaydediliyor
- [ ] Projeler sekmesi çalışıyor
- [ ] Takvim görünümü yükleniyor
- [ ] Arama fonksiyonu çalışıyor
- [ ] Veri export/import çalışıyor

## 🎉 Tamamlandı!

Tebrikler! Work Track başarıyla kuruldu. İyi çalışmalar! 🚀

---

**Not:** Bu kurulum rehberi ile ilgili sorularınız için lütfen GitHub Issues açın veya dokümantasyonu kontrol edin.