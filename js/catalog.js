const API_URL = 'http://localhost:3000';
let currentPage = 1;
const productsPerPage = 6;
let currentProductList = [];
let totalProducts = 0;

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

// Функция для загрузки продуктов с сервера
async function fetchProducts(params = {}) {
  try {
    // Сначала получаем ВСЕ товары (для поиска и сортировки)
    let response = await fetch(`${API_URL}/products`);
    let allProducts = await response.json();
    
    // Фильтрация по категориям
    if (params.categories && params.categories.length > 0) {
      allProducts = allProducts.filter(product => 
        params.categories.includes(product.category)
      );
    }
    
    // Поиск на клиенте
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      allProducts = allProducts.filter(product => 
        product.title1.toLowerCase().includes(searchTerm) || 
        product.title2.toLowerCase().includes(searchTerm)
      );
    }
    
    // Сортировка на клиенте (более надежная)
    if (params.sortField) {
      allProducts.sort((a, b) => {
        let valA, valB;
        
        // Для цен берем price2 как основной
        if (params.sortField === 'price') {
          valA = parseFloat(a.price1 || a.price2 || 0);
          valB = parseFloat(b.price1 || b.price2 || 0);
        } 
        // Для рейтинга
        else if (params.sortField === 'rating') {
          valA = parseFloat(a.rating);
          valB = parseFloat(b.rating);
        }
        // Для названия
        else {
          valA = a[params.sortField]?.toLowerCase() || '';
          valB = b[params.sortField]?.toLowerCase() || '';
        }
        
        return params.sortOrder === 'asc' 
          ? valA > valB ? 1 : -1
          : valA < valB ? 1 : -1;
      });
    }
    
    // Обновляем общее количество
    totalProducts = allProducts.length;
    
    // Применяем пагинацию
    const startIndex = (currentPage - 1) * productsPerPage;
    return allProducts.slice(startIndex, startIndex + productsPerPage);
    
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

// Функция для генерации карточек товаров
function renderProducts(products) {
  const container = document.querySelector('.products-container');
  const noProductsMessage = document.getElementById('no-products-message');
  const paginationNumbers = document.getElementById('pagination-numbers');

  container.innerHTML = '';
  paginationNumbers.innerHTML = '';

  // Сообщение если пусто
  if (products.length === 0) {
    noProductsMessage.style.display = 'flex';
    document.querySelector('.pagination-container').style.display = 'none';
    return;
  } else {
    noProductsMessage.style.display = 'none';
    document.querySelector('.pagination-container').style.display = 'flex';
  }

  // Отображаем товары
  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'products-card';
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
        <button class="add-to-favorites" data-id="${product.id}">♥</button>
      </div>
    `;
    container.appendChild(card);
  });

  // Обновляем пагинацию
  updatePagination();
  
  // Добавляем обработчики событий для кнопок
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', addToCart);
  });
  
  document.querySelectorAll('.add-to-favorites').forEach(button => {
    button.addEventListener('click', addToFavorites);
  });
}

// Функция для обновления пагинации
function updatePagination() {
  const paginationNumbers = document.getElementById('pagination-numbers');
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  
  paginationNumbers.innerHTML = '';
  
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.classList.add('pagination-number');
    if (i === currentPage) pageBtn.classList.add('active');
    pageBtn.textContent = i;
    pageBtn.addEventListener('click', () => {
      currentPage = i;
      filterAndSortProducts();
    });
    paginationNumbers.appendChild(pageBtn);
  }

  // Кнопки "влево/вправо"
  document.getElementById('prev-page').disabled = currentPage === 1;
  document.getElementById('next-page').disabled = currentPage === totalPages || totalPages === 0;
}

// Функция для фильтрации и сортировки продуктов
async function filterAndSortProducts() {
  const searchInput = document.getElementById('search-input').value;
  const sortValue = document.getElementById('sort-select').value;
  const checkedCategories = Array.from(
    document.querySelectorAll('input[name="category"]:checked')
  ).map(checkbox => checkbox.value);

  // Параметры сортировки
  let sortField, sortOrder;
  switch (sortValue) {
    case 'price-asc':
      sortField = 'price';
      sortOrder = 'asc';
      break;
    case 'price-desc':
      sortField = 'price';
      sortOrder = 'desc';
      break;
    case 'name-asc':
      sortField = 'title1';
      sortOrder = 'asc';
      break;
    case 'name-desc':
      sortField = 'title1';
      sortOrder = 'desc';
      break;
    case 'rating-asc':
      sortField = 'rating';
      sortOrder = 'asc';
      break;
    case 'rating-desc':
      sortField = 'rating';
      sortOrder = 'desc';
      break;
    default:
      sortField = undefined;
  }

  const products = await fetchProducts({
    search: searchInput,
    categories: checkedCategories,
    sortField,
    sortOrder
  });
  
  renderProducts(products);
}

// Функция для добавления в корзину
// async function addToCart(event) {
//   const productId = parseInt(event.target.getAttribute('data-id'));
  
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

async function addToCart(event) {
  // Проверяем авторизацию
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
  if (!currentUser) {
    alert('Please log in to add items to cart');
    window.location.href = 'signin.html';
    return;
  }

  const productId = parseInt(event.target.getAttribute('data-id'));
  
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

// Функция для добавления в избранное
// async function addToFavorites(event) {
//   const productId = parseInt(event.target.getAttribute('data-id'));
  
//   try {
//     // Проверяем, есть ли уже этот товар в избранном
//     const response = await fetch(`${API_URL}/favorites?productId=${productId}`);
//     const existingItems = await response.json();
    
//     if (existingItems.length === 0) {
//       // Добавляем новый товар
//       await fetch(`${API_URL}/favorites`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           productId,
//           addedAt: new Date().toISOString()
//         })
//       });
      
//       alert('Product added to favorites!');
//     } else {
//       alert('Product is already in favorites!');
//     }
//   } catch (error) {
//     console.error('Error adding to favorites:', error);
//     alert('Failed to add product to favorites');
//   }
// }

async function addToFavorites(event) {
  // Проверяем авторизацию
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
  if (!currentUser) {
    alert('Please log in to add items to favorites');
    window.location.href = 'signin.html';
    return;
  }

  const productId = parseInt(event.target.getAttribute('data-id'));
  
  try {
    // Проверяем, есть ли уже этот товар в избранном у этого пользователя
    const response = await fetch(`${API_URL}/favorites?productId=${productId}&userId=${currentUser.id}`);
    const existingItems = await response.json();
    
    if (existingItems.length === 0) {
      // Добавляем новый товар
      await fetch(`${API_URL}/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId,
          userId: currentUser.id,
          addedAt: new Date().toISOString()
        })
      });
      
      alert('Product added to favorites!');
    } else {
      alert('Product is already in favorites!');
    }
  } catch (error) {
    console.error('Error adding to favorites:', error);
    alert('Failed to add product to favorites');
  }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
  // Загружаем продукты
  const products = await fetchProducts();
  currentProductList = products;
  renderProducts(products);
  
  // Обработчики событий для фильтров
  document.getElementById('search-input').addEventListener('input', () => {
    currentPage = 1;
    filterAndSortProducts();
  });
  
  document.getElementById('sort-select').addEventListener('change', () => {
    currentPage = 1;
    filterAndSortProducts();
  });

  // Обработчики для чекбоксов категорий
  document.querySelectorAll('input[name="category"]').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      currentPage = 1;
      filterAndSortProducts();
    });
  });

  // Обработчики для кнопок пагинации
  document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      filterAndSortProducts();
    }
  });

  document.getElementById('next-page').addEventListener('click', () => {
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      filterAndSortProducts();
    }
  });
});