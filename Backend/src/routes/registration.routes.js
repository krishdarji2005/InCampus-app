const express = require('express');
const { body, param } = require('express-validator');
const {
  registerForEvent,
  getMyRegistrations,
  getRegistration,
  updateRegistration,
  cancelRegistration,
  checkInUser,
  submitFeedback,
  getAllRegistrations
} = require('../controllers/registration.controller');
const { authenticateToken, requireCommittee, requireAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('eventId')
    .isMongoId()
    .withMessage('Invalid event ID'),
  body('additionalInfo')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Additional info cannot exceed 500 characters'),
  body('emergencyContact.name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Emergency contact name cannot exceed 100 characters'),
  body('emergencyContact.phone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Emergency contact phone must be a valid 10-digit number'),
  body('emergencyContact.relation')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Emergency contact relation cannot exceed 50 characters'),
  body('dietaryRequirements')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Dietary requirements cannot exceed 200 characters'),
  body('tshirtSize')
    .optional()
    .isIn(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'])
    .withMessage('Invalid t-shirt size')
];

const updateRegistrationValidation = [
  body('additionalInfo')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Additional info cannot exceed 500 characters'),
  body('emergencyContact.name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Emergency contact name cannot exceed 100 characters'),
  body('emergencyContact.phone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Emergency contact phone must be a valid 10-digit number'),
  body('emergencyContact.relation')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Emergency contact relation cannot exceed 50 characters'),
  body('dietaryRequirements')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Dietary requirements cannot exceed 200 characters'),
  body('tshirtSize')
    .optional()
    .isIn(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'])
    .withMessage('Invalid t-shirt size'),
  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'cancelled', 'attended', 'no-show'])
    .withMessage('Invalid status')
];

const cancelRegistrationValidation = [
  body('cancellationReason')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Cancellation reason cannot exceed 200 characters')
];

const feedbackValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Feedback comment cannot exceed 500 characters')
];

const registrationIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid registration ID')
];

// Routes
router.get('/', authenticateToken, requireAdmin, getAllRegistrations);
router.get('/my-registrations', authenticateToken, getMyRegistrations);
router.get('/:id', authenticateToken, registrationIdValidation, getRegistration);
router.post('/', authenticateToken, registerValidation, registerForEvent);
router.put('/:id', authenticateToken, registrationIdValidation, updateRegistrationValidation, updateRegistration);
router.put('/:id/cancel', authenticateToken, registrationIdValidation, cancelRegistrationValidation, cancelRegistration);
router.put('/:id/checkin', authenticateToken, requireCommittee, registrationIdValidation, checkInUser);
router.put('/:id/feedback', authenticateToken, registrationIdValidation, feedbackValidation, submitFeedback);

module.exports = router;
