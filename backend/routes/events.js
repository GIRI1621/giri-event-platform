const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get events near location
router.post('/nearby', async (req, res) => {
  try {
    const { lat, lng, maxDistance = 50000 } = req.body;
    const events = await Event.find();
    
    const eventsWithDistance = events.map(event => {
      if (event.location && event.location.coordinates) {
        const distance = Math.sqrt(
          Math.pow(event.location.coordinates.lat - lat, 2) + 
          Math.pow(event.location.coordinates.lng - lng, 2)
        ) * 111000;
        return { ...event.toObject(), distance };
      }
      return { ...event.toObject(), distance: Infinity };
    });
    
    const nearbyEvents = eventsWithDistance
      .filter(e => e.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);
    
    res.json(nearbyEvents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register for event
router.post('/:id/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.registeredUsers && event.registeredUsers.includes(req.user.userId)) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    if (!event.registeredUsers) {
      event.registeredUsers = [];
    }
    
    event.registeredUsers.push(req.user.userId);
    await event.save();

    res.json({ 
      success: true,
      message: 'Successfully registered for event!',
      event 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add review
router.post('/:id/review', auth, async (req, res) => {
  try {
    const { review, rating } = req.body;
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!event.userReviews) {
      event.userReviews = [];
    }

    event.userReviews.push({
      userId: req.user.userId,
      review,
      rating,
      date: new Date()
    });

    // Update average rating
    const totalRating = event.userReviews.reduce((sum, r) => sum + r.rating, 0);
    event.rating = totalRating / event.userReviews.length;
    
    await event.save();

    res.json({ 
      success: true,
      message: 'Review added successfully!',
      event 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Seed events
router.post('/seed/populate', async (req, res) => {
  try {
    // Clear existing events
    await Event.deleteMany({});
    
    const events = [
      {
        name: "Giri Tech Conference 2024",
        organization: "Giri Technologies",
        description: "Join the biggest tech conference with industry leaders, workshops, and networking opportunities.",
        detailedDescription: "Full-day event featuring keynote speeches from tech leaders, hands-on workshops, networking sessions, and career fair. Perfect for developers, entrepreneurs, and tech enthusiasts.",
        date: new Date('2024-12-15'),
        time: "09:00 AM - 06:00 PM",
        location: {
          address: "Convention Center, San Francisco, CA",
          city: "San Francisco",
          coordinates: { lat: 37.7749, lng: -122.4194 }
        },
        price: 99,
        rating: 4.8,
        imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400",
        category: "Tech"
      },
      {
        name: "Giri Summer Music Fest",
        organization: "Giri Entertainment",
        description: "Experience amazing live performances from top artists across multiple stages.",
        detailedDescription: "Three-day music festival featuring 50+ artists, food trucks, art installations, and camping grounds.",
        date: new Date('2024-07-20'),
        time: "12:00 PM - 11:00 PM",
        location: {
          address: "Central Park, New York, NY",
          city: "New York",
          coordinates: { lat: 40.7829, lng: -73.9654 }
        },
        price: 149,
        rating: 4.7,
        imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400",
        category: "Music"
      },
      {
        name: "Giri Food & Wine Expo",
        organization: "Giri Culinary Arts",
        description: "Taste exquisite wines and gourmet dishes from world-class chefs.",
        detailedDescription: "Sample cuisines from 100+ restaurants, attend cooking demonstrations, and participate in wine tasting sessions.",
        date: new Date('2024-09-10'),
        time: "11:00 AM - 08:00 PM",
        location: {
          address: "Exhibition Hall, Chicago, IL",
          city: "Chicago",
          coordinates: { lat: 41.8781, lng: -87.6298 }
        },
        price: 75,
        rating: 4.6,
        imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
        category: "Food"
      },
      {
        name: "Giri Marathon 2024",
        organization: "Giri Sports",
        description: "Annual charity marathon supporting local communities.",
        detailedDescription: "5K, 10K, and full marathon options available. All proceeds go to local charities.",
        date: new Date('2024-08-05'),
        time: "07:00 AM - 02:00 PM",
        location: {
          address: "Downtown, Boston, MA",
          city: "Boston",
          coordinates: { lat: 42.3601, lng: -71.0589 }
        },
        price: 45,
        rating: 4.5,
        imageUrl: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400",
        category: "Sports"
      },
      {
        name: "Giri Art Exhibition",
        organization: "Giri Art Gallery",
        description: "Showcasing contemporary artists from around the world.",
        detailedDescription: "Explore stunning artworks from emerging and established artists. Guided tours available.",
        date: new Date('2024-10-01'),
        time: "10:00 AM - 08:00 PM",
        location: {
          address: "Art District, Los Angeles, CA",
          city: "Los Angeles",
          coordinates: { lat: 34.0522, lng: -118.2437 }
        },
        price: 25,
        rating: 4.9,
        imageUrl: "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=400",
        category: "Art"
      },
      {
        name: "Giri Business Summit",
        organization: "Giri Business Network",
        description: "Connect with entrepreneurs and learn from successful business owners.",
        detailedDescription: "Two-day summit featuring panel discussions, workshops, and networking events.",
        date: new Date('2024-11-12'),
        time: "09:30 AM - 06:00 PM",
        location: {
          address: "Business Center, Dallas, TX",
          city: "Dallas",
          coordinates: { lat: 32.7767, lng: -96.7970 }
        },
        price: 199,
        rating: 4.7,
        imageUrl: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400",
        category: "Business"
      },
      {
        name: "Giri Coding Workshop",
        organization: "Giri Code Academy",
        description: "Learn modern web development technologies in this hands-on workshop.",
        detailedDescription: "Intensive full-day workshop covering React, Node.js, and MongoDB.",
        date: new Date('2024-12-05'),
        time: "09:00 AM - 05:00 PM",
        location: {
          address: "Tech Hub, Seattle, WA",
          city: "Seattle",
          coordinates: { lat: 47.6062, lng: -122.3321 }
        },
        price: 50,
        rating: 4.8,
        imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400",
        category: "Education"
      },
      {
        name: "Giri Jazz Night",
        organization: "Giri Jazz Club",
        description: "Evening of smooth jazz with renowned musicians.",
        detailedDescription: "Intimate evening with world-class jazz musicians. Includes dinner and drinks.",
        date: new Date('2024-09-25'),
        time: "08:00 PM - 11:00 PM",
        location: {
          address: "Jazz Lounge, New Orleans, LA",
          city: "New Orleans",
          coordinates: { lat: 29.9511, lng: -90.0715 }
        },
        price: 60,
        rating: 4.6,
        imageUrl: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=400",
        category: "Music"
      },
      {
        name: "Giri Yoga Retreat",
        organization: "Giri Wellness",
        description: "Rejuvenate your mind and body in this peaceful yoga retreat.",
        detailedDescription: "Weekend retreat focusing on yoga, meditation, and wellness.",
        date: new Date('2024-10-15'),
        time: "09:00 AM - 05:00 PM",
        location: {
          address: "Wellness Center, Denver, CO",
          city: "Denver",
          coordinates: { lat: 39.7392, lng: -104.9903 }
        },
        price: 299,
        rating: 4.9,
        imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400",
        category: "Sports"
      },
      {
        name: "Giri Film Festival",
        organization: "Giri Cinema",
        description: "Celebrating independent cinema from around the world.",
        detailedDescription: "Week-long festival featuring 50+ independent films, Q&A sessions with directors.",
        date: new Date('2024-11-05'),
        time: "10:00 AM - 10:00 PM",
        location: {
          address: "Cinema Complex, Austin, TX",
          city: "Austin",
          coordinates: { lat: 30.2672, lng: -97.7431 }
        },
        price: 120,
        rating: 4.7,
        imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400",
        category: "Entertainment"
      }
    ];
    
    await Event.insertMany(events);
    
    res.json({ 
      success: true, 
      message: '10 events seeded successfully!',
      count: events.length 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error seeding events: ' + error.message });
  }
});

module.exports = router;