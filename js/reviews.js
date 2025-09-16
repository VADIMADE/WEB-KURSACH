const API_URL = 'http://localhost:3000';
const MIN_REVIEW_LENGTH = 20;

function isAdmin(user) {
  return user && user.role === 'admin';
}

async function getPurchasedProducts(userId) {
  try {
    const response = await fetch(`${API_URL}/orders?userId=${userId}`);
    const orders = await response.json();
    
    const purchasedProducts = new Set();
    
    orders.forEach(order => {
      if (order.status === 'completed') {
        order.items.forEach(item => {
          purchasedProducts.add(item.productId.toString());
        });
      }
    });
    
    return Array.from(purchasedProducts);
  } catch (error) {
    console.error('Error fetching purchased products:', error);
    return [];
  }
}

async function getAllProducts() {
  try {
    const response = await fetch(`${API_URL}/products`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

async function createReviewForm() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const formContainer = document.getElementById('reviews-form-container');
  
  if (!currentUser) {
    formContainer.innerHTML = `
      <div class="admin-message">
        Please <a href="signin.html">sign in</a> to leave a review.
      </div>
    `;
    return;
  }
  
  if (isAdmin(currentUser)) {
    formContainer.innerHTML = `
      <div class="admin-message">
        Administrators cannot leave reviews.
      </div>
    `;
    return;
  }
  
  const [purchasedProductIds, allProducts] = await Promise.all([
    getPurchasedProducts(currentUser.id),
    getAllProducts()
  ]);
  
  const purchasedProducts = allProducts.filter(product => 
    purchasedProductIds.includes(product.id.toString())
  );
  
  if (purchasedProducts.length === 0) {
    formContainer.innerHTML = `
      <div class="admin-message">
        You need to purchase at least one product before leaving a review.
      </div>
    `;
    return;
  }
  
  formContainer.innerHTML = `
    <form class="reviews-form" id="review-form">
      <h2>Write a Review</h2>
      
      <div class="form-group">
        <label for="product-select">Select Product *</label>
        <select id="product-select" required>
          <option value="">Choose a product...</option>
          ${purchasedProducts.map(product => 
            `<option value="${product.id}">${product.title1}</option>`
          ).join('')}
        </select>
        <div class="error-message" id="product-error">Please select a product</div>
      </div>
      
      <div class="form-group">
        <label for="rating-select">Rating *</label>
        <select id="rating-select" required>
          <option value="">Choose a rating...</option>
          <option value="5">★★★★★ (5 stars)</option>
          <option value="4">★★★★☆ (4 stars)</option>
          <option value="3">★★★☆☆ (3 stars)</option>
          <option value="2">★★☆☆☆ (2 stars)</option>
          <option value="1">★☆☆☆☆ (1 star)</option>
        </select>
        <div class="error-message" id="rating-error">Please select a rating</div>
      </div>
      
      <div class="form-group">
        <label for="review-text">Your Review *</label>
        <textarea id="review-text" placeholder="Share your experience with this product..." required></textarea>
        <div class="char-count" id="char-count">0 characters (minimum ${MIN_REVIEW_LENGTH})</div>
        <div class="error-message" id="review-error">Review must be at least ${MIN_REVIEW_LENGTH} characters long</div>
      </div>
      
      <button type="submit" class="submit-btn" id="submit-btn" disabled>Submit Review</button>
    </form>
  `;
  
  setupFormEventListeners();
}

function setupFormEventListeners() {
  const reviewText = document.getElementById('review-text');
  const charCount = document.getElementById('char-count');
  const submitBtn = document.getElementById('submit-btn');
  
  if (reviewText && charCount) {
    reviewText.addEventListener('input', updateCharCount);
  }
  
  if (document.getElementById('review-form')) {
    document.getElementById('review-form').addEventListener('input', validateForm);
    document.getElementById('review-form').addEventListener('submit', handleSubmit);
  }
}

function updateCharCount() {
  const reviewText = document.getElementById('review-text');
  const charCount = document.getElementById('char-count');
  
  if (reviewText && charCount) {
    const length = reviewText.value.length;
    charCount.textContent = `${length} characters (minimum ${MIN_REVIEW_LENGTH})`;
    
    if (length < MIN_REVIEW_LENGTH) {
      charCount.classList.add('error');
    } else {
      charCount.classList.remove('error');
    }
  }
}

function validateForm() {
  const productSelect = document.getElementById('product-select');
  const ratingSelect = document.getElementById('rating-select');
  const reviewText = document.getElementById('review-text');
  const submitBtn = document.getElementById('submit-btn');
  
  if (!productSelect || !ratingSelect || !reviewText || !submitBtn) return;
  
  const isProductSelected = productSelect.value !== '';
  const isRatingSelected = ratingSelect.value !== '';
  const isReviewValid = reviewText.value.length >= MIN_REVIEW_LENGTH;
  
  submitBtn.disabled = !(isProductSelected && isRatingSelected && isReviewValid);
}

async function handleSubmit(event) {
  event.preventDefault();
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const productId = document.getElementById('product-select').value;
  const rating = document.getElementById('rating-select').value;
  const reviewText = document.getElementById('review-text').value;
  
  try {
    const response = await fetch(`${API_URL}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: currentUser.id,
        productId: parseInt(productId),
        rating: parseInt(rating),
        text: reviewText,
        createdAt: new Date().toISOString(),
        author: `${currentUser.firstName} ${currentUser.lastName}`
      })
    });
    
    if (response.ok) {
      alert('Thank you for your review!');
      document.getElementById('review-form').reset();
      updateCharCount();
      validateForm();
      loadReviews();
    } else {
      throw new Error('Failed to submit review');
    }
  } catch (error) {
    console.error('Error submitting review:', error);
    alert('Failed to submit review. Please try again.');
  }
}

async function loadReviews() {
  try {
    const response = await fetch(`${API_URL}/feedback`);
    const reviews = await response.json();
    
    const reviewsList = document.getElementById('reviews-list');
    
    if (reviews.length === 0) {
      reviewsList.innerHTML = '<div class="no-reviews">No reviews yet. Be the first to leave a review!</div>';
      return;
    }
    
    const productsResponse = await fetch(`${API_URL}/products`);
    const products = await productsResponse.json();
    
    reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    reviewsList.innerHTML = reviews.map(review => {
      const product = products.find(p => p.id == review.productId);
      const productName = product ? product.title1 : 'Unknown Product';
      const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
      const date = new Date(review.createdAt).toLocaleDateString();
      
      return `
        <div class="review-card">
          <div class="review-header">
            <div class="review-product">${productName}</div>
            <div class="review-rating">${stars}</div>
          </div>
          <div class="review-text">${review.text}</div>
          <div class="review-footer">
            <div class="review-author">By ${review.author || 'Anonymous'}</div>
            <div class="review-date">${date}</div>
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading reviews:', error);
    document.getElementById('reviews-list').innerHTML = 
      '<div class="no-reviews">Error loading reviews. Please try again later.</div>';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  createReviewForm();
  loadReviews();
});