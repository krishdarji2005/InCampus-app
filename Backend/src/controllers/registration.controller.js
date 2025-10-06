const { validationResult } = require('express-validator');
const Registration = require('../models/registration.model');
const Event = require('../models/event.model');
const { asyncHandler } = require('../middlewares/error.middleware');

// @desc    Register for event
// @route   POST /api/registrations
// @access  Private
const registerForEvent = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { eventId, additionalInfo, emergencyContact, dietaryRequirements, tshirtSize } = req.body;

  // Check if event exists
  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  // Check if user can register for this event
  if (!event.canUserRegister(req.user._id)) {
    return res.status(400).json({
      success: false,
      message: 'Registration is not available for this event'
    });
  }

  // Check if user is already registered
  const existingRegistration = await Registration.findOne({
    user: req.user._id,
    event: eventId
  });

  if (existingRegistration) {
    return res.status(400).json({
      success: false,
      message: 'You are already registered for this event'
    });
  }

  // Create registration
  const registration = await Registration.create({
    user: req.user._id,
    event: eventId,
    additionalInfo,
    emergencyContact,
    dietaryRequirements,
    tshirtSize,
    status: 'confirmed'
  });

  // Populate user and event info
  await registration.populate([
    { path: 'user', select: 'name email studentId department year' },
    { path: 'event', select: 'title date location' }
  ]);

  res.status(201).json({
    success: true,
    message: 'Successfully registered for the event',
    data: { registration }
  });
});

// @desc    Get user's registrations
// @route   GET /api/registrations/my-registrations
// @access  Private
const getMyRegistrations = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const { status, upcoming } = req.query;
  
  // Build filter object
  const filter = { user: req.user._id };
  if (status) filter.status = status;

  let registrations = await Registration.find(filter)
    .populate({
      path: 'event',
      select: 'title description date endDate time endTime location category image status',
      match: upcoming === 'true' ? { date: { $gte: new Date() } } : {}
    })
    .sort({ registrationDate: -1 })
    .skip(skip)
    .limit(limit);

  // Filter out registrations where event was deleted
  registrations = registrations.filter(reg => reg.event);

  const total = await Registration.countDocuments(filter);

  res.json({
    success: true,
    count: registrations.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: { registrations }
  });
});

// @desc    Get single registration
// @route   GET /api/registrations/:id
// @access  Private
const getRegistration = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.id)
    .populate('user', 'name email studentId department year')
    .populate('event', 'title date location organizer');

  if (!registration) {
    return res.status(404).json({
      success: false,
      message: 'Registration not found'
    });
  }

  // Check permissions
  if (req.user.role === 'student' && registration.user._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  res.json({
    success: true,
    data: { registration }
  });
});

// @desc    Update registration
// @route   PUT /api/registrations/:id
// @access  Private
const updateRegistration = asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const registration = await Registration.findById(req.params.id);
  
  if (!registration) {
    return res.status(404).json({
      success: false,
      message: 'Registration not found'
    });
  }

  // Check permissions
  if (req.user.role === 'student' && registration.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const updatedRegistration = await Registration.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('user', 'name email studentId department year')
   .populate('event', 'title date location');

  res.json({
    success: true,
    message: 'Registration updated successfully',
    data: { registration: updatedRegistration }
  });
});

// @desc    Cancel registration
// @route   PUT /api/registrations/:id/cancel
// @access  Private
const cancelRegistration = asyncHandler(async (req, res) => {
  const { cancellationReason } = req.body;

  const registration = await Registration.findById(req.params.id);
  
  if (!registration) {
    return res.status(404).json({
      success: false,
      message: 'Registration not found'
    });
  }

  // Check permissions
  if (req.user.role === 'student' && registration.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Check if registration can be cancelled
  if (registration.status === 'cancelled') {
    return res.status(400).json({
      success: false,
      message: 'Registration is already cancelled'
    });
  }

  const updatedRegistration = await Registration.findByIdAndUpdate(
    req.params.id,
    {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancellationReason
    },
    { new: true, runValidators: true }
  ).populate('user', 'name email studentId department year')
   .populate('event', 'title date location');

  res.json({
    success: true,
    message: 'Registration cancelled successfully',
    data: { registration: updatedRegistration }
  });
});

// @desc    Check in user for event
// @route   PUT /api/registrations/:id/checkin
// @access  Private/Committee
const checkInUser = asyncHandler(async (req, res) => {
  const registration = await Registration.findById(req.params.id)
    .populate('event');
  
  if (!registration) {
    return res.status(404).json({
      success: false,
      message: 'Registration not found'
    });
  }

  // Check permissions
  if (req.user.role === 'student' && registration.event.organizer.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  if (registration.checkedIn) {
    return res.status(400).json({
      success: false,
      message: 'User is already checked in'
    });
  }

  const updatedRegistration = await Registration.findByIdAndUpdate(
    req.params.id,
    {
      checkedIn: true,
      checkedInAt: new Date(),
      status: 'attended'
    },
    { new: true, runValidators: true }
  ).populate('user', 'name email studentId department year')
   .populate('event', 'title date location');

  res.json({
    success: true,
    message: 'User checked in successfully',
    data: { registration: updatedRegistration }
  });
});

// @desc    Submit feedback for event
// @route   PUT /api/registrations/:id/feedback
// @access  Private
const submitFeedback = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const registration = await Registration.findById(req.params.id);
  
  if (!registration) {
    return res.status(404).json({
      success: false,
      message: 'Registration not found'
    });
  }

  // Check permissions
  if (registration.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  if (registration.feedback.submittedAt) {
    return res.status(400).json({
      success: false,
      message: 'Feedback already submitted'
    });
  }

  const updatedRegistration = await Registration.findByIdAndUpdate(
    req.params.id,
    {
      'feedback.rating': rating,
      'feedback.comment': comment,
      'feedback.submittedAt': new Date()
    },
    { new: true, runValidators: true }
  ).populate('user', 'name email studentId department year')
   .populate('event', 'title date location');

  res.json({
    success: true,
    message: 'Feedback submitted successfully',
    data: { registration: updatedRegistration }
  });
});

// @desc    Get all registrations (Admin/Committee)
// @route   GET /api/registrations
// @access  Private/Admin
const getAllRegistrations = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const { status, eventId, userId } = req.query;
  
  // Build filter object
  const filter = {};
  if (status) filter.status = status;
  if (eventId) filter.event = eventId;
  if (userId) filter.user = userId;

  const registrations = await Registration.find(filter)
    .populate('user', 'name email studentId department year')
    .populate('event', 'title date location category')
    .sort({ registrationDate: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Registration.countDocuments(filter);

  res.json({
    success: true,
    count: registrations.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: { registrations }
  });
});

module.exports = {
  registerForEvent,
  getMyRegistrations,
  getRegistration,
  updateRegistration,
  cancelRegistration,
  checkInUser,
  submitFeedback,
  getAllRegistrations
};
