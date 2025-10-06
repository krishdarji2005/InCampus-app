const express = require('express');
const { body, param } = require('express-validator');
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  approveEvent,
  getEventRegistrations,
  getEventStats
} = require('../controllers/event.controller');
const { authenticateToken, requireCommittee, requireAdmin, optionalAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

// Validation rules
const createEventValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('shortDescription')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Short description cannot exceed 200 characters'),
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid end date'),
  body('time')
    .notEmpty()
    .withMessage('Event time is required'),
  body('endTime')
    .optional()
    .notEmpty()
    .withMessage('End time cannot be empty'),
  body('location')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Location must be between 1 and 200 characters'),
  body('category')
    .isIn(['academic', 'cultural', 'sports', 'technical', 'social', 'workshop', 'seminar', 'conference', 'other'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('maxParticipants')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum participants must be a positive integer'),
  body('registrationDeadline')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid registration deadline'),
  body('registrationFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Registration fee must be a non-negative number'),
  body('isRegistrationOpen')
    .optional()
    .isBoolean()
    .withMessage('isRegistrationOpen must be a boolean value'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean value'),
  body('requirements')
    .optional()
    .isArray()
    .withMessage('Requirements must be an array'),
  body('prizes')
    .optional()
    .isArray()
    .withMessage('Prizes must be an array'),
  body('contactInfo.email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid contact email'),
  body('contactInfo.phone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Contact phone must be a valid 10-digit number'),
  body('contactInfo.name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Contact name cannot exceed 100 characters')
];

const updateEventValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('shortDescription')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Short description cannot exceed 200 characters'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid end date'),
  body('time')
    .optional()
    .notEmpty()
    .withMessage('Event time cannot be empty'),
  body('endTime')
    .optional()
    .notEmpty()
    .withMessage('End time cannot be empty'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Location must be between 1 and 200 characters'),
  body('category')
    .optional()
    .isIn(['academic', 'cultural', 'sports', 'technical', 'social', 'workshop', 'seminar', 'conference', 'other'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('maxParticipants')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum participants must be a positive integer'),
  body('registrationDeadline')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid registration deadline'),
  body('registrationFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Registration fee must be a non-negative number'),
  body('isRegistrationOpen')
    .optional()
    .isBoolean()
    .withMessage('isRegistrationOpen must be a boolean value'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean value'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'cancelled', 'completed'])
    .withMessage('Invalid status'),
  body('requirements')
    .optional()
    .isArray()
    .withMessage('Requirements must be an array'),
  body('prizes')
    .optional()
    .isArray()
    .withMessage('Prizes must be an array'),
  body('contactInfo.email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid contact email'),
  body('contactInfo.phone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Contact phone must be a valid 10-digit number'),
  body('contactInfo.name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Contact name cannot exceed 100 characters')
];

const eventIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid event ID')
];

// Routes
router.get('/', optionalAuth, getEvents);
router.get('/stats', authenticateToken, requireAdmin, getEventStats);
router.get('/:id', optionalAuth, eventIdValidation, getEvent);
router.get('/:id/registrations', authenticateToken, requireCommittee, eventIdValidation, getEventRegistrations);
router.post('/', authenticateToken, requireCommittee, createEventValidation, createEvent);
router.put('/:id', authenticateToken, requireCommittee, eventIdValidation, updateEventValidation, updateEvent);
router.put('/:id/approve', authenticateToken, requireAdmin, eventIdValidation, approveEvent);
router.delete('/:id', authenticateToken, requireCommittee, eventIdValidation, deleteEvent);

module.exports = router;