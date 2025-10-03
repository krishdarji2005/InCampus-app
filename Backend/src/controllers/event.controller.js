const Event = require('../models/event.model');
const Registration = require('../models/registration.model');
const User = require('../models/user.model');
const asyncHandler = require('express-async-handler');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
exports.getEvents = asyncHandler(async (req, res) => {
  const { category, committee, search } = req.query;
  
  // Build query
  const query = {};
  
  if (category && category !== 'All') {
    query.category = category;
  }
  
  if (committee) {
    query.committee = committee;
  }
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { venue: { $regex: search, $options: 'i' } }
    ];
  }
  
  // Only show active events
  query.isActive = true;
  
  const events = await Event.find(query)
    .populate('organizer', 'name email')
    .sort({ date: 1 });
  
  res.json(events);
});

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
exports.getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate('organizer', 'name email')
    .populate('registeredParticipants', 'name email');
  
  if (event) {
    res.json(event);
  } else {
    res.status(404);
    throw new Error('Event not found');
  }
});

// @desc    Create a new event
// @route   POST /api/events
// @access  Private/Committee
exports.createEvent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    date,
    venue,
    committee,
    image,
    category,
    registrationDeadline,
    maxParticipants
  } = req.body;
  
  const event = await Event.create({
    title,
    description,
    date,
    venue,
    organizer: req.user.id,
    committee,
    image: image || 'default-event.jpg',
    category,
    registrationDeadline,
    maxParticipants,
    registeredParticipants: []
  });
  
  res.status(201).json(event);
});

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private/Committee
exports.updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  
  // Check if user is the organizer
  if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this event');
  }
  
  const updatedEvent = await Event.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('organizer', 'name email');
  
  res.json(updatedEvent);
});

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Committee
exports.deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  
  // Check if user is the organizer
  if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this event');
  }
  
  await event.remove();
  
  res.json({ message: 'Event removed' });
});

// @desc    Register for an event
// @route   POST /api/events/:id/register
// @access  Private
exports.registerForEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  
  // Check if registration is open
  if (event.registrationDeadline && new Date() > event.registrationDeadline) {
    res.status(400);
    throw new Error('Registration deadline has passed');
  }
  
  // Check if event is full
  if (event.maxParticipants && event.registeredParticipants.length >= event.maxParticipants) {
    res.status(400);
    throw new Error('Event is already full');
  }
  
  // Check if user is already registered
  if (event.isUserRegistered(req.user.id)) {
    res.status(400);
    throw new Error('You are already registered for this event');
  }
  
  // Create registration
  const registration = await Registration.create({
    user: req.user.id,
    event: event._id,
    status: 'confirmed'
  });
  
  // Update event with new participant
  event.registeredParticipants.push(req.user.id);
  await event.save();
  
  // Update user's registered events
  const user = await User.findById(req.user.id);
  user.registeredEvents.push(event._id);
  await user.save();
  
  res.status(201).json(registration);
});

// @desc    Cancel registration for an event
// @route   DELETE /api/events/:id/register
// @access  Private
exports.cancelRegistration = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  
  // Check if user is registered
  if (!event.isUserRegistered(req.user.id)) {
    res.status(400);
    throw new Error('You are not registered for this event');
  }
  
  // Update registration status
  const registration = await Registration.findOne({
    user: req.user.id,
    event: event._id
  });
  
  if (registration) {
    registration.status = 'cancelled';
    await registration.save();
  }
  
  // Remove user from event participants
  event.registeredParticipants = event.registeredParticipants.filter(
    participant => participant.toString() !== req.user.id
  );
  await event.save();
  
  // Remove event from user's registered events
  const user = await User.findById(req.user.id);
  user.registeredEvents = user.registeredEvents.filter(
    eventId => eventId.toString() !== event._id.toString()
  );
  await user.save();
  
  res.json({ message: 'Registration cancelled' });
});