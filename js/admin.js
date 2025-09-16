const API_URL = 'http://localhost:3000';
let allProducts = [];
let allUsers = [];

document.addEventListener('DOMContentLoaded', function() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser || currentUser.role !== 'admin') {
      alert('Access denied. Admin privileges required.');
      window.location.href = 'index.html';
      return;
  }

  initializeAdminPanel();
});

async function initializeAdminPanel() {
  setupTabs();
  setupEventListeners();
  await loadProducts();
  await loadUsersForFilter();
  await loadFeedback();
  setupFormValidation();
}

function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');
    });
  });
}

function setupEventListeners() {
  document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
  document.getElementById('updateProduct').addEventListener('click', updateProduct);
  document.getElementById('deleteProduct').addEventListener('click', deleteProduct);
  document.getElementById('clearForm').addEventListener('click', clearForm);
  
  document.getElementById('filterProduct').addEventListener('change', loadFeedback);
  document.getElementById('filterUser').addEventListener('change', loadFeedback);
  
  document.getElementById('adminProductsList').addEventListener('click', function(e) {
      if (e.target.classList.contains('edit-btn')) {
          const productId = e.target.getAttribute('data-id');
          editProduct(productId);
      }
  });
  
  document.getElementById('feedbackList').addEventListener('click', function(e) {
      if (e.target.classList.contains('delete-feedback')) {
          const feedbackId = e.target.getAttribute('data-id');
          deleteFeedback(feedbackId);
      }
  });
  
  const inputs = document.querySelectorAll('#productForm input[required]');
  inputs.forEach(input => {
      let wasFocused = false;
      
      input.addEventListener('focus', () => {
          wasFocused = true;
      });
      
      input.addEventListener('input', () => {
          if (wasFocused) {
              validateForm();
          }
      });
      
      input.addEventListener('blur', () => {
          validateForm();
      });
  });
}

function setupFormValidation() {
  document.querySelectorAll('.error-message').forEach(el => {
      el.style.display = 'none';
  });
  document.querySelectorAll('.input-box').forEach(box => {
      box.classList.remove('error');
  });
}

function validateForm() {
  const title1 = document.getElementById('productTitle1').value.trim();
  const price2 = document.getElementById('productPrice2').value;
  const category = document.getElementById('productCategory').value.trim();
  const image = document.getElementById('productImage').value.trim();
  const rating = document.getElementById('productRating').value;
  const reviews = document.getElementById('productReviews').value;
  const stars = document.getElementById('productStars').value;
  
  const isTitleValid = title1.length >= 2;
  const isPrice2Valid = price2 && parseFloat(price2) > 0;
  const isCategoryValid = category.length >= 2;
  const isImageValid = image.length >= 5;
  const isRatingValid = rating && parseFloat(rating) >= 0 && parseFloat(rating) <= 5;
  const isReviewsValid = reviews && parseInt(reviews) >= 0;
  const isStarsValid = stars && parseInt(stars) >= 0 && parseInt(stars) <= 5;
  
  showError('title1Error', isTitleValid, 'Product name must be at least 2 characters');
  showError('price2Error', isPrice2Valid, 'Original price must be greater than 0');
  showError('categoryError', isCategoryValid, 'Category must be at least 2 characters');
  showError('imageError', isImageValid, 'Image URL is required');
  showError('ratingError', isRatingValid, 'Rating must be between 0 and 5');
  showError('reviewsError', isReviewsValid, 'Reviews count must be 0 or greater');
  showError('starsError', isStarsValid, 'Stars must be between 0 and 5');
  
  const isFormValid = isTitleValid && isPrice2Valid && isCategoryValid && 
                      isImageValid && isRatingValid && isReviewsValid && isStarsValid;
  const productId = document.getElementById('productId').value;
  
  document.getElementById('addProduct').disabled = !isFormValid || productId !== '';
  document.getElementById('updateProduct').disabled = !isFormValid || productId === '';
  document.getElementById('deleteProduct').disabled = productId === '';
}

