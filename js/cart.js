const API_URL = 'http://localhost:3000';

async function fetchCartWithProducts() {
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return [];

    const [cartResponse, productsResponse] = await Promise.all([
      fetch(`${API_URL}/cart?userId=${currentUser.id}`),
      fetch(`${API_URL}/products`)
    ]);
    
    const cartItems = await cartResponse.json();
    const products = await productsResponse.json();
    
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

async function getNextOrderId() {
  try {
    const response = await fetch(`${API_URL}/orders`);
    const orders = await response.json();
    
    if (orders.length === 0) return 1;
    
    const maxId = Math.max(...orders.map(order => parseInt(order.id) || 0));
    return maxId + 1;
  } catch (error) {
    console.error('Error getting next order ID:', error);
    return Date.now();
  }
}

async function renderCart() {
  const cartContainer = document.getElementById('cart-container');
  const emptyCartMessage = document.getElementById('empty-cart-message');
  const cartSummary = document.querySelector('.cart-summary');
  
  const cartItems = await fetchCartWithProducts();
  cartContainer.innerHTML = '';
  
  if (cartItems.length === 0 || cartItems.some(item => !item.product)) {
    emptyCartMessage.style.display = 'block';
    cartSummary.style.display = 'none';
    return;
  } else {
    emptyCartMessage.style.display = 'none';
    cartSummary.style.display = 'flex';
  }
  
  let totalPrice = 0;
  
  cartItems.forEach(item => {
    if (!item.product) return;
    
    const product = item.product;
    const price = parseFloat(product.price1 || product.price2 || 0);
    const itemTotal = price * item.quantity;
    totalPrice += itemTotal;
    
    const cartItemElement = document.createElement('div');
    cartItemElement.className = 'cart-item';
    cartItemElement.innerHTML = `
      <div class="cart-item-image">
        <img src="${product.image}" alt="${product.title1}">
      </div>
      <div class="cart-item-details">
        <h3>${product.title1}</h3> <!-- Убрал ${product.title2} так как его нет -->
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
  
  document.getElementById('total-price').textContent = `$${totalPrice.toFixed(2)}`;
  addEventListeners();
}

async function addEventListeners() {
  document.querySelectorAll('.remove-btn').forEach(button => {
    button.addEventListener('click', async (e) => {
      const itemId = e.target.getAttribute('data-id');
      await removeFromCart(itemId);
      await renderCart();
    });
  });
  
  document.querySelectorAll('.minus').forEach(button => {
    button.addEventListener('click', async (e) => {
      const itemId = e.target.getAttribute('data-id');
      await updateQuantity(itemId, -1);
      await renderCart();
    });
  });
  
  document.querySelectorAll('.plus').forEach(button => {
    button.addEventListener('click', async (e) => {
      const itemId = e.target.getAttribute('data-id');
      await updateQuantity(itemId, 1);
      await renderCart();
    });
  });
  
  document.getElementById('checkout-button').addEventListener('click', checkout);
}

async function removeFromCart(itemId) {
  try {
    await fetch(`${API_URL}/cart/${itemId}`, { method: 'DELETE' });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    alert('Failed to remove item from cart');
  }
}

async function updateQuantity(itemId, change) {
  try {
    const response = await fetch(`${API_URL}/cart/${itemId}`);
    const item = await response.json();
    const newQuantity = item.quantity + change;
    
    if (newQuantity <= 0) {
      await removeFromCart(itemId);
    } else {
      await fetch(`${API_URL}/cart/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity })
      });
    }
  } catch (error) {
    console.error('Error updating quantity:', error);
    alert('Failed to update quantity');
  }
}

async function createOrder(cartItems) {
  try {
    console.log('Creating order with items:', cartItems);
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
      throw new Error('User not logged in');
    }
    
    const orderId = await getNextOrderId();
    
    // Рассчитываем общую сумму
    const totalAmount = cartItems.reduce((total, item) => {
      const price = parseFloat(item.product.price1 || item.product.price2 || 0);
      return total + (price * item.quantity);
    }, 0);
    
    const order = {
      id: orderId.toString(),
      userId: currentUser.id,
      items: cartItems.map(item => {
        const price = parseFloat(item.product.price1 || item.product.price2 || 0);
        return {
          productId: parseInt(item.productId),
          productName: item.product.title1 || 'Unnamed Product',
          quantity: item.quantity,
          price: price,
          image: item.product.image // добавляем изображение для истории заказов
        };
      }),
      totalAmount: totalAmount,
      createdAt: new Date().toISOString(),
      status: 'completed'
    };

    console.log('Order to be created:', order);

    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(order)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Order creation failed:', response.status, errorText);
      throw new Error(`Failed to create order: ${errorText}`);
    }

    const createdOrder = await response.json();
    console.log('Order created successfully:', createdOrder);
    return createdOrder;
    
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

async function clearCart() {
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
      console.log('No user logged in');
      return;
    }

    console.log('Clearing cart for user:', currentUser.id);
    
    // Получаем все элементы корзины пользователя
    const response = await fetch(`${API_URL}/cart?userId=${currentUser.id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch cart: ${response.status}`);
    }
    
    const cartItems = await response.json();
    console.log('Found cart items:', cartItems);

    // Удаляем каждый элемент корзины
    for (const item of cartItems) {
      try {
        console.log('Deleting item:', item.id);
        const deleteResponse = await fetch(`${API_URL}/cart/${item.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!deleteResponse.ok) {
          console.error(`Failed to delete item ${item.id}:`, deleteResponse.status);
          // Продолжаем удаление других элементов даже если один не удалился
          continue;
        }

        console.log(`Item ${item.id} deleted successfully`);

      } catch (error) {
        console.error(`Error deleting item ${item.id}:`, error);
        // Продолжаем удаление других элементов
      }
    }

    console.log('Cart clearing process completed');
    
  } catch (error) {
    console.error('Error in clearCart:', error);
    throw error;
  }
}

async function checkout() {
  try {
    console.log('=== START CHECKOUT PROCESS ===');
    
    const cartItems = await fetchCartWithProducts();
    console.log('Fetched cart items:', cartItems);
    
    const validCartItems = cartItems.filter(item => item.product);
    console.log('Valid cart items:', validCartItems);
    
    if (validCartItems.length === 0) {
      alert('Your cart is empty or contains invalid items');
      return;
    }

    // Создаем заказ
    console.log('Attempting to create order...');
    const order = await createOrder(validCartItems);
    console.log('Order created successfully:', order);

    // Очищаем корзину
    console.log('Clearing cart...');
    await clearCart();
    console.log('Cart cleared successfully');

    const totalAmount = validCartItems.reduce((total, item) => {
      const price = parseFloat(item.product.price1 || item.product.price2 || 0);
      return total + (price * item.quantity);
    }, 0);
    
    // Показываем уведомление о успешной покупке
    alert(`✅ Purchase successful!\n\nOrder ID: #${order.id}\nTotal: $${totalAmount.toFixed(2)}\nItems: ${validCartItems.length} product(s)\n\nThank you for your order!`);

    // Обновляем отображение корзины
    await renderCart();
    
    console.log('=== CHECKOUT COMPLETED SUCCESSFULLY ===');
    
  } catch (error) {
    console.error('Error during checkout:', error);
    alert('Failed to complete checkout. Please check console for details and try again.');
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) {
    alert('Please log in to view your cart');
    window.location.href = 'signin.html';
    return;
  }
  
  renderCart();
});