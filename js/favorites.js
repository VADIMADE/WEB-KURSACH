const API_URL = 'http://localhost:3000';

// Функция для генерации HTML цены
function renderPrice(product) {
  const price1 = product.price1 ? `<p class="products-price1">$${product.price1}</p>` : '';
  const price2 = `<p class="products-price2">$${product.price2}</p>`;
  return price1 + price2;
}

// Функция для генерации звездного рейтинга
function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  let stars = '★'.repeat(fullStars);
  if (hasHalfStar) stars += '½';
  stars += '☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0));
  return stars;
}

// Функция для загрузки избранных товаров
// async function loadFavorites() {
//   try {
//     // Получаем все записи из избранного
//     const favoritesResponse = await fetch(`${API_URL}/favorites?_sort=addedAt&_order=desc`);
//     const favorites = await favoritesResponse.json();
    
//     if (favorites.length === 0) {
//       showEmptyMessage();
//       return;
//     }
    
//     // Получаем ID всех товаров в избранном (как строки, так как в products id - строки)
//     const productIds = favorites.map(fav => fav.productId.toString());
    
//     // Загружаем полную информацию о товарах
//     const productsResponse = await fetch(`${API_URL}/products`);
//     const allProducts = await productsResponse.json();
    
//     // Фильтруем только те товары, которые есть в избранном
//     const favoriteProducts = allProducts.filter(product => 
//       productIds.includes(product.id)
//     );
    
//     // Отображаем товары
//     renderFavorites(favoriteProducts, favorites);
    
//   } catch (error) {
//     console.error('Error loading favorites:', error);
//     showEmptyMessage('Failed to load favorites. Please try again later.');
//   }
// }

// Функция для загрузки избранных товаров
async function loadFavorites() {
  try {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
      showEmptyMessage('Please log in to view your favorites');
      return;
    }

    // Получаем все записи из избранного для текущего пользователя
    const favoritesResponse = await fetch(`${API_URL}/favorites?userId=${currentUser.id}&_sort=addedAt&_order=desc`);
    const favorites = await favoritesResponse.json();
    
    if (favorites.length === 0) {
      showEmptyMessage();
      return;
    }
    
    // Получаем ID всех товаров в избранном
    const productIds = favorites.map(fav => fav.productId.toString());
    
    // Загружаем полную информацию о товарах
    const productsResponse = await fetch(`${API_URL}/products`);
    const allProducts = await productsResponse.json();
    
    // Фильтруем только те товары, которые есть в избранном
    const favoriteProducts = allProducts.filter(product => 
      productIds.includes(product.id)
    );
    
    // Отображаем товары
    renderFavorites(favoriteProducts, favorites);
    
  } catch (error) {
    console.error('Error loading favorites:', error);
    showEmptyMessage('Failed to load favorites. Please try again later.');
  }
}

// Функция для отображения избранных товаров
function renderFavorites(products, favorites) {
  const container = document.getElementById('favorites-container');
  container.innerHTML = '';
  
  products.forEach(product => {
    const favoriteItem = favorites.find(fav => fav.productId.toString() === product.id);
    
    const card = document.createElement('div');
    card.className = 'products-card favorites-card';
    card.innerHTML = `
      <a href="#!"><img src="${product.image}" alt="image"></a>
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
  
  // Добавляем обработчики событий для кнопок
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', addToCart);
  });
  
  document.querySelectorAll('.remove-from-favorites').forEach(button => {
    button.addEventListener('click', removeFromFavorites);
  });
}

// Функция для удаления товара из избранного
// async function removeFromFavorites(event) {
//   const favoriteId = event.target.getAttribute('data-fav-id');
  
//   try {
//     const response = await fetch(`${API_URL}/favorites/${favoriteId}`, {
//       method: 'DELETE'
//     });
    
//     if (response.ok) {
//       // Перезагружаем список избранных
//       loadFavorites();
//     } else {
//       alert('Failed to remove from favorites');
//     }
//   } catch (error) {
//     console.error('Error removing from favorites:', error);
//     alert('Failed to remove from favorites');
//   }
// }

// Функция для удаления товара из избранного
async function removeFromFavorites(event) {
  const favoriteId = event.target.getAttribute('data-fav-id');
  
  try {
    const response = await fetch(`${API_URL}/favorites/${favoriteId}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      // Перезагружаем список избранных
      loadFavorites();
    } else {
      alert('Failed to remove from favorites');
    }
  } catch (error) {
    console.error('Error removing from favorites:', error);
    alert('Failed to remove from favorites');
  }
}

// Функция для добавления в корзину
// async function addToCart(event) {
//   const productId = event.target.getAttribute('data-id');
  
//   try {
//     // Проверяем, есть ли уже этот товар в корзине
//     const response = await fetch(`${API_URL}/cart?productId=${productId}`);
//     const existingItems = await response.json();
    
//     if (existingItems.length > 0) {
//       // Увеличиваем количество
//       await fetch(`${API_URL}/cart/${existingItems[0].id}`, {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           quantity: existingItems[0].quantity + 1
//         })
//       });
//     } else {
//       // Добавляем новый товар
//       await fetch(`${API_URL}/cart`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           productId,
//           quantity: 1,
//           addedAt: new Date().toISOString()
//         })
//       });
//     }
    
//     alert('Product added to cart!');
//   } catch (error) {
//     console.error('Error adding to cart:', error);
//     alert('Failed to add product to cart');
//   }
// }

// Функция для добавления в корзину
async function addToCart(event) {
  // Проверяем авторизацию
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
  if (!currentUser) {
    alert('Please log in to add items to cart');
    window.location.href = 'signin.html';
    return;
  }

  const productId = event.target.getAttribute('data-id');
  
  try {
    // Проверяем, есть ли уже этот товар в корзине у этого пользователя
    const response = await fetch(`${API_URL}/cart?productId=${productId}&userId=${currentUser.id}`);
    const existingItems = await response.json();
    
    if (existingItems.length > 0) {
      // Увеличиваем количество
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
      // Добавляем новый товар
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

// Функция для отображения сообщения, когда избранное пусто
function showEmptyMessage(message = 'You have no favorite products yet.') {
  const container = document.getElementById('favorites-container');
  container.innerHTML = `
    <div class="favorites-empty">
      <p>${message}</p>
      <a href="catalog.html" class="back-to-catalog">Back to Catalog</a>
    </div>
  `;
}

// Инициализация при загрузке страницы
// document.addEventListener('DOMContentLoaded', () => {
//   loadFavorites();
// });

// Проверка авторизации при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
  if (!currentUser) {
    alert('Please log in to view your favorites');
    window.location.href = 'signin.html';
    return;
  }
  
  // Инициализация избранного
  loadFavorites();
});