function showError(elementId, isValid, message) {
    const errorElement = document.getElementById(elementId);
    const input = document.getElementById(elementId.replace('Error', ''));
    
    if (errorElement && input) {
        const shouldShowError = input.value.trim() !== '' || document.activeElement === input;
        
        errorElement.textContent = isValid ? '' : message;
        errorElement.style.display = (isValid || !shouldShowError) ? 'none' : 'block';
        
        const inputBox = input.closest('.input-box');
        if (inputBox) {
            inputBox.classList.toggle('error', !isValid && shouldShowError);
        }
    }
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        
        allProducts = await response.json();
        displayProducts(allProducts);
        updateProductFilter();
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('adminProductsList').innerHTML = '<p class="error">Error loading products</p>';
    }
}

function displayProducts(products) {
    const container = document.getElementById('adminProductsList');
    
    if (!products || products.length === 0) {
        container.innerHTML = '<p>No products found</p>';
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="product-item" data-id="${product.id}">
            <img src="${product.image}" alt="${product.title1}" width="60" height="60">
            <div class="product-info">
                <h3>${product.title1}</h3>
                <div class="prices">
                    ${product.price1 && product.price2 && product.price1 < product.price2 ? 
                        `<span class="discounted-price">$${product.price1}</span>
                         <span class="original-price">$${product.price2}</span>` :
                        `<span class="current-price">$${product.price2}</span>`
                    }
                </div>
                <p><strong>Category:</strong> ${product.category}</p>
                <p><strong>Rating:</strong> ${product.rating} (${product.reviews} reviews)</p>
            </div>
            <button class="edit-btn" data-id="${product.id}">Edit</button>
        </div>
    `).join('');
}

async function editProduct(productId) {
    try {
        const response = await fetch(`${API_URL}/products/${productId}`);
        if (!response.ok) throw new Error('Failed to fetch product');
        
        const product = await response.json();
        
        document.getElementById('productId').value = product.id;
        document.getElementById('productTitle1').value = product.title1 || '';
        document.getElementById('productPrice2').value = product.price2 || '';
        document.getElementById('productPrice1').value = product.price1 || '';
        document.getElementById('productCategory').value = product.category || '';
        document.getElementById('productImage').value = product.image || '';
        document.getElementById('productRating').value = product.rating || '';
        document.getElementById('productReviews').value = product.reviews || '';
        document.getElementById('productStars').value = product.stars || '';
        
        validateForm();
        
    } catch (error) {
        console.error('Error loading product:', error);
        alert('Error loading product data');
    }
}

async function handleProductSubmit(e) {
    e.preventDefault();
    
    if (document.getElementById('addProduct').disabled) return;
    
    const productData = {
        title1: document.getElementById('productTitle1').value.trim(),
        price2: parseFloat(document.getElementById('productPrice2').value),
        price1: document.getElementById('productPrice1').value ? parseFloat(document.getElementById('productPrice1').value) : null,
        category: document.getElementById('productCategory').value.trim(),
        image: document.getElementById('productImage').value.trim(),
        rating: parseFloat(document.getElementById('productRating').value),
        reviews: parseInt(document.getElementById('productReviews').value),
        stars: parseInt(document.getElementById('productStars').value)
    };
    
    try {
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        if (response.ok) {
            alert('Product added successfully!');
            clearForm();
            await loadProducts();
        } else {
            throw new Error('Failed to add product');
        }
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Error adding product');
    }
}

async function updateProduct() {
    if (document.getElementById('updateProduct').disabled) return;
    
    const productId = document.getElementById('productId').value;
    const productData = {
        title1: document.getElementById('productTitle1').value.trim(),
        price2: parseFloat(document.getElementById('productPrice2').value),
        price1: document.getElementById('productPrice1').value ? parseFloat(document.getElementById('productPrice1').value) : null,
        category: document.getElementById('productCategory').value.trim(),
        image: document.getElementById('productImage').value.trim(),
        rating: parseFloat(document.getElementById('productRating').value),
        reviews: parseInt(document.getElementById('productReviews').value),
        stars: parseInt(document.getElementById('productStars').value)
    };
    
    try {
        const response = await fetch(`${API_URL}/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });
        
        if (response.ok) {
            alert('Product updated successfully!');
            clearForm();
            await loadProducts();
        } else {
            throw new Error('Failed to update product');
        }
    } catch (error) {
        console.error('Error updating product:', error);
        alert('Error updating product');
    }
}

