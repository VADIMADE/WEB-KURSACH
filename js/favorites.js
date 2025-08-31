const API_URL = 'http://localhost:3000';

function renderPrice(product) {
  // Если есть цена со скидкой (price1) и она меньше оригинальной (price2)
  if (product.price1 && product.price1 < product.price2) {
    return `
      <p class="products-price1">$${product.price1}</p>
      <p class="products-price2">$${product.price2}</p>
    `;
  } else {
    // Если нет скидки, показываем только оригинальную цену
    return `<p class="products-price2">$${product.price2}</p>`;
  }
}

function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  let stars = '★'.repeat(fullStars);
  if (hasHalfStar) stars += '½';
  stars += '☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0));
  return stars;
}

async function loadFavorites() {
  try {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
      showEmptyMessage('Please log in to view your favorites');
      return;
    }

    const favoritesResponse = await fetch(`${API_URL}/favorites?userId=${currentUser.id}&_sort=addedAt&_order=desc`);
    const favorites = await favoritesResponse.json();
    
    if (favorites.length === 0) {
      showEmptyMessage();
      return;
    }
    
    const productIds = favorites.map(fav => fav.productId.toString());
    const productsResponse = await fetch(`${API_URL}/products`);
    const allProducts = await productsResponse.json();
    
    const favoriteProducts = allProducts.filter(product => 
      productIds.includes(product.id)
    );
    
    renderFavorites(favoriteProducts, favorites);
    
  } catch (error) {
    console.error('Error loading favorites:', error);
    showEmptyMessage('Failed to load favorites. Please try again later.');
  }
}

function renderFavorites(products, favorites) {
  const container = document.getElementById('favorites-container');
  container.innerHTML = '';
  
  products.forEach(product => {
    const favoriteItem = favorites.find(fav => fav.productId.toString() === product.id);
    
    const card = document.createElement('div');
    card.className = 'products-card favorites-card';
    card.innerHTML = `
      <a href="#!"><img src="${product.image}" alt="${product.title1}"></a>
      <div class="products-card-description-container">
        <div class="products-card-desc-text-container">
          <p class="products-text1">${product.title1}</p>
          <p class="products-text2">${product.title2}</p>
        </div>
        <div class="products-card-desc-price-container">
          ${renderPrice(product)}
        </div>
      </div>
      <p class="products-estimation">Rated ${product.rating} out of 5</p>
      <p class="products-estimation">${product.reviews} Reviews</p>
      <p class="products-estimation-stars">${renderStars(product.stars)}</p>
      <div class="products-card-link-container">
        <button class="add-to-cart" data-id="${product.id}">ADD TO CART</button>
        <button class="remove-from-favorites" data-id="${product.id}" data-fav-id="${favoriteItem.id}">Remove</button>
      </div>
    `;
    container.appendChild(card);
  });
  
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', addToCart);
  });
  
  document.querySelectorAll('.remove-from-favorites').forEach(button => {
    button.addEventListener('click', removeFromFavorites);
  });
}

async function removeFromFavorites(event) {
  const favoriteId = event.target.getAttribute('data-fav-id');
  
  try {
    const response = await fetch(`${API_URL}/favorites/${favoriteId}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      loadFavorites();
    } else {
      alert('Failed to remove from favorites');
    }
  } catch (error) {
    console.error('Error removing from favorites:', error);
    alert('Failed to remove from favorites');
  }
}

async function addToCart(event) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) {
    alert('Please log in to add items to cart');
    window.location.href = 'signin.html';
    return;
  }

  const productId = event.target.getAttribute('data-id');
  
  try {
    const response = await fetch(`${API_URL}/cart?productId=${productId}&userId=${currentUser.id}`);
    const existingItems = await response.json();
    
    if (existingItems.length > 0) {
      await fetch(`${API_URL}/cart/${existingItems[0].id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quantity: existingItems[0].quantity + 1
        })
      });
    } else {
      await fetch(`${API_URL}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId,
          userId: currentUser.id,
          quantity: 1,
          addedAt: new Date().toISOString()
        })
      });
    }
    
    alert('Product added to cart!');
  } catch (error) {
    console.error('Error adding to cart:', error);
    alert('Failed to add product to cart');
  }
}

function showEmptyMessage(message = 'You have no favorite products yet.') {
  const container = document.getElementById('favorites-container');
  container.innerHTML = `
    <div class="favorites-empty">
      <p>${message}</p>
      <a href="catalog.html" class="back-to-catalog">Back to Catalog</a>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', function() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) {
    alert('Please log in to view your favorites');
    window.location.href = 'signin.html';
    return;
  }
  
  loadFavorites();
});