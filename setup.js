#!/usr/bin/env node

/**
 * Work Track Kurulum Scripti
 * Bu script, uygulamanın kurulumu için gerekli adımları otomatik olarak gerçekleştirir.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Work Track Kurulum Scripti');
console.log('===============================\n');

// Renk kodları
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, color = 'reset') {
    console.log(colors[color] + message + colors.reset);
}

function checkNodeVersion() {
    log('📋 Node.js versiyonu kontrol ediliyor...', 'blue');
    
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 16) {
        log('❌ Hata: Node.js v16 veya üzeri gereklidir. Mevcut versiyon: ' + nodeVersion, 'red');
        log('💡 https://nodejs.org adresinden güncel sürümü indirin.', 'yellow');
        process.exit(1);
    }
    
    log('✅ Node.js versiyonu uygun: ' + nodeVersion, 'green');
}

function createDirectories() {
    log('\n📁 Gerekli klasörler oluşturuluyor...', 'blue');
    
    const directories = [
        'assets',
        'dist',
        'src',
        'src/styles',
        'src/scripts',
        'src/components'
    ];
    
    directories.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            log(`✅ ${dir} klasörü oluşturuldu`, 'green');
        } else {
            log(`📁 ${dir} klasörü zaten mevcut`, 'yellow');
        }
    });
}

function createIconFiles() {
    log('\n🎨 İkon dosyaları oluşturuluyor...', 'blue');
    
    const iconSizes = [16, 32, 48, 64, 128, 256, 512, 1024];
    const iconContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
            </linearGradient>
        </defs>
        <rect width="512" height="512" rx="80" fill="url(#grad1)"/>
        <path d="M128 256l112 112 144-144" stroke="white" stroke-width="32" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="256" cy="256" r="180" stroke="white" stroke-width="16" fill="none" opacity="0.3"/>
    </svg>`;
    
    // SVG icon oluştur
    if (!fs.existsSync('assets/icon.svg')) {
        fs.writeFileSync('assets/icon.svg', iconContent.trim());
        log('✅ SVG ikon oluşturuldu', 'green');
    }
    
    // PNG için placeholder
    if (!fs.existsSync('assets/icon.png')) {
        fs.writeFileSync('assets/icon.png', ''); // Gerçek PNG içeriği olacak
        log('⚠️  PNG ikon placeholder oluşturuldu (gerçek ikon gerekli)', 'yellow');
    }
    
    // ICO için placeholder
    if (!fs.existsSync('assets/icon.ico')) {
        fs.writeFileSync('assets/icon.ico', ''); // Gerçek ICO içeriği olacak
        log('⚠️  ICO ikon placeholder oluşturuldu (gerçek ikon gerekli)', 'yellow');
    }
    
    // ICNS için placeholder
    if (!fs.existsSync('assets/icon.icns')) {
        fs.writeFileSync('assets/icon.icns', ''); // Gerçek ICNS içeriği olacak
        log('⚠️  ICNS ikon placeholder oluşturuldu (gerçek ikon gerekli)', 'yellow');
    }
}

function installDependencies() {
    log('\n📦 Bağımlılıklar yükleniyor...', 'blue');
    
    try {
        // npm kurulu mu kontrol et
        execSync('npm --version', { stdio: 'pipe' });
        
        log('📥 npm install çalıştırılıyor...', 'blue');
        execSync('npm install', { stdio: 'inherit' });
        log('✅ Bağımlılıklar başarıyla yüklendi', 'green');
        
    } catch (error) {
        log('❌ Bağımlılık yükleme hatası: ' + error.message, 'red');
        
        // Yarn'ı dene
        try {
            execSync('yarn --version', { stdio: 'pipe' });
            log('🔄 Yarn ile deneniyor...', 'yellow');
            execSync('yarn install', { stdio: 'inherit' });
            log('✅ Bağımlılıklar Yarn ile yüklendi', 'green');
        } catch (yarnError) {
            log('❌ Yarn ile de hata oluştu: ' + yarnError.message, 'red');
            process.exit(1);
        }
    }
}

function createConfigFiles() {
    log('\n⚙️  Yapılandırma dosyaları kontrol ediliyor...', 'blue');
    
    // .env.example oluştur
    const envExample = `
# Work Track Environment Variables
NODE_ENV=development
DEBUG_MODE=true
AUTO_UPDATER=false
ANALYTICS_ENABLED=false
`;
    
    if (!fs.existsSync('.env.example')) {
        fs.writeFileSync('.env.example', envExample.trim());
        log('✅ .env.example oluşturuldu', 'green');
    }
    
    // ESLint config
    const eslintConfig = {
        "env": {
            "browser": true,
            "es2021": true,
            "node": true
        },
        "extends": "eslint:recommended",
        "parserOptions": {
            "ecmaVersion": 12,
            "sourceType": "module"
        },
        "rules": {
            "indent": ["error", 4],
            "quotes": ["error", "single"],
            "semi": ["error", "always"]
        }
    };
    
    if (!fs.existsSync('.eslintrc.json')) {
        fs.writeFileSync('.eslintrc.json', JSON.stringify(eslintConfig, null, 2));
        log('✅ ESLint yapılandırması oluşturuldu', 'green');
    }
}

function createScripts() {
    log('\n📝 Yardımcı scriptler oluşturuluyor...', 'blue');
    
    // Build script
    const buildScript = `#!/bin/bash
echo "🔨 Work Track Build Script"
echo "========================="

# Temizleme
echo "🧹 Eski build dosyaları temizleniyor..."
rm -rf dist/
rm -rf out/
rm -rf build/

# Build
echo "📦 Uygulama derleniyor..."
npm run build

echo "✅ Build tamamlandı!"
`;
    
    if (!fs.existsSync('scripts')) {
        fs.mkdirSync('scripts');
    }
    
    fs.writeFileSync('scripts/build.sh', buildScript);
    fs.chmodSync('scripts/build.sh', '755');
    log('✅ Build script oluşturuldu', 'green');
    
    // Development script
    const devScript = `#!/bin/bash
echo "🚀 Work Track Development Server"
echo "==============================="

# Geliştirme modunda başlat
echo "🔄 Geliştirme sunucusu başlatılıyor..."
npm run dev
`;
    
    fs.writeFileSync('scripts/dev.sh', devScript);
    fs.chmodSync('scripts/dev.sh', '755');
    log('✅ Development script oluşturuldu', 'green');
}

function checkSystemRequirements() {
    log('\n🔍 Sistem gereksinimleri kontrol ediliyor...', 'blue');
    
    const os = require('os');
    const platform = os.platform();
    const arch = os.arch();
    const totalMem = Math.round(os.totalmem() / 1024 / 1024 / 1024);
    
    log(`💻 Platform: ${platform}`, 'blue');
    log(`🏗️  Mimari: ${arch}`, 'blue');
    log(`🧠 RAM: ${totalMem} GB`, 'blue');
    
    if (totalMem < 4) {
        log('⚠️  Uyarı: 4GB veya daha fazla RAM önerilir', 'yellow');
    } else {
        log('✅ Sistem gereksinimleri karşılanıyor', 'green');
    }
}

function showCompletionMessage() {
    log('\n🎉 Kurulum tamamlandı!', 'green');
    log('====================\n', 'green');
    
    log('📋 Sonraki adımlar:', 'blue');
    log('1. npm run dev        - Geliştirme modunda başlat', 'yellow');
    log('2. npm run build      - Üretim için derle', 'yellow');
    log('3. npm run dist       - Dağıtım paketi oluştur', 'yellow');
    
    log('\n📚 Daha fazla bilgi için README.md dosyasını inceleyin.', 'blue');
    log('🐛 Sorun yaşarsanız GitHub Issues\'ı kullanın.', 'blue');
    
    log('\n🚀 İyi çalışmalar!', 'green');
}

// Ana kurulum fonksiyonu
async function main() {
    try {
        checkNodeVersion();
        checkSystemRequirements();
        createDirectories();
        createIconFiles();
        createConfigFiles();
        createScripts();
        installDependencies();
        showCompletionMessage();
        
    } catch (error) {
        log('\n❌ Kurulum sırasında hata oluştu:', 'red');
        log(error.message, 'red');
        log('\n💡 Yardım için dokümantasyonu kontrol edin.', 'yellow');
        process.exit(1);
    }
}

// Script çalıştır
if (require.main === module) {
    main();
}

module.exports = {
    checkNodeVersion,
    createDirectories,
    installDependencies,
    createConfigFiles
};