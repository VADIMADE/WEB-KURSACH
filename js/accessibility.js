class AccessibilityManager {
    constructor() {
        this.isActive = false;
        this.isPanelVisible = true;
        this.currentFontSize = 'medium';
        this.currentTheme = 'white-black';
        this.hideImages = false;
        
        this.sectionsWithBgImages = [
            'main-section',
            'plastic-free-section',
            'subscription-section'
        ];
        
        this.originalBackgrounds = {};
        this.styleElement = null;
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const eyeButton = document.getElementById('eye');
        if (eyeButton) {
            eyeButton.addEventListener('click', () => this.toggleAccessibility());
        }
    }

    toggleAccessibility() {
        this.isActive = !this.isActive;
        
        if (this.isActive) {
            this.enableAccessibility();
            this.showControlPanel();
        } else {
            this.disableAccessibility();
            this.hideControlPanel();
        }
        
        this.saveSettings();
    }

    togglePanel() {
        this.isPanelVisible = !this.isPanelVisible;
        
        const panel = document.getElementById('accessibilityPanel');
        const toggleBtn = document.getElementById('accessibilityToggleBtn');
        
        if (panel && toggleBtn) {
            if (this.isPanelVisible) {
                panel.classList.remove('collapsed');
                toggleBtn.textContent = 'Свернуть панель';
                
                const minimizedPanel = document.getElementById('accessibilityMinimizedPanel');
                if (minimizedPanel) {
                    minimizedPanel.style.display = 'none';
                }
            } else {
                panel.classList.add('collapsed');
                toggleBtn.textContent = 'Развернуть панель';
                this.createMinimizedPanel();
            }
        }
        
        this.saveSettings();
    }

    showMinimizedPanel() {
        this.isPanelVisible = true;
        
        const panel = document.getElementById('accessibilityPanel');
        const toggleBtn = document.getElementById('accessibilityToggleBtn');
        const minimizedPanel = document.getElementById('accessibilityMinimizedPanel');
        
        if (panel && toggleBtn) {
            panel.classList.remove('collapsed');
            toggleBtn.textContent = 'Свернуть панель';
        }
        
        if (minimizedPanel) {
            minimizedPanel.style.display = 'none';
        }
    }

    enableAccessibility() {
        // Сохраняем оригинальные фоновые изображения
        this.saveOriginalBackgrounds();
        
        // Добавляем классы доступности
        document.documentElement.classList.add('accessibility-mode');
        this.applyFontSize();
        this.applyTheme();
        this.applyImageVisibility();
        
        // Создаем стили для скрытия фоновых изображений
        this.createAccessibilityStyles();
    }

    disableAccessibility() {
        // Убираем все классы доступности
        document.documentElement.classList.remove('accessibility-mode');
        document.documentElement.classList.remove('font-small', 'font-medium', 'font-large');
        document.documentElement.classList.remove('theme-black-white', 'theme-black-green', 'theme-white-black');
        document.documentElement.classList.remove('hide-images');
        
        // Удаляем созданные стили
        this.removeAccessibilityStyles();
        
        // Восстанавливаем оригинальные фоновые изображения
        this.restoreOriginalBackgrounds();
        
        // Удаляем созданные элементы
        this.removeAccessibilityElements();
    }

    saveOriginalBackgrounds() {
        this.sectionsWithBgImages.forEach(sectionClass => {
            const sections = document.querySelectorAll(`.${sectionClass}`);
            sections.forEach((section, index) => {
                const key = `${sectionClass}-${index}`;
                
                // Сохраняем computed стили
                const computedStyle = window.getComputedStyle(section);
                this.originalBackgrounds[key] = {
                    backgroundImage: computedStyle.backgroundImage,
                    backgroundColor: computedStyle.backgroundColor
                };
            });
        });
    }

    restoreOriginalBackgrounds() {
        // Просто удаляем созданные стили - оригинальные CSS стили восстановятся автоматически
        this.removeAccessibilityStyles();
        
        // Восстанавливаем футер
        const footer = document.querySelector('footer');
        if (footer) {
            footer.style.removeProperty('background-color');
            footer.style.removeProperty('color');
            footer.style.removeProperty('border-top');
        }
    }

    createAccessibilityStyles() {
        // Удаляем старые стили если есть
        this.removeAccessibilityStyles();
        
        // Создаем элемент style для наших правил
        this.styleElement = document.createElement('style');
        this.styleElement.id = 'accessibility-styles';
        
        // Добавляем правила для скрытия фоновых изображений
        let cssRules = `
            .accessibility-mode .main-section,
            .accessibility-mode .plastic-free-section,
            .accessibility-mode .subscription-section {
                background-image: none !important;
            }
        `;
        
        // Добавляем правила для цветов фона в зависимости от темы
        cssRules += `
            .accessibility-mode.theme-black-white .main-section,
            .accessibility-mode.theme-black-white .plastic-free-section,
            .accessibility-mode.theme-black-white .subscription-section {
                background-color: #000000 !important;
            }
            
            .accessibility-mode.theme-black-green .main-section,
            .accessibility-mode.theme-black-green .plastic-free-section,
            .accessibility-mode.theme-black-green .subscription-section {
                background-color: #000000 !important;
            }
            
            .accessibility-mode.theme-white-black .main-section,
            .accessibility-mode.theme-white-black .plastic-free-section,
            .accessibility-mode.theme-white-black .subscription-section {
                background-color: #FFFFFF !important;
            }
        `;
        
        this.styleElement.textContent = cssRules;
        document.head.appendChild(this.styleElement);
    }

    removeAccessibilityStyles() {
        const styleElement = document.getElementById('accessibility-styles');
        if (styleElement) {
            styleElement.remove();
        }
        this.styleElement = null;
    }

    applyTheme() {
        document.documentElement.classList.remove('theme-black-white', 'theme-black-green', 'theme-white-black');
        document.documentElement.classList.add(`theme-${this.currentTheme}`);
        this.applySectionColors();
    }

    applySectionColors() {
        const footer = document.querySelector('footer');
        
        // Убираем предыдущие inline стили для футера
        if (footer) {
            footer.style.removeProperty('background-color');
            footer.style.removeProperty('color');
            footer.style.removeProperty('border-top');
        }
        
        // Применяем новые стили для футера
        switch(this.currentTheme) {
            case 'black-white':
                if (footer) {
                    footer.style.setProperty('background-color', '#000000', 'important');
                    footer.style.setProperty('color', '#FFFFFF', 'important');
                    footer.style.setProperty('border-top', '2px solid #333', 'important');
                }
                break;
                
            case 'black-green':
                if (footer) {
                    footer.style.setProperty('background-color', '#000000', 'important');
                    footer.style.setProperty('color', '#00FF00', 'important');
                    footer.style.setProperty('border-top', '2px solid #333', 'important');
                }
                break;
                
            case 'white-black':
                if (footer) {
                    footer.style.setProperty('background-color', '#FFFFFF', 'important');
                    footer.style.setProperty('color', '#000000', 'important');
                    footer.style.setProperty('border-top', '2px solid #ddd', 'important');
                }
                break;
        }
    }

    removeAccessibilityElements() {
        const elements = [
            'accessibilityPanel',
            'accessibilityToggleBtn',
            'accessibilityMinimizedPanel'
        ];
        
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.remove();
            }
        });
    }

    setFontSize(size) {
        this.currentFontSize = size;
        this.applyFontSize();
        this.updateButtonStates();
        this.saveSettings();
    }

    setTheme(theme) {
        this.currentTheme = theme;
        this.applyTheme();
        this.updateButtonStates();
        this.saveSettings();
    }

    setImageVisibility(hide) {
        this.hideImages = hide;
        this.applyImageVisibility();
        this.updateButtonStates();
        this.saveSettings();
    }

    applyFontSize() {
        document.documentElement.classList.remove('font-small', 'font-medium', 'font-large');
        document.documentElement.classList.add(`font-${this.currentFontSize}`);
    }

    applyImageVisibility() {
        if (this.hideImages) {
            document.documentElement.classList.add('hide-images');
        } else {
            document.documentElement.classList.remove('hide-images');
        }
    }

    showControlPanel() {
        this.createControlPanel();
        this.createToggleButton();
        
        const panel = document.getElementById('accessibilityPanel');
        if (panel) {
            panel.style.display = 'block';
            if (!this.isPanelVisible) {
                panel.classList.add('collapsed');
                this.createMinimizedPanel();
            }
        }
    }

    hideControlPanel() {
        this.removeAccessibilityElements();
    }

    createControlPanel() {
        let panel = document.getElementById('accessibilityPanel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'accessibilityPanel';
            panel.className = 'accessibility-panel';
            
            panel.innerHTML = `
                <h3>Версия для слабовидящих</h3>
                <div class="accessibility-options">
                    <div>
                        <strong>Размер текста:</strong>
                        <button class="accessibility-btn ${this.currentFontSize === 'small' ? 'active' : ''}" 
                                onclick="accessibilityManager.setFontSize('small')">Маленький</button>
                        <button class="accessibility-btn ${this.currentFontSize === 'medium' ? 'active' : ''}" 
                                onclick="accessibilityManager.setFontSize('medium')">Средний</button>
                        <button class="accessibility-btn ${this.currentFontSize === 'large' ? 'active' : ''}" 
                                onclick="accessibilityManager.setFontSize('large')">Большой</button>
                    </div>
                    
                    <div>
                        <strong>Цветовая схема:</strong>
                        <button class="accessibility-btn ${this.currentTheme === 'black-white' ? 'active' : ''}" 
                                onclick="accessibilityManager.setTheme('black-white')">Черный/Белый</button>
                        <button class="accessibility-btn ${this.currentTheme === 'black-green' ? 'active' : ''}" 
                                onclick="accessibilityManager.setTheme('black-green')">Черный/Зеленый</button>
                        <button class="accessibility-btn ${this.currentTheme === 'white-black' ? 'active' : ''}" 
                                onclick="accessibilityManager.setTheme('white-black')">Белый/Черный</button>
                    </div>
                    
                    <div>
                        <strong>Изображения:</strong>
                        <button class="accessibility-btn ${!this.hideImages ? 'active' : ''}" 
                                onclick="accessibilityManager.setImageVisibility(false)">Включить</button>
                        <button class="accessibility-btn ${this.hideImages ? 'active' : ''}" 
                                onclick="accessibilityManager.setImageVisibility(true)">Отключить</button>
                    </div>
                    
                    <button class="accessibility-btn accessibility-close-btn" 
                            onclick="accessibilityManager.toggleAccessibility()">Вернуть как было</button>
                </div>
            `;
            
            document.body.appendChild(panel);
        }
    }

    createToggleButton() {
        let toggleBtn = document.getElementById('accessibilityToggleBtn');
        if (!toggleBtn) {
            toggleBtn = document.createElement('button');
            toggleBtn.id = 'accessibilityToggleBtn';
            toggleBtn.className = 'accessibility-toggle-btn';
            toggleBtn.textContent = this.isPanelVisible ? 'Свернуть панель' : 'Развернуть панель';
            toggleBtn.onclick = () => this.togglePanel();
            
            document.body.appendChild(toggleBtn);
        }
    }

    createMinimizedPanel() {
        let minimizedPanel = document.getElementById('accessibilityMinimizedPanel');
        if (!minimizedPanel && !this.isPanelVisible) {
            minimizedPanel = document.createElement('div');
            minimizedPanel.id = 'accessibilityMinimizedPanel';
            minimizedPanel.className = 'accessibility-panel-minimized';
            minimizedPanel.textContent = 'Панель доступности';
            minimizedPanel.onclick = () => this.showMinimizedPanel();
            minimizedPanel.style.display = 'block';
            
            document.body.appendChild(minimizedPanel);
        }
    }

    updateButtonStates() {
        const panel = document.getElementById('accessibilityPanel');
        if (!panel) return;
        
        const fontSizeButtons = panel.querySelectorAll('button[onclick*="setFontSize"]');
        fontSizeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.onclick.toString().includes(`'${this.currentFontSize}'`)) {
                btn.classList.add('active');
            }
        });
        
        const themeButtons = panel.querySelectorAll('button[onclick*="setTheme"]');
        themeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.onclick.toString().includes(`'${this.currentTheme}'`)) {
                btn.classList.add('active');
            }
        });
        
        const imageButtons = panel.querySelectorAll('button[onclick*="setImageVisibility"]');
        imageButtons.forEach(btn => {
            btn.classList.remove('active');
            if ((this.hideImages && btn.onclick.toString().includes('true')) ||
                (!this.hideImages && btn.onclick.toString().includes('false'))) {
                btn.classList.add('active');
            }
        });
    }

    saveSettings() {
        const settings = {
            isActive: this.isActive,
            isPanelVisible: this.isPanelVisible,
            fontSize: this.currentFontSize,
            theme: this.currentTheme,
            hideImages: this.hideImages
        };
        localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('accessibilitySettings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.isActive = settings.isActive;
                this.isPanelVisible = settings.isPanelVisible !== undefined ? settings.isPanelVisible : true;
                this.currentFontSize = settings.fontSize || 'medium';
                this.currentTheme = settings.theme || 'white-black';
                this.hideImages = settings.hideImages || false;
                
                if (this.isActive) {
                    this.enableAccessibility();
                    this.showControlPanel();
                }
            } catch (e) {
                console.error('Error loading accessibility settings:', e);
            }
        }
    }
}

// Инициализация менеджера доступности
const accessibilityManager = new AccessibilityManager();