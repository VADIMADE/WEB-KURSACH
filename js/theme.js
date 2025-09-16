let currentTheme = 'light';

function toggleTheme() {
  const body = document.body;
  const themeToggleBtn = document.getElementById('themeToggle');
  
  if (currentTheme === 'light') {

    body.setAttribute('data-theme', 'dark');
    currentTheme = 'dark';
    themeToggleBtn.setAttribute('aria-label', 'Switch to light theme');
  } else {
    body.removeAttribute('data-theme');
    currentTheme = 'light';
    themeToggleBtn.setAttribute('aria-label', 'Switch to dark theme');
  }

  setLocalStorage();

  updateThemeIcon();
}

function updateThemeIcon() {
  const themeIcon = document.querySelector('.theme-toggle img');
  if (currentTheme === 'dark') {
    themeIcon.src = '../img/header-theme-toggle.png'; 
  } else {
    themeIcon.src = '../img/header-theme-toggle.png';
  }
}

function setLocalStorage() {
  localStorage.setItem('theme', currentTheme);
}

function getLocalStorage() {
  if (localStorage.getItem('theme')) {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
      document.body.setAttribute('data-theme', 'dark');
      currentTheme = 'dark';
    } else {
      document.body.removeAttribute('data-theme');
      currentTheme = 'light';
    }
    
    updateThemeIcon();
  }
}

function detectSystemTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

function initTheme() {

  getLocalStorage();

  if (!localStorage.getItem('theme')) {
    const systemTheme = detectSystemTheme();
    if (systemTheme === 'dark') {
      document.body.setAttribute('data-theme', 'dark');
      currentTheme = 'dark';
    }
    setLocalStorage();
  }

  const themeToggleBtn = document.getElementById('themeToggle');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem('theme')) {
        if (e.matches) {
          document.body.setAttribute('data-theme', 'dark');
          currentTheme = 'dark';
        } else {
          document.body.removeAttribute('data-theme');
          currentTheme = 'light';
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', initTheme);