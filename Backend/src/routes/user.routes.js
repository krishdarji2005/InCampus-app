const express = require('express');
const { body, param } = require('express-validator');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserStats
} = require('../controllers/user.controller');
const { authenticateToken, requireAdmin, requireCommittee } = require('../middlewares/auth.middleware');

const router = express.Router();

// Validation rules
const createUserValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['student', 'committee', 'admin'])
    .withMessage('Invalid role'),
  body('studentId')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Student ID must be between 1 and 20 characters'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department name cannot exceed 100 characters'),
  body('year')
    .optional()
    .isIn(['1st', '2nd', '3rd', '4th', 'Masters', 'PhD'])
    .withMessage('Invalid year'),
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone must be a valid 10-digit number')
];

const updateUserValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('role')
    .optional()
    .isIn(['student', 'committee', 'admin'])
    .withMessage('Invalid role'),
  body('studentId')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Student ID must be between 1 and 20 characters'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department name cannot exceed 100 characters'),
  body('year')
    .optional()
    .isIn(['1st', '2nd', '3rd', '4th', 'Masters', 'PhD'])
    .withMessage('Invalid year'),
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone must be a valid 10-digit number'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value')
];

const userIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID')
];

// Routes
router.get('/', authenticateToken, requireAdmin, getUsers);
router.get('/stats', authenticateToken, requireAdmin, getUserStats);
router.get('/:id', authenticateToken, userIdValidation, getUser);
router.post('/', authenticateToken, requireAdmin, createUserValidation, createUser);
router.put('/:id', authenticateToken, requireCommittee, userIdValidation, updateUserValidation, updateUser);
router.delete('/:id', authenticateToken, requireAdmin, userIdValidation, deleteUser);

module.exports = router;
