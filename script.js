// Work Track - Ana JavaScript Dosyası - Gelişmiş Özellikler

class WorkTrackApp {
    constructor() {
        this.currentView = 'dashboard';
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.currentEditingTask = null;
        this.currentEditingProject = null;
        this.currentEditingCategory = null;
        this.currentEditingTemplate = null;
        this.draggedTask = null;
        this.currentTheme = 'classic-blue';
        this.pomodoroTimer = null;
        this.pomodoroTimeLeft = 25 * 60; // 25 dakika
        this.pomodoroRunning = false;
        this.searchResults = [];
        
        // Veri yapısı
        this.data = {
            tasks: [],
            projects: [],
            categories: [],
            tags: [],
            templates: [],
            settings: {
                theme: 'classic-blue',
                notifications: true,
                startTime: '09:00',
                endTime: '18:00',
                pomodoroLength: 25,
                shortBreak: 5,
                longBreak: 15,
                notificationSound: true
            }
        };
        
        this.init();
    }

    async init() {
        // Veri yükleme
        await this.loadData();
        
        // Olay dinleyicilerini ekle
        this.setupEventListeners();
        
        // Varsayılan veriler oluştur
        this.createDefaultData();
        
        // UI'yi güncelle
        this.updateUI();
        
        // Menü olaylarını dinle
        if (window.electronAPI) {
            window.electronAPI.onExportData(() => this.exportData());
            window.electronAPI.onImportData(() => this.importData());
            window.electronAPI.onMenuAction((action) => this.handleMenuAction(action));
            window.electronAPI.onChangeTheme((theme) => this.changeTheme(theme));
            window.electronAPI.onFullscreenChanged((isFullscreen) => this.handleFullscreenChange(isFullscreen));
        }

        // Bildirim izni iste
        if ('Notification' in window) {
            Notification.requestPermission();
        }

        // Otomatik kaydetme
        setInterval(() => this.saveData(), 30000); // 30 saniyede bir kaydet
    }

    async loadData() {
        try {
            if (window.electronAPI) {
                const savedData = await window.electronAPI.loadData();
                if (savedData) {
                    this.data = { ...this.data, ...savedData };
                }
            } else {
                // Tarayıcı ortamı için localStorage kullan
                const savedData = localStorage.getItem('workTrackData');
                if (savedData) {
                    this.data = { ...this.data, ...JSON.parse(savedData) };
                }
            }
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
        }
    }

    async saveData() {
        try {
            if (window.electronAPI) {
                await window.electronAPI.saveData(this.data);
            } else {
                localStorage.setItem('workTrackData', JSON.stringify(this.data));
            }
        } catch (error) {
            console.error('Veri kaydetme hatası:', error);
        }
    }

    createDefaultData() {
        // Varsayılan etiketler
        if (this.data.tags.length === 0) {
            this.data.tags = [
                { id: this.generateId(), name: 'Acil', color: '#ff6b6b' },
                { id: this.generateId(), name: 'Önemli', color: '#ffa726' },
                { id: this.generateId(), name: 'İnceleme', color: '#42a5f5' },
                { id: this.generateId(), name: 'Tamamlandı', color: '#66bb6a' }
            ];
        }

        // Varsayılan şablonlar
        if (this.data.templates.length === 0) {
            this.data.templates = [
                {
                    id: this.generateId(),
                    name: 'Haftalık Planlama',
                    description: 'Haftalık hedefleri ve görevleri planlama',
                    estimatedTime: 2,
                    priority: 'medium',
                    categoryId: null
                },
                {
                    id: this.generateId(),
                    name: 'Kod İncelemesi',
                    description: 'Pull request inceleme ve feedback verme',
                    estimatedTime: 1,
                    priority: 'high',
                    categoryId: null
                },
                {
                    id: this.generateId(),
                    name: 'Toplantı Hazırlığı',
                    description: 'Toplantı öncesi döküman hazırlama',
                    estimatedTime: 0.5,
                    priority: 'medium',
                    categoryId: null
                }
            ];
        }

        // Varsayılan kategoriler (mevcut kod korundu)
        if (this.data.categories.length === 0) {
            this.data.categories = [
                {
                    id: this.generateId(),
                    name: 'Geliştirme',
                    color: '#667eea',
                    icon: 'fas fa-code',
                    createdAt: new Date().toISOString()
                },
                {
                    id: this.generateId(),
                    name: 'Tasarım',
                    color: '#764ba2',
                    icon: 'fas fa-palette',
                    createdAt: new Date().toISOString()
                },
                {
                    id: this.generateId(),
                    name: 'Toplantı',
                    color: '#f093fb',
                    icon: 'fas fa-users',
                    createdAt: new Date().toISOString()
                },
                {
                    id: this.generateId(),
                    name: 'Öğrenme',
                    color: '#4facfe',
                    icon: 'fas fa-book',
                    createdAt: new Date().toISOString()
                }
            ];
        }

        // Varsayılan projeler (mevcut kod korundu)
        if (this.data.projects.length === 0) {
            this.data.projects = [
                {
                    id: this.generateId(),
                    name: 'Work Track Uygulaması',
                    description: 'Electron tabanlı görev takip uygulaması geliştirme',
                    color: '#667eea',
                    progress: 75,
                    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                    createdAt: new Date().toISOString(),
                    status: 'active'
                },
                {
                    id: this.generateId(),
                    name: 'Web Sitesi Yenileme',
                    description: 'Şirket web sitesinin yeniden tasarımı',
                    color: '#764ba2',
                    progress: 45,
                    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                    createdAt: new Date().toISOString(),
                    status: 'active'
                }
            ];
        }

        // Varsayılan görevler (mevcut kod korundu)
        if (this.data.tasks.length === 0) {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            this.data.tasks = [
                {
                    id: this.generateId(),
                    title: 'UI tasarımını tamamla',
                    description: 'Glassmorphism tasarımını uygula ve responsive yap',
                    projectId: this.data.projects[0].id,
                    categoryId: this.data.categories[1].id,
                    priority: 'high',
                    status: 'in-progress',
                    estimatedTime: 4,
                    actualTime: 2.5,
                    deadline: tomorrow.toISOString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    startTime: '09:00',
                    endTime: '13:00',
                    tags: [this.data.tags[1].id],
                    order: 0
                },
                {
                    id: this.generateId(),
                    title: 'Veri kaydetme fonksiyonları',
                    description: 'Electron IPC kullanarak veri kaydetme işlemleri',
                    projectId: this.data.projects[0].id,
                    categoryId: this.data.categories[0].id,
                    priority: 'medium',
                    status: 'completed',
                    estimatedTime: 3,
                    actualTime: 3.5,
                    deadline: today.toISOString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    completedAt: new Date().toISOString(),
                    startTime: '14:00',
                    endTime: '17:30',
                    tags: [this.data.tags[3].id],
                    order: 1
                },
                {
                    id: this.generateId(),
                    title: 'Haftalık ekip toplantısı',
                    description: 'Proje ilerlemesi ve sonraki adımları değerlendirme',
                    projectId: this.data.projects[1].id,
                    categoryId: this.data.categories[2].id,
                    priority: 'medium',
                    status: 'pending',
                    estimatedTime: 1,
                    deadline: tomorrow.toISOString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    startTime: '10:00',
                    endTime: '11:00',
                    tags: [this.data.tags[0].id],
                    order: 2
                }
            ];
        }

        // Mevcut görevlerde order yoksa ekle
        this.data.tasks.forEach((task, index) => {
            if (task.order === undefined) {
                task.order = index;
            }
        });

        this.saveData();
    }

