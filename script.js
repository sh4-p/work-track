// Work Track - Ana JavaScript Dosyası

class WorkTrackApp {
    constructor() {
        this.currentView = 'dashboard';
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.currentEditingTask = null;
        this.currentEditingProject = null;
        this.currentEditingCategory = null;
        
        // Veri yapısı
        this.data = {
            tasks: [],
            projects: [],
            categories: [],
            settings: {
                theme: 'glassmorphism',
                notifications: true,
                startTime: '09:00',
                endTime: '18:00'
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
        }
    }

    async loadData() {
        try {
            if (window.electronAPI) {
                const savedData = await window.electronAPI.loadData();
                if (savedData) {
                    this.data = { ...this.data, ...savedData };
                }
            } else {
                // Tarayıcı ortamı için localStorage kullan (demo için)
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
                // Tarayıcı ortamı için localStorage kullan (demo için)
                localStorage.setItem('workTrackData', JSON.stringify(this.data));
            }
        } catch (error) {
            console.error('Veri kaydetme hatası:', error);
        }
    }

    createDefaultData() {
        // Varsayılan kategoriler
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

        // Varsayılan projeler
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

        // Varsayılan görevler
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
                    endTime: '13:00'
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
                    endTime: '17:30'
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
                    endTime: '11:00'
                }
            ];
        }

        this.saveData();
    }

    setupEventListeners() {
        // Navigasyon butonları
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        // Yeni görev butonu
        document.querySelector('.btn-add-task').addEventListener('click', () => {
            this.openTaskModal();
        });

        // Yeni proje butonu
        document.querySelector('.btn-new-project').addEventListener('click', () => {
            this.openProjectModal();
        });

        // Yeni kategori butonu
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

        // Arama
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.searchTasks(e.target.value);
        });

        // Analitik periyodu
        document.getElementById('analytics-period').addEventListener('change', (e) => {
            this.updateAnalytics(e.target.value);
        });
    }

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
                this.updateAnalytics();
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
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 5);

        activitiesContainer.innerHTML = recentTasks.map(task => {
            const project = this.data.projects.find(p => p.id === task.projectId);
            const category = this.data.categories.find(c => c.id === task.categoryId);
            
            return `
                <div class="task-item" onclick="app.editTask('${task.id}')">
                    <div class="task-header">
                        <div class="task-title">${task.title}</div>
                        <div class="task-priority ${task.priority}">${this.getPriorityText(task.priority)}</div>
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
        const todayTasks = this.data.tasks.filter(task => {
            const taskDate = new Date(task.deadline).toISOString().split('T')[0];
            return taskDate === todayStr;
        });

        todayTasksContainer.innerHTML = todayTasks.map(task => {
            const project = this.data.projects.find(p => p.id === task.projectId);
            const category = this.data.categories.find(c => c.id === task.categoryId);
            
            return `
                <div class="task-item" onclick="app.editTask('${task.id}')">
                    <div class="task-header">
                        <div class="task-title">${task.title}</div>
                        <div class="task-priority ${task.priority}">${this.getPriorityText(task.priority)}</div>
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
                                <div class="time-task" onclick="app.editTask('${task.id}')" style="border-left: 4px solid ${category ? category.color : '#667eea'}">
                                    <div class="task-title">${task.title}</div>
                                    <div class="task-meta">
                                        <span>${task.startTime || '09:00'} - ${task.endTime || '17:00'}</span>
                                        <span>${project ? project.name : 'Projede Değil'}</span>
                                    </div>
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

    updateProjectsView() {
        const projectsContainer = document.getElementById('projects-grid');
        
        projectsContainer.innerHTML = this.data.projects.map(project => {
            const projectTasks = this.data.tasks.filter(task => task.projectId === project.id);
            const completedTasks = projectTasks.filter(task => task.status === 'completed').length;
            const totalTasks = projectTasks.length;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return `
                <div class="project-card" onclick="app.editProject('${project.id}')">
                    <div class="project-header">
                        <div class="project-name">${project.name}</div>
                        <div class="project-progress">${progress}%</div>
                    </div>
                    <div class="project-description">${project.description}</div>
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
                <div class="category-item" onclick="app.editCategory('${category.id}')">
                    <div class="category-header">
                        <div class="category-icon" style="background: ${category.color}">
                            <i class="${category.icon}"></i>
                        </div>
                        <div class="category-name">${category.name}</div>
                    </div>
                    <div class="category-stats">
                        <span>${totalTasks} görev</span>
                        <span>${completedTasks} tamamlandı</span>
                    </div>
                </div>
            `;
        }).join('');
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

    // Modal işlemleri
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
    }

    fillTaskForm(task) {
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description || '';
        document.getElementById('task-project').value = task.projectId || '';
        document.getElementById('task-category').value = task.categoryId || '';
        document.getElementById('task-priority').value = task.priority;
        document.getElementById('task-estimated-time').value = task.estimatedTime || '';
        
        if (task.deadline) {
            const deadline = new Date(task.deadline);
            document.getElementById('task-deadline').value = 
                deadline.toISOString().slice(0, 16);
        }
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

    // Kaydetme işlemleri
    saveTask() {
        const formData = {
            title: document.getElementById('task-title').value,
            description: document.getElementById('task-description').value,
            projectId: document.getElementById('task-project').value || null,
            categoryId: document.getElementById('task-category').value || null,
            priority: document.getElementById('task-priority').value,
            estimatedTime: parseFloat(document.getElementById('task-estimated-time').value) || null,
            deadline: document.getElementById('task-deadline').value ? 
                new Date(document.getElementById('task-deadline').value).toISOString() : null
        };

        if (this.currentEditingTask) {
            // Mevcut görevi güncelle
            const taskIndex = this.data.tasks.findIndex(t => t.id === this.currentEditingTask);
            this.data.tasks[taskIndex] = {
                ...this.data.tasks[taskIndex],
                ...formData,
                updatedAt: new Date().toISOString()
            };
        } else {
            // Yeni görev ekle
            const newTask = {
                id: this.generateId(),
                ...formData,
                status: 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.data.tasks.push(newTask);
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
        } else {
            // Yeni kategori ekle
            const newCategory = {
                id: this.generateId(),
                ...formData,
                createdAt: new Date().toISOString()
            };
            this.data.categories.push(newCategory);
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

    // Silme işlemleri
    deleteTask(taskId) {
        if (confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
            this.data.tasks = this.data.tasks.filter(t => t.id !== taskId);
            this.saveData();
            this.updateUI();
        }
    }

    deleteProject(projectId) {
        if (confirm('Bu projeyi silmek istediğinizden emin misiniz?')) {
            this.data.projects = this.data.projects.filter(p => p.id !== projectId);
            // Proje görevlerini de temizle
            this.data.tasks.forEach(task => {
                if (task.projectId === projectId) {
                    task.projectId = null;
                }
            });
            this.saveData();
            this.updateUI();
        }
    }

    deleteCategory(categoryId) {
        if (confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
            this.data.categories = this.data.categories.filter(c => c.id !== categoryId);
            // Kategori görevlerini de temizle
            this.data.tasks.forEach(task => {
                if (task.categoryId === categoryId) {
                    task.categoryId = null;
                }
            });
            this.saveData();
            this.updateUI();
        }
    }

    // Arama
    searchTasks(query) {
        if (!query.trim()) {
            this.updateUI();
            return;
        }

        const filteredTasks = this.data.tasks.filter(task => 
            task.title.toLowerCase().includes(query.toLowerCase()) ||
            task.description?.toLowerCase().includes(query.toLowerCase())
        );

        // Arama sonuçlarını göster
        console.log('Arama sonuçları:', filteredTasks);
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
                    alert(`Veriler başarıyla dışa aktarıldı: ${result.path}`);
                } else {
                    alert('Dışa aktarma sırasında hata oluştu');
                }
            }
        } catch (error) {
            console.error('Dışa aktarma hatası:', error);
            alert('Dışa aktarma sırasında hata oluştu');
        }
    }

    async importData() {
        try {
            if (window.electronAPI) {
                const result = await window.electronAPI.importData();
                if (result.success) {
                    this.data = result.data;
                    this.updateUI();
                    alert('Veriler başarıyla içe aktarıldı');
                } else {
                    alert('İçe aktarma sırasında hata oluştu');
                }
            }
        } catch (error) {
            console.error('İçe aktarma hatası:', error);
            alert('İçe aktarma sırasında hata oluştu');
        }
    }
}

// Uygulamayı başlat
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new WorkTrackApp();
});