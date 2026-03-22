// Load all events
async function loadEvents() {
  try {
    const response = await fetch(`${API_URL}/events`);
    const events = await response.json();
    displayEvents(events);
  } catch (error) {
    console.error('Error loading events:', error);
    showToast('Failed to load events', 'error');
  }
}

// Display events
function displayEvents(events) {
  const container = document.getElementById('eventsContainer');
  if (!container) return;
  
  if (events.length === 0) {
    container.innerHTML = '<p style="text-align:center">No events available</p>';
    return;
  }
  
  container.innerHTML = events.map(event => `
    <div class="event-card" data-event-id="${event._id}">
      <img src="${event.imageUrl}" alt="${event.name}" class="event-image" onerror="this.src='https://via.placeholder.com/400x250/FF6B35/FFFFFF?text=Giri+Event'">
      <div class="event-content">
        <h3 class="event-title">${event.name}</h3>
        <div class="event-meta">
          <span><i class="fas fa-calendar"></i> ${new Date(event.date).toLocaleDateString()}</span>
          <span><i class="fas fa-clock"></i> ${event.time}</span>
          <span><i class="fas fa-map-marker-alt"></i> ${event.location.city || event.location.address}</span>
        </div>
        <div class="event-rating">
          ${generateStars(event.rating)}
          <span style="color: var(--text-light)">(${event.rating})</span>
        </div>
        <p class="event-description">${event.description.substring(0, 100)}...</p>
        <div class="event-price">$${event.price}</div>
        <div class="event-actions">
          <button class="btn-register" onclick="registerForEvent('${event._id}')">
            <i class="fas fa-ticket-alt"></i> Register
          </button>
          <button class="btn-details" onclick="showEventDetails('${event._id}')">
            <i class="fas fa-info-circle"></i> Details
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// Generate star rating
function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  let stars = '';
  
  for (let i = 0; i < fullStars; i++) {
    stars += '<i class="fas fa-star"></i>';
  }
  if (hasHalfStar) {
    stars += '<i class="fas fa-star-half-alt"></i>';
  }
  for (let i = stars.length / 2; i < 5; i++) {
    stars += '<i class="far fa-star"></i>';
  }
  
  return stars;
}

// Register for event
async function registerForEvent(eventId) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    showToast('Please login to register for events', 'warning');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/events/${eventId}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showToast('Successfully registered for event!', 'success');
    } else {
      showToast(data.message || 'Registration failed', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showToast('Network error. Please try again.', 'error');
  }
}

// Show event details modal
let currentEvent = null;

async function showEventDetails(eventId) {
  try {
    const response = await fetch(`${API_URL}/events/${eventId}`);
    const event = await response.json();
    currentEvent = event;
    
    const modal = document.getElementById('eventModal');
    const modalContent = document.getElementById('modalContent');
    
    modalContent.innerHTML = `
      <span class="close">&times;</span>
      <h2>${event.name}</h2>
      <img src="${event.imageUrl}" style="width:100%; height:300px; object-fit:cover; border-radius:10px; margin:1rem 0;" onerror="this.src='https://via.placeholder.com/400x250/FF6B35/FFFFFF?text=Giri+Event'">
      <p><strong>Organization:</strong> ${event.organization}</p>
      <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${event.time}</p>
      <p><strong>Location:</strong> ${event.location.address}</p>
      <p><strong>Price:</strong> $${event.price}</p>
      <p><strong>Rating:</strong> ${generateStars(event.rating)} (${event.rating})</p>
      <p><strong>Description:</strong></p>
      <p>${event.detailedDescription || event.description}</p>
      
      <div class="review-section">
        <h3>Add Your Review</h3>
        <textarea id="reviewText" class="review-input" rows="3" placeholder="Share your experience..."></textarea>
        <div class="rating-input" id="ratingInput">
          ${[1,2,3,4,5].map(star => `<i class="far fa-star" data-rating="${star}"></i>`).join('')}
        </div>
        <button class="auth-btn" onclick="submitReview('${event._id}')">Submit Review</button>
      </div>
      
      <div class="review-section">
        <h3>Reviews</h3>
        <div id="reviewsList">
          ${event.userReviews && event.userReviews.length > 0 ? 
            event.userReviews.map(review => `
              <div style="border-bottom:1px solid #e0e0e0; padding:1rem 0">
                <div>${generateStars(review.rating)}</div>
                <p>${review.review}</p>
                <small>${new Date(review.date).toLocaleDateString()}</small>
              </div>
            `).join('') : 
            '<p>No reviews yet. Be the first to review!</p>'
          }
        </div>
      </div>
    `;
    
    modal.style.display = 'block';
    
    // Setup rating stars
    document.querySelectorAll('#ratingInput i').forEach(star => {
      star.addEventListener('click', function() {
        const rating = this.dataset.rating;
        document.querySelectorAll('#ratingInput i').forEach(s => {
          s.classList.remove('fas');
          s.classList.add('far');
        });
        for (let i = 0; i < rating; i++) {
          document.querySelectorAll('#ratingInput i')[i].classList.remove('far');
          document.querySelectorAll('#ratingInput i')[i].classList.add('fas');
        }
        window.selectedRating = rating;
      });
    });
    
    // Close modal
    document.querySelector('.close').onclick = () => {
      modal.style.display = 'none';
    };
    
    window.onclick = (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    };
  } catch (error) {
    console.error('Error:', error);
    showToast('Failed to load event details', 'error');
  }
}

// Submit review
window.selectedRating = 5;

async function submitReview(eventId) {
  const token = localStorage.getItem('token');
  const review = document.getElementById('reviewText')?.value;
  const rating = window.selectedRating || 5;
  
  if (!token) {
    showToast('Please login to submit a review', 'warning');
    return;
  }
  
  if (!review) {
    showToast('Please enter a review', 'warning');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/events/${eventId}/review`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      },
      body: JSON.stringify({ review, rating })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showToast('Review submitted successfully!', 'success');
      document.getElementById('eventModal').style.display = 'none';
      loadEvents(); // Reload events to update rating
    } else {
      showToast(data.message || 'Failed to submit review', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showToast('Network error. Please try again.', 'error');
  }
}

// Seed events (admin function)
async function seedEvents() {
  try {
    const response = await fetch(`${API_URL}/events/seed/populate`, {
      method: 'POST'
    });
    const data = await response.json();
    
    if (response.ok) {
      showToast('Events seeded successfully!', 'success');
      loadEvents();
    } else {
      showToast('Failed to seed events', 'error');
    }
  } catch (error) {
    console.error('Error:', error);
    showToast('Network error', 'error');
  }
}

// Load events when dashboard loads
if (document.getElementById('eventsContainer')) {
  checkAuth();
  displayUserLocation();
  loadEvents();
}