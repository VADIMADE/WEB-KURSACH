class AccessibilityManager {
    constructor() {
        this.modal = document.getElementById('accessibility-modal');
        this.eyeButton = document.getElementById('eye');
        this.isEnabled = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSavedSettings();
    }

    setupEventListeners() {
        // Кнопка глаза
        this.eyeButton.addEventListener('click', () => this.toggleModal());

        // Закрытие модального окна
        document.querySelector('.modal-close').addEventListener('click', () => this.closeModal());
        
        // Клик вне модального окна
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });

        // Кнопки размеров шрифта
        document.querySelectorAll('[data-size]').forEach(btn => {
            btn.addEventListener('click', (e) => this.setFontSize(e.target.dataset.size));
        });

        // Кнопки цветовых схем
        document.querySelectorAll('[data-scheme]').forEach(btn => {
            btn.addEventListener('click', (e) => this.setColorScheme(e.target.dataset.scheme));
        });

        // Кнопки фоновых изображений
        document.querySelectorAll('[data-bg]').forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleBackgroundImages(e.target.dataset.bg === 'hide'));
        });

        // Выбор цвета текста
        document.getElementById('text-color').addEventListener('change', (e) => {
            this.setTextColor(e.target.value);
        });

        // Выбор цвета фона
        document.getElementById('bg-color').addEventListener('change', (e) => {
            this.setBackgroundColor(e.target.value);
        });

        // Сброс настроек
        document.getElementById('reset-settings').addEventListener('click', () => {
            this.resetSettings();
        });

        // Горячие клавиши
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 'a') {
                e.preventDefault();
                this.toggleAccessibility();
            }
        });
    }

    toggleModal() {
        if (this.modal.style.display === 'block') {
            this.closeModal();
        } else {
            this.openModal();
        }
    }

    openModal() {
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    toggleAccessibility() {
        if (this.isEnabled) {
            this.disableAccessibility();
        } else {
            this.enableAccessibility();
        }
    }

    enableAccessibility() {
        document.body.classList.add('accessibility-mode');
        this.isEnabled = true;
        this.eyeButton.classList.add('active');
        this.openModal();
        localStorage.setItem('accessibilityEnabled', 'true');
    }

    disableAccessibility() {
        document.body.classList.remove('accessibility-mode');
        this.resetAllStyles();
        this.isEnabled = false;
        this.eyeButton.classList.remove('active');
        this.closeModal();
        localStorage.removeItem('accessibilityEnabled');
    }

    setFontSize(size) {
        document.body.classList.remove('font-small', 'font-medium', 'font-large');
        if (size !== 'medium') {
            document.body.classList.add(`font-${size}`);
        }
        this.updateActiveButtons('size', size);
        localStorage.setItem('fontSize', size);
    }

    setColorScheme(scheme) {
        document.body.classList.remove('scheme-contrast', 'scheme-inverted');
        if (scheme !== 'default') {
            document.body.classList.add(`scheme-${scheme}`);
        }
        this.updateActiveButtons('scheme', scheme);
        localStorage.setItem('colorScheme', scheme);
    }

    toggleBackgroundImages(hide) {
        if (hide) {
            document.body.classList.add('no-bg-images');
        } else {
            document.body.classList.remove('no-bg-images');
        }
        this.updateActiveButtons('bg', hide ? 'hide' : 'show');
        localStorage.setItem('hideBackgrounds', hide ? 'true' : 'false');
    }

    setTextColor(color) {
        document.documentElement.style.setProperty('--text-color', color);
        document.body.style.color = color;
        localStorage.setItem('textColor', color);
    }

    setBackgroundColor(color) {
        document.documentElement.style.setProperty('--bg-color', color);
        document.body.style.backgroundColor = color;
        localStorage.setItem('backgroundColor', color);
    }

    updateActiveButtons(type, value) {
        document.querySelectorAll(`[data-${type}]`).forEach(btn => {
            if (btn.dataset[type] === value) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    resetAllStyles() {
        document.body.classList.remove(
            'font-small', 'font-medium', 'font-large',
            'scheme-contrast', 'scheme-inverted',
            'no-bg-images'
        );
        document.body.style.color = '';
        document.body.style.backgroundColor = '';
        document.documentElement.style.removeProperty('--text-color');
        document.documentElement.style.removeProperty('--bg-color');
        
        this.updateActiveButtons('size', 'medium');
        this.updateActiveButtons('scheme', 'default');
        this.updateActiveButtons('bg', 'show');
        
        document.getElementById('text-color').value = '#000000';
        document.getElementById('bg-color').value = '#ffffff';
    }

    resetSettings() {
        this.resetAllStyles();
        localStorage.removeItem('fontSize');
        localStorage.removeItem('colorScheme');
        localStorage.removeItem('hideBackgrounds');
        localStorage.removeItem('textColor');
        localStorage.removeItem('backgroundColor');
    }

    loadSavedSettings() {
        const enabled = localStorage.getItem('accessibilityEnabled') === 'true';
        if (enabled) {
            this.enableAccessibility();
        }

        const fontSize = localStorage.getItem('fontSize');
        if (fontSize) this.setFontSize(fontSize);

        const colorScheme = localStorage.getItem('colorScheme');
        if (colorScheme) this.setColorScheme(colorScheme);

        const hideBackgrounds = localStorage.getItem('hideBackgrounds') === 'true';
        if (hideBackgrounds) this.toggleBackgroundImages(true);

        const textColor = localStorage.getItem('textColor');
        if (textColor) this.setTextColor(textColor);

        const bgColor = localStorage.getItem('backgroundColor');
        if (bgColor) this.setBackgroundColor(bgColor);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new AccessibilityManager();
});