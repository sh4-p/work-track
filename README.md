# Work Track - İş Takip Uygulaması

Work Track, Electron ile geliştirilmiş modern ve güçlü bir görev takip uygulamasıdır. Glassmorphism tasarım trendini kullanarak hem estetik hem de fonksiyonel bir deneyim sunar.

## Özellikler

### 📋 Görev Yönetimi
- Detaylı görev oluşturma ve düzenleme
- Öncelik seviyeleri (Düşük, Orta, Yüksek, Acil)
- Tahmini ve gerçek çalışma süresi takibi
- Son tarih belirleme
- Durum takibi (Bekleyen, Devam Eden, Tamamlandı)

### 📁 Proje Organizasyonu
- Görevleri projelere göre gruplandırma
- Proje ilerlemesi takibi
- Renk kodlaması ile görsel organizasyon
- Proje deadline'ları

### 🏷️ Kategori Sistemi
- Esnek kategori oluşturma
- Özelleştirilebilir ikonlar ve renkler
- Kategori bazında analitik

### 📅 Takvim Entegrasyonu
- Aylık takvim görünümü
- Günlük zaman çizelgesi
- Görsel görev dağılımı
- Tarih bazında navigasyon

### 📊 Analitik ve Raporlama
- Verimlilik skoru hesaplama
- Haftalık, aylık, çeyreklik analiz
- En verimli kategoriler
- Ortalama tamamlama süreleri

### 🎨 Modern Tasarım
- Glassmorphism UI/UX
- Responsive tasarım
- Smooth animasyonlar
- Koyu/açık tema desteği

### 💾 Veri Yönetimi
- Otomatik veri kaydetme
- JSON formatında dışa/içe aktarma
- Yedekleme sistemi

## Kurulum

### Ön Gereksinimler
- Node.js (v16 veya üzeri)
- npm veya yarn

### Adımlar

1. **Klasör Oluşturma**
   ```bash
   mkdir work-track
   cd work-track
   ```

2. **Bağımlılıkları Yükleme**
   ```bash
   npm install
   ```

3. **Geliştirme Modunda Çalıştırma**
   ```bash
   npm run dev
   ```

4. **Üretim Derlemesi**
   ```bash
   npm run build
   ```

5. **Dağıtım Paketi Oluşturma**
   ```bash
   npm run dist
   ```

## Dosya Yapısı

```
work-track/
├── main.js                 # Ana Electron süreç
├── preload.js             # Güvenlik katmanı
├── index.html             # Ana HTML sayfası
├── style.css              # Glassmorphism stiller
├── script.js              # Uygulama mantığı
├── package.json           # Proje yapılandırması
├── assets/                # İkonlar ve görseller
│   ├── icon.png
│   ├── icon.ico
│   └── icon.icns
├── dist/                  # Derlenmiş dosyalar
└── README.md             # Dokümantasyon
```

## Kullanım

### Görev Ekleme
1. Sol panelde "Yeni Görev" butonuna tıklayın
2. Görev detaylarını doldurun
3. Proje ve kategori seçin
4. Öncelik ve deadline belirleyin
5. "Kaydet" butonuna tıklayın

### Proje Oluşturma
1. "Projeler" sekmesine gidin
2. "Yeni Proje" butonuna tıklayın
3. Proje bilgilerini girin
4. Renk ve deadline belirleyin
5. Kaydedin

### Kategori Yönetimi
1. "Kategoriler" sekmesine gidin
2. "Yeni Kategori" ile kategori oluşturun
3. İkon ve renk seçin
4. Mevcut kategorileri düzenleyin

### Takvim Görünümü
1. "Takvim" sekmesine gidin
2. Ay bazında navigasyon yapın
3. Günlere tıklayarak detay görün
4. "Bugün" sekmesinde zaman çizelgesi

### Analitik
1. "Analitik" sekmesine gidin
2. Dönem seçin (hafta, ay, çeyrek, yıl)
3. Verimlilik skorunuzu görün
4. Detaylı istatistikleri inceleyin

## Veri Yönetimi

### Otomatik Kaydetme
- Tüm değişiklikler otomatik olarak kaydedilir
- Veriler yerel olarak şifrelenerek saklanır

### Yedekleme
- Menü → Dosya → Verileri Dışa Aktar
- JSON formatında yedek alın
- İhtiyaç halinde geri yükleyin

### Veri Konumu
- Windows: `%APPDATA%/work-track/`
- macOS: `~/Library/Application Support/work-track/`
- Linux: `~/.config/work-track/`

## Gelişmiş Özellikler

### Kısayol Tuşları
- `Ctrl/Cmd + N`: Yeni görev
- `Ctrl/Cmd + P`: Yeni proje
- `Ctrl/Cmd + F`: Arama
- `Ctrl/Cmd + S`: Kaydet
- `Esc`: Modal'ları kapat

### Özelleştirme
- Renk temaları değiştirilebilir
- Çalışma saatleri ayarlanabilir
- Bildirim tercihleri

### API Entegrasyonu
- Gelecekte Trello, Asana entegrasyonu
- Takım çalışması özellikleri
- Cloud senkronizasyon

## Sorun Giderme

### Uygulama Açılmıyor
1. Node.js versiyonunu kontrol edin
2. `npm install` çalıştırın
3. Antivirus yazılımını kontrol edin

### Veriler Kayboldu
1. Yedek dosyalarını kontrol edin
2. Veri klasörünü kontrol edin
3. İçe aktarma özelliğini kullanın

### Performans Sorunları
1. Eski görevleri arşivleyin
2. Uygulamayı yeniden başlatın
3. Sistem kaynaklarını kontrol edin

## Geliştirme

### Geliştirici Araçları
```bash
# Geliştirme modunda başlat
npm run dev

# Testleri çalıştır
npm test

# Linting
npm run lint
```

### Katkıda Bulunma
1. Fork yapın
2. Feature branch oluşturun
3. Değişiklikleri commit edin
4. Pull request gönderin

### Hata Bildirimi
- GitHub Issues kullanın
- Detaylı açıklama ekleyin
- Sistem bilgilerini paylaşın

## Güvenlik

### Veri Güvenliği
- Tüm veriler yerel olarak saklanır
- Hassas bilgiler şifrelenir
- İnternet bağlantısı gerektirmez

### Gizlilik
- Hiçbir veri dışarı gönderilmez
- Kullanım istatistikleri toplanmaz
- Tamamen offline çalışır
---
