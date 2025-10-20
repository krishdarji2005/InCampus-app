const Event = require('../models/eventModel');
const User = require('../models/userModel');

// Create a new event
const createEvent = async (req, res) => {
  try {
    console.log('Creating event with data:', req.body);
    
    const { title, description, date, venue, category, author, authorId, status, registrationCount, image } = req.body;
    
    // Validate required fields
    if (!title || !description || !date || !venue || !category || !author) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields',
        required: ['title', 'description', 'date', 'venue', 'category', 'author'],
        received: { title, description, date, venue, category, author }
      });
    }
    
    // Validate date
    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format',
        receivedDate: date
      });
    }
    
    // Create new event
    const newEvent = new Event({
      title,
      description,
      date: eventDate,
      venue,
      category,
      author,
      authorId: authorId || null,
      status: status || 'active',
      registrationCount: registrationCount || 0,
      image: image || '',
      registeredUsers: []
    });
    
    const savedEvent = await newEvent.save();
    console.log('Event saved successfully:', savedEvent);
    
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: savedEvent
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create event',
      error: error.message 
    });
  }
};

// Get all events
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: 'active' })
      .populate('authorId', 'name email')
      .sort({ date: 1 });
    
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch events',
      error: error.message 
    });
  }
};

// Get event by ID
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('authorId', 'name email')
      .populate('registeredUsers', 'name email');
    
    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch event',
      error: error.message 
    });
  }
};

// Register for event
const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;
    
    console.log('Registering user:', userId, 'for event:', eventId);
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found' 
      });
    }
    
    if (event.registeredUsers.includes(userId)) {
      return res.status(400).json({ 
        success: false,
        message: 'User already registered for this event' 
      });
    }
    
    event.registeredUsers.push(userId);
    event.registrationCount = event.registeredUsers.length;
    await event.save();
    
    await User.findByIdAndUpdate(userId, {
      $push: { registeredEvents: eventId }
    });
    
    res.status(200).json({ 
      success: true,
      message: 'Successfully registered for event',
      registrationCount: event.registrationCount
    });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to register for event',
      error: error.message 
    });
  }
};

// Cancel registration
const cancelRegistration = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false,
        message: 'Event not found' 
      });
    }
    
    event.registeredUsers = event.registeredUsers.filter(id => id.toString() !== userId);
    event.registrationCount = event.registeredUsers.length;
    await event.save();
    
    await User.findByIdAndUpdate(userId, {
      $pull: { registeredEvents: eventId }
    });
    
    res.status(200).json({ 
      success: true,
      message: 'Registration cancelled successfully',
      registrationCount: event.registrationCount
    });
  } catch (error) {
    console.error('Error cancelling registration:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to cancel registration',
      error: error.message 
    });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  registerForEvent,
  cancelRegistration
};