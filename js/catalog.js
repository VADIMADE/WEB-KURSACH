const products = [
  {
    id: 1,
    image: "../img/product1-img.png",
    title1: "Fresh Mint",
    title2: "Toothpaste",
    price1: "$30",
    price2: "$48",
    rating: "4.9",
    reviews: "10368",
    stars: "★★★★★",
    category: "Toothpaste"
  },
  {
    id: 2,
    image: "../img/product2-img.png",
    title1: "Mouthwash Bits",
    title2: "4-Month supply",
    price1: "$20",
    price2: "$24",
    rating: "5.0",
    reviews: "366",
    stars: "★★★★★",
    category: "Mouthwash"
  },
  {
    id: 3,
    image: "../img/product3-img.png",
    title1: "Whitening Gel",
    title2: "One vial • 28 applications",
    price2: "$24",
    rating: "5.0",
    reviews: "18",
    stars: "★★★★★",
    category: "Whitening"
  },
  {
    id: 4,
    image: "../img/product4-img.png",
    title1: "Dental Floss",
    title2: "Two-pack",
    price2: "$12",
    rating: "4.9",
    reviews: "257",
    stars: "★★★★★",
    category: "Floss"
  },
  {
    id: 5,
    image: "../img/product5-img.png",
    title1: "Bamboo Toothbrush",
    title2: "Two-pack",
    price2: "$12",
    rating: "4.9",
    reviews: "962",
    stars: "★★★★★",
    category: "Toothbrush"
  },
  {
    id: 6,
    image: "../img/product6-img.png",
    title1: "Daily Habits Kit",
    title2: "5-Piece Oral Care Set",
    price1: "$60",
    price2: "$84",
    rating: "4.9",
    reviews: "16144",
    stars: "★★★★★",
    category: "Kit"
  },
  {
    id: 7,
    image: "../img/product6-img.png",
    title1: "Fresh Mint",
    title2: "Toothpaste",
    price1: "$30",
    price2: "$48",
    rating: "4.9",
    reviews: "10368",
    stars: "★★★★★",
    category: "Toothpaste"
  },
  {
    id: 8,
    image: "../img/product5-img.png",
    title1: "Mouthwash Bits",
    title2: "4-Month supply",
    price1: "$20",
    price2: "$24",
    rating: "5.0",
    reviews: "366",
    stars: "★★★★★",
    category: "Mouthwash"
  },
  {
    id: 9,
    image: "../img/product4-img.png",
    title1: "Whitening Gel",
    title2: "One vial • 28 applications",
    price2: "$24",
    rating: "5.0",
    reviews: "18",
    stars: "★★★★★",
    category: "Whitening"
  },
  {
    id: 10,
    image: "../img/product3-img.png",
    title1: "Dental Floss",
    title2: "Two-pack",
    price2: "$12",
    rating: "4.9",
    reviews: "257",
    stars: "★★★★★",
    category: "Floss"
  },
  {
    id: 11,
    image: "../img/product2-img.png",
    title1: "Bamboo Toothbrush",
    title2: "Two-pack",
    price2: "$12",
    rating: "4.9",
    reviews: "962",
    stars: "★★★★★",
    category: "Toothbrush"
  }
];

// Функция для генерации HTML цены
function renderPrice(product) {
  if (product.price1 && product.price2) {
    return `
      <p class="products-price1">${product.price1}</p>
      <p class="products-price2">${product.price2}</p>
    `;
  } else {
    return `<p class="products-price2">${product.price2}</p>`;
  }
}

let currentPage = 1;
const productsPerPage = 6;
let currentProductList = [...products]; // текущий список, с которым работает пагинация

