const Event = require('../models/eventModel');
const User = require('../models/userModel');
const fs = require('fs');
const path = require('path');

// Helper function to delete uploaded files
const deleteUploadedFiles = (files) => {
  if (files) {
    Object.values(files).forEach(fileArray => {
      if (Array.isArray(fileArray)) {
        fileArray.forEach(file => {
          if (fs.existsSync(file.path)) {
            try {
              fs.unlinkSync(file.path);
              console.log(`Deleted file: ${file.path}`);
            } catch (error) {
              console.error(`Error deleting file ${file.path}:`, error);
            }
          }
        });
      }
    });
  }
};

// Create new event
const createEvent = async (req, res) => {
  try {
    const eventData = req.body;
    
    // You can add createdBy from authentication middleware later
    // For now, we'll use a placeholder or get it from request
    
    const event = new Event(eventData);
    await event.save();

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: event
    });

  } catch (error) {
    console.error('Create event error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }
    
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
    const events = await Event.find()
      .populate('createdBy', 'name email')
      .populate('registeredUsers.userId', 'name email department year')
      .sort({ createdAt: -1 });

    // Transform the response to include registration count
    const eventsWithCount = events.map(event => ({
      ...event.toObject(),
      registrationCount: event.registrationCount,
      isFull: event.isFull
    }));

    res.status(200).json({
      success: true,
      events: eventsWithCount
    });

  } catch (error) {
    console.error('Get all events error:', error);
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
    const { id } = req.params;
    
    const event = await Event.findById(id)
      .populate('createdBy', 'name email')
      .populate('registeredUsers.userId', 'name email department year phone');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const eventData = {
      ...event.toObject(),
      registrationCount: event.registrationCount,
      isFull: event.isFull
    };

    res.status(200).json({
      success: true,
      event: eventData
    });

  } catch (error) {
    console.error('Get event by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event',
      error: error.message
    });
  }
};

// Register for event with file uploads
const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId, additionalInfo } = req.body;
    const files = req.files;

    console.log('Event registration request:', { eventId, userId, files: files ? Object.keys(files) : 'none' });

    // Validate required fields
    if (!userId) {
      deleteUploadedFiles(files);
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Validate ID image is uploaded
    if (!files || !files.idImage || files.idImage.length === 0) {
      deleteUploadedFiles(files);
      return res.status(400).json({
        success: false,
        message: 'ID image is required for registration'
      });
    }

    // Check if user exists and profile is complete
    const user = await User.findById(userId);
    if (!user) {
      deleteUploadedFiles(files);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate user profile completeness
    const requiredFields = ['name', 'phone', 'department', 'year'];
    const missingFields = requiredFields.filter(field => 
      !user[field] || user[field].toString().trim().length === 0
    );
    
    if (missingFields.length > 0) {
      deleteUploadedFiles(files);
      return res.status(400).json({
        success: false,
        message: `Please complete your profile. Missing fields: ${missingFields.join(', ')}`,
        missingFields
      });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      deleteUploadedFiles(files);
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user is already registered
    if (event.isUserRegistered(userId)) {
      deleteUploadedFiles(files);
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Get file paths
    const idImagePath = files.idImage[0].path;
    const additionalDocumentPath = files.additionalDocument && files.additionalDocument[0] 
      ? files.additionalDocument[0].path 
      : null;

    // Determine registration status (registered or waitlisted)
    const registrationStatus = event.isFull ? 'waitlisted' : 'registered';

    // Create registration object
    const registration = {
      userId: userId,
      idImagePath: idImagePath,
      additionalDocumentPath: additionalDocumentPath,
      status: registrationStatus,
      additionalInfo: additionalInfo || '',
      registeredAt: new Date()
    };

    // Add registration to event
    event.registeredUsers.push(registration);
    await event.save();

    // Update user's registered events (if you have this field in user model)
    if (user.registeredEvents) {
      user.registeredEvents.push(eventId);
      await user.save();
    }

    console.log(`User ${userId} registered for event ${eventId} with status: ${registrationStatus}`);

    res.status(200).json({
      success: true,
      message: registrationStatus === 'waitlisted' 
        ? 'You have been added to the waitlist' 
        : 'Successfully registered for the event',
      registration: {
        eventId: eventId,
        status: registrationStatus,
        registeredAt: registration.registeredAt
      }
    });

  } catch (error) {
    console.error('Register for event error:', error);
    
    // Clean up uploaded files on error
    deleteUploadedFiles(req.files);
    
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

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Find and remove the registration
    const registrationIndex = event.registeredUsers.findIndex(
      reg => reg.userId.toString() === userId && reg.status !== 'cancelled'
    );

    if (registrationIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'You are not registered for this event'
      });
    }

    // Mark as cancelled instead of removing (for record keeping)
    event.registeredUsers[registrationIndex].status = 'cancelled';
    await event.save();

    // Update user's registered events
    const user = await User.findById(userId);
    if (user && user.registeredEvents) {
      user.registeredEvents = user.registeredEvents.filter(
        eventIdObj => eventIdObj.toString() !== eventId
      );
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Registration cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel registration error:', error);
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