async function deleteProduct() {
    if (document.getElementById('deleteProduct').disabled) return;
    
    const productId = document.getElementById('productId').value;
    
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const response = await fetch(`${API_URL}/products/${productId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Product deleted successfully!');
            clearForm();
            await loadProducts();
        } else {
            throw new Error('Failed to delete product');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product');
    }
}

function clearForm() {
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
    document.querySelectorAll('.input-box').forEach(box => {
        box.classList.remove('error');
    });
    
    setupFormValidation();
}

async function loadUsersForFilter() {
    try {
        const response = await fetch(`${API_URL}/users`);
        if (!response.ok) throw new Error('Failed to fetch users');
        
        allUsers = await response.json();
        updateUserFilter();
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

function updateProductFilter() {
    const filter = document.getElementById('filterProduct');
    if (filter && allProducts) {
        filter.innerHTML = '<option value="">All Products</option>' + 
            allProducts.map(product => 
                `<option value="${product.id}">${product.title1}</option>`
            ).join('');
    }
}

function updateUserFilter() {
    const filter = document.getElementById('filterUser');
    if (filter && allUsers) {
        filter.innerHTML = '<option value="">All Users</option>' + 
            allUsers.map(user => 
                `<option value="${user.id}">${user.username || user.email}</option>`
            ).join('');
    }
}

async function loadFeedback() {
    const productFilter = document.getElementById('filterProduct').value;
    const userFilter = document.getElementById('filterUser').value;
    
    try {
        let url = `${API_URL}/feedback`;
        const params = new URLSearchParams();
        
        if (productFilter) params.append('productId', productFilter);
        if (userFilter) params.append('userId', userFilter);
        
        if (params.toString()) url += `?${params.toString()}`;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch feedback');
        
        const feedback = await response.json();
        displayFeedback(feedback);
    } catch (error) {
        console.error('Error loading feedback:', error);
        document.getElementById('feedbackList').innerHTML = '<p class="error">Error loading feedback</p>';
    }
}

function displayFeedback(feedback) {
    const container = document.getElementById('feedbackList');
    
    if (!feedback || feedback.length === 0) {
        container.innerHTML = '<p>No feedback found</p>';
        return;
    }
    
    container.innerHTML = feedback.map(item => `
        <div class="feedback-item">
            <div class="feedback-header">
                <h4>${getProductName(item.productId)}</h4>
                <button class="delete-feedback" data-id="${item.id}">Delete</button>
            </div>
            <p><strong>User:</strong> ${getUserName(item.userId)}</p>
            ${item.rating ? `<p><strong>Rating:</strong> ${item.rating}/5</p>` : ''}
            ${item.text ? `<p><strong>Comment:</strong> ${item.text}</p>` : ''}
            <p><small>Date: ${new Date(item.date || item.createdAt || Date.now()).toLocaleDateString()}</small></p>
        </div>
    `).join('');
}

async function deleteFeedback(feedbackId) {
    if (!confirm('Are you sure you want to delete this feedback?')) return;
    
    try {
        const response = await fetch(`${API_URL}/feedback/${feedbackId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Feedback deleted successfully!');
            await loadFeedback();
        } else {
            throw new Error('Failed to delete feedback');
        }
    } catch (error) {
        console.error('Error deleting feedback:', error);
        alert('Error deleting feedback');
    }
}

function getProductName(productId) {
    const product = allProducts.find(p => p.id == productId);
    return product ? product.title1 : 'Unknown Product';
}

function getUserName(userId) {
    const user = allUsers.find(u => u.id == userId);
    if (!user) return 'Unknown User';
    return user.username || user.email || `${user.firstName} ${user.lastName}`;
}