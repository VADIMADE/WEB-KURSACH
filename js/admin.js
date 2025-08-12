const API_URL = 'http://localhost:3000';
let currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

document.addEventListener('DOMContentLoaded', async () => {
  // Проверка прав администратора
  if (!currentUser || currentUser.role !== 'admin') {
    window.location.href = 'index.html';
    return;
  }

  // Инициализация интерфейса
  initTabs();
  loadProducts();
  loadFeedback();

  // Обработчики для управления товарами
  document.getElementById('productForm').addEventListener('submit', saveProduct);
  document.getElementById('deleteProduct').addEventListener('click', deleteProduct);
  
  // Обработчики фильтров отзывов
  document.getElementById('filterProduct').addEventListener('change', loadFeedback);
  document.getElementById('filterUser').addEventListener('change', loadFeedback);
});

// Функции для работы с товарами
async function loadProducts() {
  const response = await fetch(`${API_URL}/products`);
  const products = await response.json();
  
  const container = document.getElementById('adminProductsList');
  container.innerHTML = products.map(product => `
    <div class="product-item" data-id="${product.id}">
      <span>${product.title1} - $${product.price2}</span>
      <button class="edit-btn">Edit</button>
    </div>
  `).join('');
}

async function saveProduct(e) {
  e.preventDefault();
  // Реализация сохранения товара
}

async function deleteProduct() {
  // Реализация удаления товара
}

// Функции для работы с отзывами
async function loadFeedback() {
  const productFilter = document.getElementById('filterProduct').value;
  const userFilter = document.getElementById('filterUser').value;
  
  let url = `${API_URL}/feedback`;
  if (productFilter || userFilter) {
    url += '?';
    if (productFilter) url += `productId=${productFilter}`;
    if (userFilter) url += `&userId=${userFilter}`;
  }
  
  const response = await fetch(url);
  const feedback = await response.json();
  
  // Отображение отзывов
  const container = document.getElementById('feedbackList');
  container.innerHTML = feedback.map(item => `
    <div class="feedback-item">
      <p>${item.text}</p>
      <button class="delete-feedback" data-id="${item.id}">Delete</button>
    </div>
  `).join('');
}

// Вспомогательные функции
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn, .tab-content').forEach(el => {
        el.classList.remove('active');
      });
      btn.classList.add('active');
      document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');
    });
  });
}