// Функция для генерации карточек
function renderProducts(productsToRender) {
  const container = document.querySelector('.products-container');
  const noProductsMessage = document.getElementById('no-products-message');
  const paginationNumbers = document.getElementById('pagination-numbers');

  currentProductList = productsToRender;

  const totalPages = Math.ceil(productsToRender.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const paginatedProducts = productsToRender.slice(startIndex, endIndex);

  container.innerHTML = '';
  paginationNumbers.innerHTML = '';

  // Сообщение если пусто
  if (productsToRender.length === 0) {
    noProductsMessage.style.display = 'flex';
    document.querySelector('.pagination-container').style.display = 'none';
    return;
  } else {
    noProductsMessage.style.display = 'none';
    document.querySelector('.pagination-container').style.display = 'flex';
  }


  // Отображаем товары
  paginatedProducts.forEach(product => {
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
      <p class="products-estimation-stars">${product.stars}</p>
      <div class="products-card-link-container">
        <a class="products-link" href="#!">ADD TO CART</a>
      </div>
    `;
    container.appendChild(card);
  });

  // Пагинация: кнопки
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.classList.add('pagination-number');
    if (i === currentPage) pageBtn.classList.add('active');
    pageBtn.textContent = i;
    pageBtn.addEventListener('click', () => {
      currentPage = i;
      renderProducts(currentProductList);
    });
    paginationNumbers.appendChild(pageBtn);
  }

  // Кнопки "влево/вправо"
  document.getElementById('prev-page').disabled = currentPage === 1;
  document.getElementById('next-page').disabled = currentPage === totalPages || totalPages === 0;
}

// Функция для преобразования цены в число
function parsePrice(priceStr) {
  return parseFloat(priceStr.replace('$', ''));
}

// Функция для фильтрации и сортировки продуктов
function filterAndSortProducts() {
  const searchInput = document.getElementById('search-input').value.toLowerCase();
  const sortValue = document.getElementById('sort-select').value;

  // Получаем выбранные чекбоксы
  const checkedCategories = Array.from(
    document.querySelectorAll('input[name="category"]:checked')
  ).map(checkbox => checkbox.value);
  
  let filteredProducts = [...products];
  
  // Поиск
  if (searchInput) {
    filteredProducts = filteredProducts.filter(product => 
      product.title1.toLowerCase().includes(searchInput) || 
      product.title2.toLowerCase().includes(searchInput));
  }  
  
  // Фильтруем по категориям ТОЛЬКО если есть выбранные чекбоксы
  if (checkedCategories.length > 0) {
    filteredProducts = filteredProducts.filter(product => 
      checkedCategories.includes(product.category)
    );
  }

  // Сортировка
  switch (sortValue) {
    case 'price-asc':
      filteredProducts.sort((a, b) => {
        const priceA = a.price1 ? parsePrice(a.price1) : parsePrice(a.price2);
        const priceB = b.price1 ? parsePrice(b.price1) : parsePrice(b.price2);
        return priceA - priceB;
      });
      break;
    case 'price-desc':
      filteredProducts.sort((a, b) => {
        const priceA = a.price1 ? parsePrice(a.price1) : parsePrice(a.price2);
        const priceB = b.price1 ? parsePrice(b.price1) : parsePrice(b.price2);
        return priceB - priceA;
      });
      break;
    case 'name-asc':
      filteredProducts.sort((a, b) => a.title1.localeCompare(b.title1));
      break;
    case 'name-desc':
      filteredProducts.sort((a, b) => b.title1.localeCompare(a.title1));
      break;
    case 'rating-asc':
      filteredProducts.sort((a, b) => parseFloat(a.rating) - parseFloat(b.rating));
      break;
    case 'rating-desc':
      filteredProducts.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
      break;
  }

  currentPage = 1;
  
  renderProducts(filteredProducts);
}

// Добавляем обработчики событий для чекбоксов
document.querySelectorAll('input[name="category"]').forEach(checkbox => {
  checkbox.addEventListener('change', filterAndSortProducts);
});

// Обработчики событий для фильтров
document.getElementById('search-input').addEventListener('input', filterAndSortProducts);
document.getElementById('sort-select').addEventListener('change', filterAndSortProducts);

// Обработчики для кнопок методов массивов
document.querySelectorAll('.array-methods-buttons button').forEach(button => {
  button.addEventListener('click', function() {
    const method = this.getAttribute('data-method');
    let processedProducts = [];
    
    switch (method) {
      case 'original':
        processedProducts = [...products];
        break;
      case 'map':
        processedProducts = products.map(product => {
          const price1 = product.price1 ? `$${parsePrice(product.price1) + 5}` : null;
          const price2 = `$${parsePrice(product.price2) + 5}`;
          return {...product, price1, price2};
        });
        break;
      case 'filter':
        processedProducts = products.filter(product => {
          const price = product.price1 ? parsePrice(product.price1) : parsePrice(product.price2);
          return price > 20;
        });
        break;
      case 'sort-price-asc':
        processedProducts = [...products].sort((a, b) => {
          const priceA = a.price1 ? parsePrice(a.price1) : parsePrice(a.price2);
          const priceB = b.price1 ? parsePrice(b.price1) : parsePrice(b.price2);
          return priceA - priceB;
        });
        break;
      case 'sort-price-desc':
        processedProducts = [...products].sort((a, b) => {
          const priceA = a.price1 ? parsePrice(a.price1) : parsePrice(a.price2);
          const priceB = b.price1 ? parsePrice(b.price1) : parsePrice(b.price2);
          return priceB - priceA;
        });
        break;
      case 'sort-rating-desc':
        processedProducts = [...products].sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
        break;
      case 'reduce':
        const totalValue = products.reduce((sum, product) => {
          const price = product.price1 ? parsePrice(product.price1) : parsePrice(product.price2);
          return sum + price;
        }, 0);
        alert(`Total value of all products: $${totalValue}`);
        return;
      case 'some':
        const hasFiveStar = products.some(product => product.rating === "5.0");
        alert(`Has 5-star products: ${hasFiveStar ? 'Yes' : 'No'}`);
        return;
      case 'every':
        const allHighRating = products.every(product => parseFloat(product.rating) >= 4.9);
        alert(`All products have 4.9+ rating: ${allHighRating ? 'Yes' : 'No'}`);
        return;
      case 'find':
        const whiteningProduct = products.find(product => product.title1.includes("Whitening"));
        processedProducts = whiteningProduct ? [whiteningProduct] : [];
        break;
    }

    // currentPage = 1;
    renderProducts(processedProducts);
  });
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  renderProducts(products);
});

document.getElementById('prev-page').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderProducts(currentProductList);
  }
});

document.getElementById('next-page').addEventListener('click', () => {
  const totalPages = Math.ceil(currentProductList.length / productsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderProducts(currentProductList);
  }
});