const API_URL = 'http://localhost:3000';

// Функция для загрузки корзины и продуктов
// async function fetchCartWithProducts() {
//   try {
//     // Получаем корзину и продукты отдельно
//     const [cartResponse, productsResponse] = await Promise.all([
//       fetch(`${API_URL}/cart`),
//       fetch(`${API_URL}/products`)
//     ]);
    
//     const cartItems = await cartResponse.json();
//     const products = await productsResponse.json();
    
//     // Сопоставляем продукты с элементами корзины
//     return cartItems.map(item => {
//       const product = products.find(p => p.id == item.productId);
//       return {
//         ...item,
//         product: product || null
//       };
//     });
//   } catch (error) {
//     console.error('Error fetching cart:', error);
//     return [];
//   }
// }

// Функция для загрузки корзины и продуктов
async function fetchCartWithProducts() {
  try {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) return [];

    // Получаем корзину и продукты отдельно
    const [cartResponse, productsResponse] = await Promise.all([
      fetch(`${API_URL}/cart?userId=${currentUser.id}`),
      fetch(`${API_URL}/products`)
    ]);
    
    const cartItems = await cartResponse.json();
    const products = await productsResponse.json();
    
    // Сопоставляем продукты с элементами корзины
    return cartItems.map(item => {
      const product = products.find(p => p.id == item.productId);
      return {
        ...item,
        product: product || null
      };
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return [];
  }
}

// Функция для отображения товаров в корзине
async function renderCart() {
  const cartContainer = document.getElementById('cart-container');
  const emptyCartMessage = document.getElementById('empty-cart-message');
  const cartSummary = document.querySelector('.cart-summary');
  const successMessage = document.getElementById('success-message');
  
  // Скрываем сообщение об успехе по умолчанию
  successMessage.style.display = 'none';
  
  const cartItems = await fetchCartWithProducts();
  
  // Очищаем контейнер
  cartContainer.innerHTML = '';
  
  // Проверяем, пуста ли корзина
  if (cartItems.length === 0 || cartItems.some(item => !item.product)) {
    emptyCartMessage.style.display = 'block';
    cartSummary.style.display = 'none';
    return;
  } else {
    emptyCartMessage.style.display = 'none';
    cartSummary.style.display = 'flex';
  }
  
  // Отображаем каждый товар
  let totalPrice = 0;
  
  cartItems.forEach(item => {
    if (!item.product) return;
    
    const product = item.product;
    // Используем price2, если есть, иначе price1, иначе 0
    const price = parseFloat(product.price2 || product.price1 || 0);
    const itemTotal = price * item.quantity;
    totalPrice += itemTotal;
    
    const cartItemElement = document.createElement('div');
    cartItemElement.className = 'cart-item';
    cartItemElement.innerHTML = `
      <div class="cart-item-image">
        <img src="${product.image}" alt="${product.title1}">
      </div>
      <div class="cart-item-details">
        <h3>${product.title1} ${product.title2}</h3>
        <p class="cart-item-price">$${price.toFixed(2)}</p>
      </div>
      <div class="cart-item-quantity">
        <button class="quantity-btn minus" data-id="${item.id}">-</button>
        <span class="quantity">${item.quantity}</span>
        <button class="quantity-btn plus" data-id="${item.id}">+</button>
      </div>
      <div class="cart-item-total">
        <p>$${itemTotal.toFixed(2)}</p>
      </div>
      <div class="cart-item-remove">
        <button class="remove-btn" data-id="${item.id}">×</button>
      </div>
    `;
    
    cartContainer.appendChild(cartItemElement);
  });
  
  // Обновляем итоговую сумму
  document.getElementById('total-price').textContent = `$${totalPrice.toFixed(2)}`;
  
  // Добавляем обработчики событий
  addEventListeners();
}

// Остальные функции остаются без изменений
async function addEventListeners() {
  // Удаление товара
  document.querySelectorAll('.remove-btn').forEach(button => {
    button.addEventListener('click', async (e) => {
      const itemId = e.target.getAttribute('data-id');
      await removeFromCart(itemId);
      await renderCart();
    });
  });
  
  // Уменьшение количества
  document.querySelectorAll('.minus').forEach(button => {
    button.addEventListener('click', async (e) => {
      const itemId = e.target.getAttribute('data-id');
      await updateQuantity(itemId, -1);
      await renderCart();
    });
  });
  
  // Увеличение количества
  document.querySelectorAll('.plus').forEach(button => {
    button.addEventListener('click', async (e) => {
      const itemId = e.target.getAttribute('data-id');
      await updateQuantity(itemId, 1);
      await renderCart();
    });
  });
  
  // Оформление заказа
  document.getElementById('checkout-button').addEventListener('click', checkout);
}

async function removeFromCart(itemId) {
  try {
    await fetch(`${API_URL}/cart/${itemId}`, {
      method: 'DELETE'
    });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    alert('Failed to remove item from cart');
  }
}

async function updateQuantity(itemId, change) {
  try {
    // Получаем текущий элемент корзины
    const response = await fetch(`${API_URL}/cart/${itemId}`);
    const item = await response.json();
    
    const newQuantity = item.quantity + change;
    
    if (newQuantity <= 0) {
      // Если количество стало 0 или меньше, удаляем товар
      await removeFromCart(itemId);
    } else {
      // Обновляем количество
      await fetch(`${API_URL}/cart/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quantity: newQuantity
        })
      });
    }
  } catch (error) {
    console.error('Error updating quantity:', error);
    alert('Failed to update quantity');
  }
}

async function checkout() {
  try {
    // Очищаем корзину
    const cartItems = await fetchCartWithProducts();
    for (const item of cartItems) {
      await removeFromCart(item.id);
    }
    
    // Показываем сообщение об успехе
    document.getElementById('cart-container').style.display = 'none';
    document.querySelector('.cart-summary').style.display = 'none';
    document.getElementById('success-message').style.display = 'block';
    
  } catch (error) {
    console.error('Error during checkout:', error);
    alert('Failed to complete checkout');
  }
}

// Инициализация при загрузке страницы
// document.addEventListener('DOMContentLoaded', async () => {
//   await renderCart();
// });

// Проверка авторизации при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
  if (!currentUser) {
    alert('Please log in to view your cart');
    window.location.href = 'signin.html';
    return;
  }
  
  // Инициализация корзины
  renderCart();
});