// Get user's current location
function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject('Geolocation is not supported by your browser');
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          reject('Unable to retrieve your location');
        }
      );
    }
  });
}

// Get events near user
async function getNearbyEvents() {
  try {
    const location = await getUserLocation();
    const response = await fetch(`${API_URL}/events/nearby`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(location)
    });
    
    const events = await response.json();
    return events;
  } catch (error) {
    console.error('Error getting nearby events:', error);
    return [];
  }
}

// Calculate distance between two coordinates (in km)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Display user location on dashboard
async function displayUserLocation() {
  const locationElement = document.getElementById('userLocation');
  if (locationElement) {
    try {
      const location = await getUserLocation();
      locationElement.innerHTML = `<i class="fas fa-map-marker-alt"></i> 📍 Lat: ${location.lat.toFixed(4)}, Lng: ${location.lng.toFixed(4)}`;
    } catch (error) {
      locationElement.innerHTML = `<i class="fas fa-map-marker-alt"></i> 📍 Location access denied`;
    }
  }
}