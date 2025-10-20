const express = require('express');
const {
  createEvent,
  getAllEvents,
  getEventById,
  registerForEvent,
  cancelRegistration
} = require('../controller/eventController');

const router = express.Router();

// GET /api/events - Get all events
router.get('/', getAllEvents);

// GET /api/events/:id - Get event by ID
router.get('/:id', getEventById);

// POST /api/events - Create new event
router.post('/', createEvent);

// POST /api/events/:eventId/register - Register for event
router.post('/:eventId/register', registerForEvent);

// DELETE /api/events/:eventId/register - Cancel registration
router.delete('/:eventId/register', cancelRegistration);

module.exports = router;