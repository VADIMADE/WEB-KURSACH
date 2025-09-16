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
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const orderId = await getNextOrderId();
    
    const order = {
      id: orderId.toString(),
      userId: currentUser.id,
      items: cartItems.filter(item => item.product).map(item => {
        const price = parseFloat(item.product.price1 || item.product.price2 || 0);
        return {
          productId: parseInt(item.productId),
          productName: item.product.title1 || 'Unnamed Product',
          quantity: item.quantity,
          price: price
        };
      }),
      createdAt: new Date().toISOString(),
      status: 'completed'
    };

    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });

    if (!response.ok) throw new Error('Failed to create order');
    return await response.json();
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

async function clearCart() {
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const response = await fetch(`${API_URL}/cart?userId=${currentUser.id}`);
    const cartItems = await response.json();
    
    for (const item of cartItems) {
      await fetch(`${API_URL}/cart/${item.id}`, {
        method: 'DELETE'
      });
    }
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
}

async function checkout() {
  try {
    const cartItems = await fetchCartWithProducts();
    const validCartItems = cartItems.filter(item => item.product);
    
    if (validCartItems.length === 0) {
      alert('Your cart is empty or contains invalid items');
      return;
    }

    await createOrder(validCartItems);

    await clearCart();

    const totalAmount = validCartItems.reduce((total, item) => {
      const price = parseFloat(item.product.price1 || item.product.price2 || 0);
      return total + (price * item.quantity);
    }, 0);
    
    alert(`✅ Purchase successful!\n\nTotal: $${totalAmount.toFixed(2)}\nItems: ${validCartItems.length} product(s)\n\nThank you for your order!`);

    renderCart();
    
  } catch (error) {
    console.error('Error during checkout:', error);
    alert('Failed to complete checkout. Please try again.');
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