    setupEventListeners() {
        // Mevcut olay dinleyicileri (korundu)
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        document.querySelector('.btn-add-task').addEventListener('click', () => {
            this.openTaskModal();
        });

        document.querySelector('.btn-new-project').addEventListener('click', () => {
            this.openProjectModal();
        });

        document.querySelector('.btn-new-category').addEventListener('click', () => {
            this.openCategoryModal();
        });

        // Modal kapatma
        document.querySelectorAll('.modal-close, .btn-cancel').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.closeModals();
                e.preventDefault();
            });
        });

        // Modal dışına tıklama
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModals();
                }
            });
        });

        // Form gönderimi
        document.getElementById('task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });

        document.getElementById('project-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProject();
        });

        document.getElementById('category-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCategory();
        });

        // Şablon form gönderimi
        const templateForm = document.getElementById('template-form');
        if (templateForm) {
            templateForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveTemplate();
            });
        }

        // Tarih navigasyonu
        document.getElementById('prev-day').addEventListener('click', () => {
            this.selectedDate.setDate(this.selectedDate.getDate() - 1);
            this.updateTodayView();
        });

        document.getElementById('next-day').addEventListener('click', () => {
            this.selectedDate.setDate(this.selectedDate.getDate() + 1);
            this.updateTodayView();
        });

        // Takvim navigasyonu
        document.getElementById('prev-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.updateCalendarView();
        });

        document.getElementById('next-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.updateCalendarView();
        });

        // Gelişmiş arama
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.performAdvancedSearch(e.target.value);
        });

        // Analitik periyodu
        document.getElementById('analytics-period').addEventListener('change', (e) => {
            this.updateAnalyticsExtended(e.target.value);
        });

        // Kısayol tuşları
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Pencere kontrolü butonları
        this.setupWindowControls();
        
        // Tema değiştirme butonları
        this.setupThemeControls();
        
        // Pomodoro timer
        this.setupPomodoroTimer();
        
        // Drag & Drop
        this.setupDragAndDrop();
    }

    setupWindowControls() {
        // Pencere kontrol butonları ekle
        const topBar = document.querySelector('.top-bar');
        const windowControls = document.createElement('div');
        windowControls.className = 'window-controls';
        windowControls.innerHTML = `
            <button id="minimize-btn" title="Küçült"><i class="fas fa-minus"></i></button>
            <button id="maximize-btn" title="Büyüt"><i class="fas fa-square"></i></button>
            <button id="fullscreen-btn" title="Tam Ekran"><i class="fas fa-expand"></i></button>
        `;

        topBar.appendChild(windowControls);

        if (window.electronAPI) {
            document.getElementById('minimize-btn').addEventListener('click', () => {
                window.electronAPI.minimizeWindow();
            });

            document.getElementById('maximize-btn').addEventListener('click', async () => {
                const isMaximized = await window.electronAPI.maximizeWindow();
                const icon = document.querySelector('#maximize-btn i');
                icon.className = isMaximized ? 'fas fa-compress' : 'fas fa-square';
            });

            document.getElementById('fullscreen-btn').addEventListener('click', async () => {
                const isFullscreen = await window.electronAPI.toggleFullscreen();
                const icon = document.querySelector('#fullscreen-btn i');
                icon.className = isFullscreen ? 'fas fa-compress' : 'fas fa-expand';
            });
        }
    }

    setupThemeControls() {
        // Tema değiştirme butonu ekle
        const topActions = document.querySelector('.top-actions');
        const themeBtn = document.createElement('button');
        themeBtn.className = 'btn-theme';
        themeBtn.title = 'Tema Değiştir';
        themeBtn.innerHTML = '<i class="fas fa-palette"></i>';
        
        themeBtn.addEventListener('click', () => {
            this.showThemeSelector();
        });
        
        topActions.insertBefore(themeBtn, topActions.firstChild);
    }

    setupPomodoroTimer() {
        // Pomodoro timer UI ekle
        const sidebar = document.querySelector('.sidebar-footer');
        const pomodoroSection = document.createElement('div');
        pomodoroSection.className = 'pomodoro-section';
        pomodoroSection.innerHTML = `
            <div class="pomodoro-timer">
                <h4>Pomodoro Timer</h4>
                <div class="timer-display">
                    <span id="timer-minutes">25</span>:<span id="timer-seconds">00</span>
                </div>
                <div class="timer-controls">
                    <button id="timer-start" class="btn-timer"><i class="fas fa-play"></i></button>
                    <button id="timer-pause" class="btn-timer"><i class="fas fa-pause"></i></button>
                    <button id="timer-reset" class="btn-timer"><i class="fas fa-stop"></i></button>
                </div>
            </div>
        `;

        sidebar.insertBefore(pomodoroSection, sidebar.firstChild);

        // Pomodoro kontrolleri
        document.getElementById('timer-start').addEventListener('click', () => this.startPomodoro());
        document.getElementById('timer-pause').addEventListener('click', () => this.pausePomodoro());
        document.getElementById('timer-reset').addEventListener('click', () => this.resetPomodoro());
    }

    setupDragAndDrop() {
        // Drag & Drop olaylarını dinle
        document.addEventListener('dragstart', (e) => {
            if (e.target.closest('.task-item')) {
                const taskItem = e.target.closest('.task-item');
                this.draggedTask = taskItem.dataset.taskId;
                taskItem.style.opacity = '0.5';
                taskItem.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', taskItem.outerHTML);
            }
        });

        document.addEventListener('dragend', (e) => {
            if (e.target.closest('.task-item')) {
                const taskItem = e.target.closest('.task-item');
                taskItem.style.opacity = '1';
                taskItem.classList.remove('dragging');
                this.draggedTask = null;
            }
        });

        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        });

        document.addEventListener('dragenter', (e) => {
            if (e.target.closest('.task-item') && this.draggedTask) {
                e.target.closest('.task-item').classList.add('drag-over');
            }
        });

        document.addEventListener('dragleave', (e) => {
            if (e.target.closest('.task-item')) {
                e.target.closest('.task-item').classList.remove('drag-over');
            }
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
            const targetTaskItem = e.target.closest('.task-item');
            if (this.draggedTask && targetTaskItem) {
                targetTaskItem.classList.remove('drag-over');
                const targetTaskId = targetTaskItem.dataset.taskId;
                if (this.draggedTask !== targetTaskId) {
                    this.reorderTasks(this.draggedTask, targetTaskId);
                }
            }
        });
    }

    // Silme işlemleri
    deleteTask(taskId) {
        const task = this.data.tasks.find(t => t.id === taskId);
        if (!task) return;

        const result = confirm(`"${task.title}" görevini silmek istediğinizden emin misiniz?`);
        if (result) {
            this.data.tasks = this.data.tasks.filter(t => t.id !== taskId);
            this.saveData();
            this.updateUI();
            this.showNotification('Görev silindi', 'success');
        }
    }

    deleteProject(projectId) {
        const project = this.data.projects.find(p => p.id === projectId);
        if (!project) return;

        const projectTasks = this.data.tasks.filter(t => t.projectId === projectId);
        let message = `"${project.name}" projesini silmek istediğinizden emin misiniz?`;
        
        if (projectTasks.length > 0) {
            message += `\n\nBu proje ile ilişkili ${projectTasks.length} görev var. Bu görevler projesiz hale gelecek.`;
        }

        const result = confirm(message);
        if (result) {
            this.data.projects = this.data.projects.filter(p => p.id !== projectId);
            // Proje görevlerini güncelle
            this.data.tasks.forEach(task => {
                if (task.projectId === projectId) {
                    task.projectId = null;
                }
            });
            this.saveData();
            this.updateUI();
            this.showNotification('Proje silindi', 'success');
        }
    }

    deleteCategory(categoryId) {
        const category = this.data.categories.find(c => c.id === categoryId);
        if (!category) return;

        const categoryTasks = this.data.tasks.filter(t => t.categoryId === categoryId);
        let message = `"${category.name}" kategorisini silmek istediğinizden emin misiniz?`;
        
        if (categoryTasks.length > 0) {
            message += `\n\nBu kategori ile ilişkili ${categoryTasks.length} görev var. Bu görevler kategorisiz hale gelecek.`;
        }

        const result = confirm(message);
        if (result) {
            this.data.categories = this.data.categories.filter(c => c.id !== categoryId);
            // Kategori görevlerini güncelle
            this.data.tasks.forEach(task => {
                if (task.categoryId === categoryId) {
                    task.categoryId = null;
                }
            });
            this.saveData();
            this.updateUI();
            this.showNotification('Kategori silindi', 'success');
        }
    }

    // Toplu silme işlemleri
    deleteAllCompletedTasks() {
        const completedTasks = this.data.tasks.filter(t => t.status === 'completed');
        if (completedTasks.length === 0) {
            this.showNotification('Silinecek tamamlanmış görev bulunamadı', 'info');
            return;
        }

        const result = confirm(`${completedTasks.length} tamamlanmış görevi silmek istediğinizden emin misiniz?`);
        if (result) {
            this.data.tasks = this.data.tasks.filter(t => t.status !== 'completed');
            this.saveData();
            this.updateUI();
            this.showNotification(`${completedTasks.length} tamamlanmış görev silindi`, 'success');
        }
    }

    deleteAllData() {
        const result = confirm('TÜM VERİLERİ silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!');
        if (result) {
            const doubleCheck = confirm('Son uyarı! Tüm görevler, projeler ve kategoriler silinecek. Devam etmek istediğinizden emin misiniz?');
            if (doubleCheck) {
                this.data = {
                    tasks: [],
                    projects: [],
                    categories: [],
                    tags: [],
                    templates: [],
                    settings: this.data.settings // Ayarları koru
                };
                this.createDefaultData();
                this.updateUI();
                this.showNotification('Tüm veriler sıfırlandı', 'success');
            }
        }
    }

    // Gelişmiş arama
    performAdvancedSearch(query) {
        if (!query.trim()) {
            this.searchResults = [];
            this.hideSearchResults();
            return;
        }

        const searchTerms = query.toLowerCase().split(' ');
        this.searchResults = [];

        // Görevlerde ara
        this.data.tasks.forEach(task => {
            const searchableText = [
                task.title,
                task.description,
                this.getProjectName(task.projectId),
                this.getCategoryName(task.categoryId),
                task.status,
                task.priority
            ].join(' ').toLowerCase();

            const matches = searchTerms.every(term => searchableText.includes(term));
            if (matches) {
                this.searchResults.push({
                    type: 'task',
                    item: task,
                    relevance: this.calculateRelevance(query, searchableText)
                });
            }
        });

        // Projelerde ara
        this.data.projects.forEach(project => {
            const searchableText = [
                project.name,
                project.description
            ].join(' ').toLowerCase();

            const matches = searchTerms.every(term => searchableText.includes(term));
            if (matches) {
                this.searchResults.push({
                    type: 'project',
                    item: project,
                    relevance: this.calculateRelevance(query, searchableText)
                });
            }
        });

        // Kategorilerde ara
        this.data.categories.forEach(category => {
            const searchableText = category.name.toLowerCase();
            const matches = searchTerms.every(term => searchableText.includes(term));
            if (matches) {
                this.searchResults.push({
                    type: 'category',
                    item: category,
                    relevance: this.calculateRelevance(query, searchableText)
                });
            }
        });

        // Sonuçları relevansa göre sırala
        this.searchResults.sort((a, b) => b.relevance - a.relevance);
        this.showSearchResults();
    }

    calculateRelevance(query, text) {
        const queryLower = query.toLowerCase();
        let relevance = 0;
        
        // Tam eşleşme
        if (text.includes(queryLower)) {
            relevance += 100;
        }
        
        // Kelime başlangıcı eşleşmesi
        const words = text.split(' ');
        words.forEach(word => {
            if (word.startsWith(queryLower)) {
                relevance += 50;
            }
        });
        
        return relevance;
    }

    showSearchResults() {
        let existingResults = document.querySelector('.search-results');
        if (!existingResults) {
            existingResults = document.createElement('div');
            existingResults.className = 'search-results';
            document.querySelector('.search-container').appendChild(existingResults);
        }

        if (this.searchResults.length === 0) {
            existingResults.innerHTML = '<div class="search-result-item">Sonuç bulunamadı</div>';
            return;
        }

        existingResults.innerHTML = this.searchResults.slice(0, 10).map(result => {
            const { type, item } = result;
            let icon = 'fas fa-tasks';
            let subtitle = '';

            if (type === 'project') {
                icon = 'fas fa-folder';
                subtitle = 'Proje';
            } else if (type === 'category') {
                icon = 'fas fa-tag';
                subtitle = 'Kategori';
            } else {
                subtitle = this.getProjectName(item.projectId) || 'Görev';
            }

            return `
                <div class="search-result-item" onclick="app.selectSearchResult('${type}', '${item.id}')">
                    <div class="search-result-icon">
                        <i class="${icon}"></i>
                    </div>
                    <div class="search-result-content">
                        <div class="search-result-title">${item.title || item.name}</div>
                        <div class="search-result-subtitle">${subtitle}</div>
                    </div>
                </div>
            `;
        }).join('');

        existingResults.style.display = 'block';
    }

    hideSearchResults() {
        const existingResults = document.querySelector('.search-results');
        if (existingResults) {
            existingResults.style.display = 'none';
        }
    }

    selectSearchResult(type, id) {
        this.hideSearchResults();
        document.getElementById('search-input').value = '';

        if (type === 'task') {
            this.editTask(id);
        } else if (type === 'project') {
            this.switchView('projects');
            setTimeout(() => this.editProject(id), 100);
        } else if (type === 'category') {
            this.switchView('categories');
            setTimeout(() => this.editCategory(id), 100);
        }
    }

    // Pomodoro Timer
    startPomodoro() {
        if (!this.pomodoroRunning) {
            this.pomodoroRunning = true;
            this.pomodoroTimer = setInterval(() => {
                this.pomodoroTimeLeft--;
                this.updatePomodoroDisplay();

                if (this.pomodoroTimeLeft <= 0) {
                    this.completePomodoroSession();
                }
            }, 1000);
            this.updatePomodoroButtons();
        }
    }

    pausePomodoro() {
        if (this.pomodoroRunning) {
            this.pomodoroRunning = false;
            clearInterval(this.pomodoroTimer);
            this.updatePomodoroButtons();
        }
    }

    resetPomodoro() {
        this.pomodoroRunning = false;
        clearInterval(this.pomodoroTimer);
        this.pomodoroTimeLeft = this.data.settings.pomodoroLength * 60;
        this.updatePomodoroDisplay();
        this.updatePomodoroButtons();
    }

    completePomodoroSession() {
        this.pomodoroRunning = false;
        clearInterval(this.pomodoroTimer);
        this.showNotification('Pomodoro seansı tamamlandı! Mola zamanı.', 'success');
        this.pomodoroTimeLeft = this.data.settings.shortBreak * 60;
        this.updatePomodoroDisplay();
        this.updatePomodoroButtons();
    }

    updatePomodoroDisplay() {
        const minutes = Math.floor(this.pomodoroTimeLeft / 60);
        const seconds = this.pomodoroTimeLeft % 60;
        document.getElementById('timer-minutes').textContent = minutes.toString().padStart(2, '0');
        document.getElementById('timer-seconds').textContent = seconds.toString().padStart(2, '0');
    }

    updatePomodoroButtons() {
        const startBtn = document.getElementById('timer-start');
        const pauseBtn = document.getElementById('timer-pause');
        
        if (this.pomodoroRunning) {
            startBtn.style.display = 'none';
            pauseBtn.style.display = 'inline-block';
        } else {
            startBtn.style.display = 'inline-block';
            pauseBtn.style.display = 'none';
        }
    }

    // Tema değiştirme
    changeTheme(themeName) {
        this.currentTheme = themeName;
        this.data.settings.theme = themeName;
        
        const themes = {
            'classic-blue': {
                primary: 'linear-gradient(135deg, #1a39c2 0%, #340068 100%)',
                secondary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            },
            'dark-purple': {
                primary: 'linear-gradient(135deg, #2d1b69 0%, #11001b 100%)',
                secondary: 'linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)'
            },
            'nature-green': {
                primary: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
                secondary: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)'
            },
            'sunset-orange': {
                primary: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                secondary: 'linear-gradient(135deg, #ff8a00 0%, #e52e71 100%)'
            }
        };

        const theme = themes[themeName];
        if (theme) {
            document.body.style.background = theme.primary;
            document.documentElement.style.setProperty('--primary-gradient', theme.primary);
            document.documentElement.style.setProperty('--secondary-gradient', theme.secondary);
        }

        this.saveData();
    }

    showThemeSelector() {
        // Tema seçici modal oluştur
        const themeModal = document.createElement('div');
        themeModal.className = 'modal active';
        themeModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Tema Seçin</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="theme-selector">
                    <div class="theme-option" data-theme="classic-blue">
                        <div class="theme-preview classic-blue"></div>
                        <span>Klasik Mavi</span>
                    </div>
                    <div class="theme-option" data-theme="dark-purple">
                        <div class="theme-preview dark-purple"></div>
                        <span>Karanlık Mor</span>
                    </div>
                    <div class="theme-option" data-theme="nature-green">
                        <div class="theme-preview nature-green"></div>
                        <span>Yeşil Doğa</span>
                    </div>
                    <div class="theme-option" data-theme="sunset-orange">
                        <div class="theme-preview sunset-orange"></div>
                        <span>Gün Batımı</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(themeModal);

        // Tema seçim olayları
        themeModal.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.dataset.theme;
                this.changeTheme(theme);
                document.body.removeChild(themeModal);
            });
        });

        // Modal kapatma
        themeModal.querySelector('.modal-close').addEventListener('click', () => {
            document.body.removeChild(themeModal);
        });

        themeModal.addEventListener('click', (e) => {
            if (e.target === themeModal) {
                document.body.removeChild(themeModal);
            }
        });
    }

    // Drag & Drop ile görev sıralama
    reorderTasks(draggedTaskId, targetTaskId) {
        const draggedIndex = this.data.tasks.findIndex(t => t.id === draggedTaskId);
        const targetIndex = this.data.tasks.findIndex(t => t.id === targetTaskId);

        if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) return;

        // Görev dizisinden çıkar ve yeni pozisyona ekle
        const [draggedTask] = this.data.tasks.splice(draggedIndex, 1);
        this.data.tasks.splice(targetIndex, 0, draggedTask);

        // Order değerlerini yeniden hesapla
        this.data.tasks.forEach((task, index) => {
            task.order = index;
            task.updatedAt = new Date().toISOString();
        });

        this.saveData();
        this.updateUI();
        this.showNotification('Görev sırası güncellendi', 'success');
    }

    // Kısayol tuşları
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + N - Yeni görev
        if ((e.ctrlKey || e.metaKey) && e.key === 'n' && !e.shiftKey) {
            e.preventDefault();
            this.openTaskModal();
        }
        
        // Ctrl/Cmd + Shift + N - Yeni proje
        if ((e.ctrlKey || e.metaKey) && e.key === 'N') {
            e.preventDefault();
            this.openProjectModal();
        }
        
        // Ctrl/Cmd + F - Arama odağı
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            document.getElementById('search-input').focus();
        }
        
        // Escape - Modal'ları kapat
        if (e.key === 'Escape') {
            this.closeModals();
            this.hideSearchResults();
        }
        
        // Delete - Seçili öğeyi sil
        if (e.key === 'Delete' && e.shiftKey) {
            // Implementasyon eklenebilir
        }
    }

    // Menü işlemleri
    handleMenuAction(action) {
        switch (action) {
            case 'new-task':
                this.openTaskModal();
                break;
            case 'new-project':
                this.openProjectModal();
                break;
            case 'focus-search':
                document.getElementById('search-input').focus();
                break;
        }
    }

    // Bildirimler
    showNotification(message, type = 'info') {
        // Web Notification API
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification('Work Track', {
                body: message,
                icon: 'assets/icon.png'
            });

            setTimeout(() => notification.close(), 3000);
        }

        // Uygulama içi bildirim
        this.showInAppNotification(message, type);
    }

    showInAppNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;

        document.body.appendChild(notification);

        // Otomatik kapat
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);

        // Manuel kapat
        notification.querySelector('.notification-close').addEventListener('click', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });

        // Animasyon
        setTimeout(() => notification.classList.add('show'), 100);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || icons.info;
    }

    // Tam ekran değişikliği
    handleFullscreenChange(isFullscreen) {
        const body = document.body;
        if (isFullscreen) {
            body.classList.add('fullscreen');
        } else {
            body.classList.remove('fullscreen');
        }
    }

    // Yardımcı fonksiyonlar
    getProjectName(projectId) {
        const project = this.data.projects.find(p => p.id === projectId);
        return project ? project.name : '';
    }

    getCategoryName(categoryId) {
        const category = this.data.categories.find(c => c.id === categoryId);
        return category ? category.name : '';
    }

    // Mevcut fonksiyonlar (korundu ve güncellenmeye devam ediyor...)
    switchView(viewName) {
        // Navigasyon butonlarını güncelle
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

        // İçerik alanlarını güncelle
        document.querySelectorAll('.view-content').forEach(view => {
            view.classList.remove('active');
        });
        document.getElementById(`${viewName}-view`).classList.add('active');

        this.currentView = viewName;

        // Görünüme özel güncellemeler
        switch (viewName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'today':
                this.updateTodayView();
                break;
            case 'projects':
                this.updateProjectsView();
                break;
            case 'categories':
                this.updateCategoriesView();
                break;
            case 'calendar':
                this.updateCalendarView();
                break;
            case 'analytics':
                this.updateAnalyticsExtended();
                break;
            case 'templates':
                this.updateTemplatesView();
                break;
        }
    }

    updateUI() {
        // Tarih bilgilerini güncelle
        document.getElementById('current-date').textContent = 
            this.currentDate.toLocaleDateString('tr-TR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

        // Tema uygula
        this.changeTheme(this.data.settings.theme);

        // Aktif görünümü güncelle
        this.switchView(this.currentView);
    }

    updateDashboard() {
        // İstatistikleri hesapla
        const totalTasks = this.data.tasks.length;
        const completedTasks = this.data.tasks.filter(task => task.status === 'completed').length;
        const pendingTasks = this.data.tasks.filter(task => task.status === 'pending').length;
        const activeProjects = this.data.projects.filter(project => project.status === 'active').length;

        // İstatistikleri güncelle
        document.getElementById('total-tasks').textContent = totalTasks;
        document.getElementById('completed-tasks').textContent = completedTasks;
        document.getElementById('pending-tasks').textContent = pendingTasks;
        document.getElementById('active-projects').textContent = activeProjects;

        // Son aktiviteleri güncelle
        this.updateRecentActivities();

        // Bugünün görevlerini güncelle
        this.updateTodayTasks();
    }

    updateRecentActivities() {
        const activitiesContainer = document.getElementById('recent-activities-list');
        const recentTasks = this.data.tasks
            .sort((a, b) => {
                // Önce order'a göre, sonra güncelleme tarihine göre sırala
                if (a.order !== undefined && b.order !== undefined) {
                    return a.order - b.order;
                }
                return new Date(b.updatedAt) - new Date(a.updatedAt);
            })
            .slice(0, 5);

        activitiesContainer.innerHTML = recentTasks.map(task => {
            const project = this.data.projects.find(p => p.id === task.projectId);
            const category = this.data.categories.find(c => c.id === task.categoryId);
            
            return `
                <div class="task-item" draggable="true" data-task-id="${task.id}">
                    <div class="task-header">
                        <div class="task-title" onclick="app.editTask('${task.id}')">${task.title}</div>
                        <div class="task-actions">
                            <div class="task-priority ${task.priority}">${this.getPriorityText(task.priority)}</div>
                            <button class="btn-delete-task" onclick="app.deleteTask('${task.id}')" title="Sil">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="task-meta">
                        <span><i class="fas fa-folder"></i> ${project ? project.name : 'Projede Değil'}</span>
                        <span><i class="fas fa-tag"></i> ${category ? category.name : 'Kategoride Değil'}</span>
                        <span><i class="fas fa-clock"></i> ${this.formatTime(task.updatedAt)}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateTodayTasks() {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        const todayTasksContainer = document.getElementById('today-tasks-list');
        const todayTasks = this.data.tasks
            .filter(task => {
                const taskDate = new Date(task.deadline).toISOString().split('T')[0];
                return taskDate === todayStr;
            })
            .sort((a, b) => {
                // Order'a göre sırala
                if (a.order !== undefined && b.order !== undefined) {
                    return a.order - b.order;
                }
                return new Date(a.createdAt) - new Date(b.createdAt);
            });

        todayTasksContainer.innerHTML = todayTasks.map(task => {
            const project = this.data.projects.find(p => p.id === task.projectId);
            const category = this.data.categories.find(c => c.id === task.categoryId);
            
            return `
                <div class="task-item" draggable="true" data-task-id="${task.id}">
                    <div class="task-header">
                        <div class="task-title" onclick="app.editTask('${task.id}')">${task.title}</div>
                        <div class="task-actions">
                            <div class="task-priority ${task.priority}">${this.getPriorityText(task.priority)}</div>
                            <button class="btn-delete-task" onclick="app.deleteTask('${task.id}')" title="Sil">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="task-meta">
                        <span><i class="fas fa-folder"></i> ${project ? project.name : 'Projede Değil'}</span>
                        <span><i class="fas fa-tag"></i> ${category ? category.name : 'Kategoride Değil'}</span>
                        <span><i class="fas fa-clock"></i> ${task.startTime || '09:00'} - ${task.endTime || '17:00'}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Projeler ve kategoriler görünümlerini güncelle (silme butonları ile)
    updateProjectsView() {
        const projectsContainer = document.getElementById('projects-grid');
        
        projectsContainer.innerHTML = this.data.projects.map(project => {
            const projectTasks = this.data.tasks.filter(task => task.projectId === project.id);
            const completedTasks = projectTasks.filter(task => task.status === 'completed').length;
            const totalTasks = projectTasks.length;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return `
                <div class="project-card">
                    <div class="project-header">
                        <div class="project-name" onclick="app.editProject('${project.id}')">${project.name}</div>
                        <div class="project-actions">
                            <span class="project-progress">${progress}%</span>
                            <button class="btn-delete-project" onclick="app.deleteProject('${project.id}')" title="Projeyi Sil">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="project-description" onclick="app.editProject('${project.id}')">${project.description}</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%; background: ${project.color}"></div>
                    </div>
                    <div class="project-stats">
                        <span>${completedTasks}/${totalTasks} görev</span>
                        <span>Son tarih: ${this.formatDate(project.deadline)}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateCategoriesView() {
        const categoriesContainer = document.getElementById('categories-list');
        
        categoriesContainer.innerHTML = this.data.categories.map(category => {
            const categoryTasks = this.data.tasks.filter(task => task.categoryId === category.id);
            const completedTasks = categoryTasks.filter(task => task.status === 'completed').length;
            const totalTasks = categoryTasks.length;

            return `
                <div class="category-item">
                    <div class="category-header">
                        <div class="category-icon" style="background: ${category.color}">
                            <i class="${category.icon}"></i>
                        </div>
                        <div class="category-name" onclick="app.editCategory('${category.id}')">${category.name}</div>
                        <button class="btn-delete-category" onclick="app.deleteCategory('${category.id}')" title="Kategoriyi Sil">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    <div class="category-stats">
                        <span>${totalTasks} görev</span>
                        <span>${completedTasks} tamamlandı</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Diğer tüm mevcut fonksiyonlar aynı şekilde devam ediyor...
    // (updateTodayView, updateCalendarView, generateTimeSlots, vs.)

    updateTodayView() {
        document.getElementById('selected-date').textContent = 
            this.selectedDate.toLocaleDateString('tr-TR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

        this.generateTimeSlots();
    }

    generateTimeSlots() {
        const timeSlotsContainer = document.getElementById('time-slots');
        const selectedDateStr = this.selectedDate.toISOString().split('T')[0];
        
        const dayTasks = this.data.tasks.filter(task => {
            const taskDate = new Date(task.deadline).toISOString().split('T')[0];
            return taskDate === selectedDateStr;
        });

        let html = '';
        for (let hour = 6; hour < 24; hour++) {
            const timeStr = `${hour.toString().padStart(2, '0')}:00`;
            const hourTasks = dayTasks.filter(task => {
                const startHour = parseInt(task.startTime?.split(':')[0] || '9');
                return startHour === hour;
            });

            html += `
                <div class="time-slot">
                    <div class="time-label">${timeStr}</div>
                    <div class="time-content">
                        ${hourTasks.map(task => {
                            const project = this.data.projects.find(p => p.id === task.projectId);
                            const category = this.data.categories.find(c => c.id === task.categoryId);
                            
                            return `
                                <div class="time-task" style="border-left: 4px solid ${category ? category.color : '#667eea'}">
                                    <div class="task-content" onclick="app.editTask('${task.id}')">
                                        <div class="task-title">${task.title}</div>
                                        <div class="task-meta">
                                            <span>${task.startTime || '09:00'} - ${task.endTime || '17:00'}</span>
                                            <span>${project ? project.name : 'Projede Değil'}</span>
                                        </div>
                                    </div>
                                    <button class="btn-delete-task-small" onclick="app.deleteTask('${task.id}')" title="Sil">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            `;
                        }).join('')}
                        ${hourTasks.length === 0 ? '<div style="color: rgba(255,255,255,0.3); font-style: italic;">Görev yok</div>' : ''}
                    </div>
                </div>
            `;
        }

        timeSlotsContainer.innerHTML = html;
    }

    updateCalendarView() {
        document.getElementById('current-month').textContent = 
            this.currentDate.toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long'
            });

        this.generateCalendar();
    }

    generateCalendar() {
        const calendarContainer = document.getElementById('calendar-grid');
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Ayın ilk günü ve son günü
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        let html = '';
        const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
        
        // Gün başlıkları
        dayNames.forEach(day => {
            html += `<div class="calendar-header-day" style="color: white; font-weight: 500; padding: 10px; text-align: center;">${day}</div>`;
        });

        // Takvim günleri
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const isCurrentMonth = currentDate.getMonth() === month;
            const isToday = this.isToday(currentDate);
            const dayTasks = this.getTasksForDate(currentDate);

            html += `
                <div class="calendar-day ${isCurrentMonth ? '' : 'other-month'} ${isToday ? 'today' : ''}" 
                     onclick="app.selectCalendarDate('${currentDate.toISOString()}')">
                    <div class="day-number">${currentDate.getDate()}</div>
                    <div class="day-tasks">
                        ${dayTasks.slice(0, 2).map(task => 
                            `<div class="day-task" style="background: ${this.getTaskColor(task)}">${task.title}</div>`
                        ).join('')}
                        ${dayTasks.length > 2 ? `<div class="day-task">+${dayTasks.length - 2} daha</div>` : ''}
                    </div>
                </div>
            `;
        }

        calendarContainer.innerHTML = html;
    }

    updateAnalytics(period = 'week') {
        // Basit analitik veriler
        const completionRate = this.calculateCompletionRate(period);
        const topCategory = this.getTopCategory(period);
        const avgCompletionTime = this.calculateAvgCompletionTime(period);

        document.getElementById('productivity-score').textContent = `${completionRate}%`;
        document.getElementById('top-category').textContent = topCategory;
        document.getElementById('avg-completion').textContent = avgCompletionTime;
    }

    // Modal işlemleri (mevcut kodlar korundu)
    openTaskModal(taskId = null) {
        this.currentEditingTask = taskId;
        const modal = document.getElementById('task-modal');
        const form = document.getElementById('task-form');
        const title = document.getElementById('task-modal-title');

        if (taskId) {
            const task = this.data.tasks.find(t => t.id === taskId);
            title.textContent = 'Görevi Düzenle';
            this.fillTaskForm(task);
        } else {
            title.textContent = 'Yeni Görev';
            form.reset();
        }

        this.populateSelects();
        modal.classList.add('active');
    }

    openProjectModal(projectId = null) {
        this.currentEditingProject = projectId;
        const modal = document.getElementById('project-modal');
        const form = document.getElementById('project-form');
        const title = document.getElementById('project-modal-title');

        if (projectId) {
            const project = this.data.projects.find(p => p.id === projectId);
            title.textContent = 'Projeyi Düzenle';
            this.fillProjectForm(project);
        } else {
            title.textContent = 'Yeni Proje';
            form.reset();
        }

        modal.classList.add('active');
    }

    openCategoryModal(categoryId = null) {
        this.currentEditingCategory = categoryId;
        const modal = document.getElementById('category-modal');
        const form = document.getElementById('category-form');
        const title = document.getElementById('category-modal-title');

        if (categoryId) {
            const category = this.data.categories.find(c => c.id === categoryId);
            title.textContent = 'Kategoriyi Düzenle';
            this.fillCategoryForm(category);
        } else {
            title.textContent = 'Yeni Kategori';
            form.reset();
        }

        modal.classList.add('active');
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        this.currentEditingTask = null;
        this.currentEditingProject = null;
        this.currentEditingCategory = null;
        this.currentEditingTemplate = null;
    }

    populateSelects() {
        // Proje seçenekleri
        const projectSelect = document.getElementById('task-project');
        projectSelect.innerHTML = '<option value="">Proje Seçin</option>' + 
            this.data.projects.map(project => 
                `<option value="${project.id}">${project.name}</option>`
            ).join('');

        // Kategori seçenekleri
        const categorySelect = document.getElementById('task-category');
        categorySelect.innerHTML = '<option value="">Kategori Seçin</option>' + 
            this.data.categories.map(category => 
                `<option value="${category.id}">${category.name}</option>`
            ).join('');

        // Etiketleri güncelle
        this.updateTagsContainer();
    }

    fillTaskForm(task) {
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description || '';
        document.getElementById('task-project').value = task.projectId || '';
        document.getElementById('task-category').value = task.categoryId || '';
        document.getElementById('task-priority').value = task.priority;
        document.getElementById('task-estimated-time').value = task.estimatedTime || '';
        
        // Durum seçeneği varsa
        const statusSelect = document.getElementById('task-status');
        if (statusSelect) {
            statusSelect.value = task.status || 'pending';
        }

        // Zaman bilgileri
        document.getElementById('task-start-time').value = task.startTime || '09:00';
        document.getElementById('task-end-time').value = task.endTime || '17:00';
        
        if (task.deadline) {
            const deadline = new Date(task.deadline);
            document.getElementById('task-deadline').value = 
                deadline.toISOString().slice(0, 16);
        }

        // Etiketleri seç
        setTimeout(() => {
            this.setSelectedTags(task.tags || []);
        }, 100);
    }

    fillProjectForm(project) {
        document.getElementById('project-name').value = project.name;
        document.getElementById('project-description').value = project.description || '';
        document.getElementById('project-color').value = project.color;
        
        if (project.deadline) {
            const deadline = new Date(project.deadline);
            document.getElementById('project-deadline').value = 
                deadline.toISOString().slice(0, 10);
        }
    }

    fillCategoryForm(category) {
        document.getElementById('category-name').value = category.name;
        document.getElementById('category-color').value = category.color;
        document.getElementById('category-icon').value = category.icon;
    }

    // Kaydetme işlemleri (mevcut kodlar korundu)
    saveTask() {
        const formData = {
            title: document.getElementById('task-title').value,
            description: document.getElementById('task-description').value,
            projectId: document.getElementById('task-project').value || null,
            categoryId: document.getElementById('task-category').value || null,
            priority: document.getElementById('task-priority').value,
            status: document.getElementById('task-status') ? document.getElementById('task-status').value : 'pending',
            estimatedTime: parseFloat(document.getElementById('task-estimated-time').value) || null,
            deadline: document.getElementById('task-deadline').value ? 
                new Date(document.getElementById('task-deadline').value).toISOString() : null,
            startTime: document.getElementById('task-start-time').value || '09:00',
            endTime: document.getElementById('task-end-time').value || '17:00',
            tags: this.getSelectedTags()
        };

        if (this.currentEditingTask) {
            // Mevcut görevi güncelle
            const taskIndex = this.data.tasks.findIndex(t => t.id === this.currentEditingTask);
            this.data.tasks[taskIndex] = {
                ...this.data.tasks[taskIndex],
                ...formData,
                updatedAt: new Date().toISOString()
            };
            this.showNotification('Görev güncellendi', 'success');
        } else {
            // Yeni görev ekle
            const newTask = {
                id: this.generateId(),
                ...formData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                order: this.data.tasks.length
            };
            this.data.tasks.push(newTask);
            this.showNotification('Yeni görev eklendi', 'success');
        }

        this.saveData();
        this.closeModals();
        this.updateUI();
    }

    saveProject() {
        const formData = {
            name: document.getElementById('project-name').value,
            description: document.getElementById('project-description').value,
            color: document.getElementById('project-color').value,
            deadline: document.getElementById('project-deadline').value ? 
                new Date(document.getElementById('project-deadline').value).toISOString() : null
        };

        if (this.currentEditingProject) {
            // Mevcut projeyi güncelle
            const projectIndex = this.data.projects.findIndex(p => p.id === this.currentEditingProject);
            this.data.projects[projectIndex] = {
                ...this.data.projects[projectIndex],
                ...formData,
                updatedAt: new Date().toISOString()
            };
            this.showNotification('Proje güncellendi', 'success');
        } else {
            // Yeni proje ekle
            const newProject = {
                id: this.generateId(),
                ...formData,
                progress: 0,
                status: 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.data.projects.push(newProject);
            this.showNotification('Yeni proje eklendi', 'success');
        }

        this.saveData();
        this.closeModals();
        this.updateUI();
    }

    saveCategory() {
        const formData = {
            name: document.getElementById('category-name').value,
            color: document.getElementById('category-color').value,
            icon: document.getElementById('category-icon').value
        };

        if (this.currentEditingCategory) {
            // Mevcut kategoriyi güncelle
            const categoryIndex = this.data.categories.findIndex(c => c.id === this.currentEditingCategory);
            this.data.categories[categoryIndex] = {
                ...this.data.categories[categoryIndex],
                ...formData,
                updatedAt: new Date().toISOString()
            };
            this.showNotification('Kategori güncellendi', 'success');
        } else {
            // Yeni kategori ekle
            const newCategory = {
                id: this.generateId(),
                ...formData,
                createdAt: new Date().toISOString()
            };
            this.data.categories.push(newCategory);
            this.showNotification('Yeni kategori eklendi', 'success');
        }

        this.saveData();
        this.closeModals();
        this.updateUI();
    }

    // Düzenleme işlemleri
    editTask(taskId) {
        this.openTaskModal(taskId);
    }

    editProject(projectId) {
        this.openProjectModal(projectId);
    }

    editCategory(categoryId) {
        this.openCategoryModal(categoryId);
    }

    // Şablon sistemi
    updateTemplatesView() {
        const templatesContainer = document.getElementById('templates-grid');
        
        templatesContainer.innerHTML = this.data.templates.map(template => {
            const category = this.data.categories.find(c => c.id === template.categoryId);
            
            return `
                <div class="template-card">
                    <div class="template-header">
                        <div class="template-name" onclick="app.editTemplate('${template.id}')">${template.name}</div>
                        <div class="template-actions">
                            <button class="btn-use-template" onclick="app.createTaskFromTemplate('${template.id}')" title="Şablondan Görev Oluştur">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button class="btn-delete-template" onclick="app.deleteTemplate('${template.id}')" title="Şablonu Sil">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="template-description">${template.description}</div>
                    <div class="template-meta">
                        <span class="template-priority ${template.priority}">${this.getPriorityText(template.priority)}</span>
                        <span class="template-category">${category ? category.name : 'Kategorisiz'}</span>
                        <span class="template-time">${template.estimatedTime || 0} saat</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    openTemplateModal(templateId = null) {
        this.currentEditingTemplate = templateId;
        const modal = document.getElementById('template-modal');
        const form = document.getElementById('template-form');
        const title = document.getElementById('template-modal-title');

        if (templateId) {
            const template = this.data.templates.find(t => t.id === templateId);
            title.textContent = 'Şablonu Düzenle';
            this.fillTemplateForm(template);
        } else {
            title.textContent = 'Yeni Şablon';
            form.reset();
        }

        this.populateTemplateSelects();
        modal.classList.add('active');
    }

    fillTemplateForm(template) {
        document.getElementById('template-name').value = template.name;
        document.getElementById('template-description').value = template.description || '';
        document.getElementById('template-category').value = template.categoryId || '';
        document.getElementById('template-priority').value = template.priority;
        document.getElementById('template-estimated-time').value = template.estimatedTime || '';
    }

    populateTemplateSelects() {
        const categorySelect = document.getElementById('template-category');
        categorySelect.innerHTML = '<option value="">Kategori Seçin</option>' + 
            this.data.categories.map(category => 
                `<option value="${category.id}">${category.name}</option>`
            ).join('');
    }

    saveTemplate() {
        const formData = {
            name: document.getElementById('template-name').value,
            description: document.getElementById('template-description').value,
            categoryId: document.getElementById('template-category').value || null,
            priority: document.getElementById('template-priority').value,
            estimatedTime: parseFloat(document.getElementById('template-estimated-time').value) || null
        };

        if (this.currentEditingTemplate) {
            const templateIndex = this.data.templates.findIndex(t => t.id === this.currentEditingTemplate);
            this.data.templates[templateIndex] = {
                ...this.data.templates[templateIndex],
                ...formData,
                updatedAt: new Date().toISOString()
            };
            this.showNotification('Şablon güncellendi', 'success');
        } else {
            const newTemplate = {
                id: this.generateId(),
                ...formData,
                createdAt: new Date().toISOString()
            };
            this.data.templates.push(newTemplate);
            this.showNotification('Yeni şablon eklendi', 'success');
        }

        this.saveData();
        this.closeModals();
        this.updateUI();
    }

    editTemplate(templateId) {
        this.openTemplateModal(templateId);
    }

    deleteTemplate(templateId) {
        const template = this.data.templates.find(t => t.id === templateId);
        if (!template) return;

        const result = confirm(`"${template.name}" şablonunu silmek istediğinizden emin misiniz?`);
        if (result) {
            this.data.templates = this.data.templates.filter(t => t.id !== templateId);
            this.saveData();
            this.updateUI();
            this.showNotification('Şablon silindi', 'success');
        }
    }

    createTaskFromTemplate(templateId) {
        const template = this.data.templates.find(t => t.id === templateId);
        if (!template) return;

        const newTask = {
            id: this.generateId(),
            title: template.name,
            description: template.description,
            projectId: null,
            categoryId: template.categoryId,
            priority: template.priority,
            status: 'pending',
            estimatedTime: template.estimatedTime,
            deadline: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: [],
            order: this.data.tasks.length,
            startTime: '09:00',
            endTime: '17:00'
        };

        this.data.tasks.push(newTask);
        this.saveData();
        this.updateUI();
        this.showNotification(`"${template.name}" şablonundan görev oluşturuldu`, 'success');
    }

    // Ayarlar sistemi
    openSettingsModal() {
        const modal = document.getElementById('settings-modal');
        this.fillSettingsForm();
        modal.classList.add('active');
    }

    fillSettingsForm() {
        const settings = this.data.settings;
        document.getElementById('setting-notifications').checked = settings.notifications;
        document.getElementById('setting-sound').checked = settings.notificationSound;
        document.getElementById('setting-pomodoro-length').value = settings.pomodoroLength;
        document.getElementById('setting-short-break').value = settings.shortBreak;
        document.getElementById('setting-long-break').value = settings.longBreak;
        document.getElementById('setting-start-time').value = settings.startTime;
        document.getElementById('setting-end-time').value = settings.endTime;
    }

    saveSettings() {
        this.data.settings = {
            ...this.data.settings,
            notifications: document.getElementById('setting-notifications').checked,
            notificationSound: document.getElementById('setting-sound').checked,
            pomodoroLength: parseInt(document.getElementById('setting-pomodoro-length').value),
            shortBreak: parseInt(document.getElementById('setting-short-break').value),
            longBreak: parseInt(document.getElementById('setting-long-break').value),
            startTime: document.getElementById('setting-start-time').value,
            endTime: document.getElementById('setting-end-time').value
        };

        // Pomodoro timer'ı güncelle
        this.pomodoroTimeLeft = this.data.settings.pomodoroLength * 60;
        this.updatePomodoroDisplay();

        this.saveData();
        this.closeModals();
        this.showNotification('Ayarlar kaydedildi', 'success');
    }

    // Toplu silme işlemleri
    deleteAllProjects() {
        if (this.data.projects.length === 0) {
            this.showNotification('Silinecek proje bulunamadı', 'info');
            return;
        }

        const result = confirm(`${this.data.projects.length} projeyi silmek istediğinizden emin misiniz?\n\nProje görevleri projesiz hale gelecek.`);
        if (result) {
            // Tüm görevlerin proje bağlantısını kaldır
            this.data.tasks.forEach(task => {
                task.projectId = null;
            });
            
            this.data.projects = [];
            this.saveData();
            this.updateUI();
            this.showNotification('Tüm projeler silindi', 'success');
        }
    }

    deleteAllCategories() {
        if (this.data.categories.length === 0) {
            this.showNotification('Silinecek kategori bulunamadı', 'info');
            return;
        }

        const result = confirm(`${this.data.categories.length} kategoriyi silmek istediğinizden emin misiniz?\n\nKategori görevleri kategorisiz hale gelecek.`);
        if (result) {
            // Tüm görevlerin kategori bağlantısını kaldır
            this.data.tasks.forEach(task => {
                task.categoryId = null;
            });
            
            // Varsayılan kategorileri yeniden oluştur
            this.data.categories = [];
            this.createDefaultData();
            this.updateUI();
            this.showNotification('Tüm kategoriler silindi ve varsayılanlar yeniden oluşturuldu', 'success');
        }
    }

    deleteAllTasks() {
        if (this.data.tasks.length === 0) {
            this.showNotification('Silinecek görev bulunamadı', 'info');
            return;
        }

        const result = confirm(`${this.data.tasks.length} görevi silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!`);
        if (result) {
            this.data.tasks = [];
            this.saveData();
            this.updateUI();
            this.showNotification('Tüm görevler silindi', 'success');
        }
    }

    // Etiket sistemi
    updateTagsContainer() {
        const container = document.getElementById('task-tags-container');
        if (!container) return;

        container.innerHTML = this.data.tags.map(tag => `
            <div class="tag-item">
                <input type="checkbox" id="tag-${tag.id}" value="${tag.id}">
                <label for="tag-${tag.id}" style="color: ${tag.color}">${tag.name}</label>
            </div>
        `).join('');
    }

    getSelectedTags() {
        const container = document.getElementById('task-tags-container');
        if (!container) return [];

        const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    setSelectedTags(tagIds) {
        const container = document.getElementById('task-tags-container');
        if (!container) return;

        const checkboxes = container.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => {
            cb.checked = tagIds.includes(cb.value);
        });
    }

    // Gelişmiş analitikler
    updateAnalyticsExtended(period = 'week') {
        // Temel analitikleri güncelle
        this.updateAnalytics(period);

        // Bu haftaki tamamlanan görev sayısı
        const weekCompleted = this.getCompletedTasksInPeriod('week');
        document.getElementById('week-completed').textContent = `${weekCompleted} görev`;
    }

    getCompletedTasksInPeriod(period) {
        const now = new Date();
        let startDate;
        
        switch (period) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }

        return this.data.tasks.filter(task => 
            task.status === 'completed' && 
            task.completedAt && 
            new Date(task.completedAt) >= startDate
        ).length;
    }

    // Takvim işlemleri
    selectCalendarDate(dateStr) {
        this.selectedDate = new Date(dateStr);
        this.switchView('today');
    }

    // Yardımcı fonksiyonlar
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    formatDate(dateStr) {
        if (!dateStr) return 'Belirtilmemiş';
        return new Date(dateStr).toLocaleDateString('tr-TR');
    }

    formatTime(dateStr) {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getPriorityText(priority) {
        const priorities = {
            low: 'Düşük',
            medium: 'Orta',
            high: 'Yüksek',
            urgent: 'Acil'
        };
        return priorities[priority] || 'Orta';
    }

    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    getTasksForDate(date) {
        const dateStr = date.toISOString().split('T')[0];
        return this.data.tasks.filter(task => {
            if (!task.deadline) return false;
            const taskDate = new Date(task.deadline).toISOString().split('T')[0];
            return taskDate === dateStr;
        });
    }

    getTaskColor(task) {
        const category = this.data.categories.find(c => c.id === task.categoryId);
        return category ? category.color : '#667eea';
    }

    calculateCompletionRate(period) {
        const now = new Date();
        let startDate;
        
        switch (period) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case 'quarter':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case 'year':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }

        const periodTasks = this.data.tasks.filter(task => 
            new Date(task.createdAt) >= startDate
        );
        
        const completed = periodTasks.filter(task => task.status === 'completed').length;
        const total = periodTasks.length;
        
        return total > 0 ? Math.round((completed / total) * 100) : 0;
    }

    getTopCategory(period) {
        const categories = this.data.categories.map(category => {
            const tasks = this.data.tasks.filter(task => task.categoryId === category.id);
            return {
                name: category.name,
                count: tasks.length
            };
        }).sort((a, b) => b.count - a.count);

        return categories.length > 0 ? categories[0].name : 'Kategori yok';
    }

    calculateAvgCompletionTime(period) {
        const completedTasks = this.data.tasks.filter(task => 
            task.status === 'completed' && task.actualTime
        );
        
        if (completedTasks.length === 0) return '0 saat';
        
        const totalTime = completedTasks.reduce((sum, task) => sum + task.actualTime, 0);
        const avgTime = totalTime / completedTasks.length;
        
        return `${avgTime.toFixed(1)} saat`;
    }

    // Dışa/İçe aktarma
    async exportData() {
        try {
            if (window.electronAPI) {
                const result = await window.electronAPI.exportData();
                if (result.success) {
                    this.showNotification(`Veriler başarıyla dışa aktarıldı: ${result.path}`, 'success');
                } else {
                    this.showNotification('Dışa aktarma sırasında hata oluştu', 'error');
                }
            }
        } catch (error) {
            console.error('Dışa aktarma hatası:', error);
            this.showNotification('Dışa aktarma sırasında hata oluştu', 'error');
        }
    }

    async importData() {
        try {
            if (window.electronAPI) {
                const result = await window.electronAPI.importData();
                if (result.success) {
                    this.data = result.data;
                    this.updateUI();
                    this.showNotification('Veriler başarıyla içe aktarıldı', 'success');
                } else {
                    this.showNotification('İçe aktarma sırasında hata oluştu', 'error');
                }
            }
        } catch (error) {
            console.error('İçe aktarma hatası:', error);
            this.showNotification('İçe aktarma sırasında hata oluştu', 'error');
        }
    }
}

// Uygulamayı başlat
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new WorkTrackApp();
});