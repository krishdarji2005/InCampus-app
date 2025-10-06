const { validationResult } = require('express-validator');
const Event = require('../models/event.model');
const Registration = require('../models/registration.model');
const { asyncHandler } = require('../middlewares/error.middleware');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const { 
    category, 
    status, 
    search, 
    upcoming, 
    organizer,
    isPublic,
    sortBy = 'date',
    sortOrder = 'asc'
  } = req.query;
  
  // Build filter object
  const filter = {};
  
  // Only show public events to non-authenticated users
  if (!req.user || req.user.role === 'student') {
    filter.isPublic = true;
    filter.status = 'published';
  } else if (isPublic !== undefined) {
    filter.isPublic = isPublic === 'true';
  }
  
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (organizer) filter.organizer = organizer;
  
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }
  
  if (upcoming === 'true') {
    filter.date = { $gte: new Date() };
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const events = await Event.find(filter)
    .populate('organizer', 'name email')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await Event.countDocuments(filter);

  res.json({
    success: true,
    count: events.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: { events }
  });
});

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate('organizer', 'name email department')
    .populate('approvedBy', 'name email');

  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  // Check if user can view this event
  if (!event.isPublic && (!req.user || req.user.role === 'student')) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  res.json({
    success: true,
    data: { event }
  });
});

// @desc    Create new event
// @route   POST /api/events
// @access  Private/Committee
const createEvent = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const eventData = {
    ...req.body,
    organizer: req.user._id
  };

  const event = await Event.create(eventData);

  // Populate organizer info
  await event.populate('organizer', 'name email');

  res.status(201).json({
    success: true,
    message: 'Event created successfully',
    data: { event }
  });
});

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
const updateEvent = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const event = await Event.findById(req.params.id);
  
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  // Check permissions
  if (req.user.role === 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  if (req.user.role === 'committee' && event.organizer.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const updatedEvent = await Event.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('organizer', 'name email');

  res.json({
    success: true,
    message: 'Event updated successfully',
    data: { event: updatedEvent }
  });
});

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  // Check permissions
  if (req.user.role === 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  if (req.user.role === 'committee' && event.organizer.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Delete all registrations for this event
  await Registration.deleteMany({ event: req.params.id });

  await Event.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Event deleted successfully'
  });
});

// @desc    Approve event (Admin only)
// @route   PUT /api/events/:id/approve
// @access  Private/Admin
const approveEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  const updatedEvent = await Event.findByIdAndUpdate(
    req.params.id,
    {
      isApproved: true,
      status: 'published',
      approvedBy: req.user._id,
      approvedAt: new Date()
    },
    { new: true, runValidators: true }
  ).populate('organizer', 'name email')
   .populate('approvedBy', 'name email');

  res.json({
    success: true,
    message: 'Event approved successfully',
    data: { event: updatedEvent }
  });
});

// @desc    Get event registrations
// @route   GET /api/events/:id/registrations
// @access  Private
const getEventRegistrations = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  // Check permissions
  if (req.user.role === 'student' && event.organizer.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const registrations = await Registration.find({ event: req.params.id })
    .populate('user', 'name email studentId department year')
    .sort({ registrationDate: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Registration.countDocuments({ event: req.params.id });

  res.json({
    success: true,
    count: registrations.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: { registrations }
  });
});

// @desc    Get event statistics
// @route   GET /api/events/stats
// @access  Private/Admin
const getEventStats = asyncHandler(async (req, res) => {
  const totalEvents = await Event.countDocuments();
  const publishedEvents = await Event.countDocuments({ status: 'published' });
  const draftEvents = await Event.countDocuments({ status: 'draft' });
  const upcomingEvents = await Event.countDocuments({ 
    date: { $gte: new Date() },
    status: 'published'
  });

  // Get events by category
  const eventsByCategory = await Event.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Get events by month
  const eventsByMonth = await Event.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } }
  ]);

  res.json({
    success: true,
    data: {
      totalEvents,
      publishedEvents,
      draftEvents,
      upcomingEvents,
      eventsByCategory,
      eventsByMonth
    }
  });
});

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  approveEvent,
  getEventRegistrations,
  getEventStats
};
