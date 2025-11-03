// Backend/src/routes/dashboardRoutes.js
const express = require('express');
const {
  getDashboardAnalytics,
  getOrganizerEvents,
  exportRegistrations,
  deleteEvent
} = require('../controller/dashboardController');

const router = express.Router();

// Dashboard analytics
router.get('/analytics/:organizerId', getDashboardAnalytics);

// Get organizer's events with filtering
router.get('/organizer/:organizerId/events', getOrganizerEvents);

// Export registrations
router.get('/events/:eventId/export', exportRegistrations);

// Delete event
router.delete('/events/:eventId', deleteEvent);

module.exports = router;