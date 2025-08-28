const i18Obj = {
  'en': {
    'main-title': 'Toothpaste, reinvented',
    'main-description': 'The only plastic-free and clean way to replace the paste you\'ve used your whole life.',
    'shop-now': 'shop now',
    // Добавьте остальные переводы здесь
  },
  'ru': {
    'main-title': 'Зубная паста, переосмысленная',
    'main-description': 'Единственный безпластиковый и чистый способ заменить пасту, которую вы использовали всю жизнь.',
    'shop-now': 'купить сейчас',
    // Добавьте остальные переводы здесь
  }
};

let currentLang = 'en';
let currentTheme = 'light';

// Функция перевода
function getTranslate(lang) {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.dataset.i18n;
    if (i18Obj[lang] && i18Obj[lang][key]) {
      element.textContent = i18Obj[lang][key];
    }
  });
  
  // Обновляем активную кнопку языка
  document.querySelectorAll('.lang-btn').forEach(btn => {
    if (btn.dataset.lang === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  currentLang = lang;
}

// Функция переключения темы
function toggleTheme() {
  const body = document.body;
  body.classList.toggle('dark-theme');
  
  currentTheme = body.classList.contains('dark-theme') ? 'dark' : 'light';
  
  // Сохраняем в localStorage
  setLocalStorage();
}

// Сохранение в localStorage
function setLocalStorage() {
  localStorage.setItem('lang', currentLang);
  localStorage.setItem('theme', currentTheme);
}

// Загрузка из localStorage
function getLocalStorage() {
  if (localStorage.getItem('lang')) {
    const lang = localStorage.getItem('lang');
    getTranslate(lang);
  }
  
  if (localStorage.getItem('theme')) {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    }
    currentTheme = theme;
  }
}

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
  // Обработчики для кнопок языка
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      getTranslate(this.dataset.lang);
      setLocalStorage();
    });
  });
  
  // Загрузка сохраненных настроек
  getLocalStorage();
});

document.getElementById('themeToggle').addEventListener('click', function() {
  toggleTheme();
});