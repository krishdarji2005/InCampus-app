const express = require('express');
const { 
  getEvents, 
  getEventById, 
  createEvent, 
  updateEvent, 
  deleteEvent,
  registerForEvent,
  cancelRegistration
} = require('../controllers/event.controller');
const { protect, committee } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public routes
router.get('/', getEvents);
router.get('/:id', getEventById);

// Protected routes
router.post('/', protect, committee, createEvent);
router.put('/:id', protect, committee, updateEvent);
router.delete('/:id', protect, committee, deleteEvent);

// Registration routes
router.post('/:id/register', protect, registerForEvent);
router.delete('/:id/register', protect, cancelRegistration);

module.exports = router;