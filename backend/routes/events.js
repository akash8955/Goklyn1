const express = require('express');
const eventController = require('../controllers/eventController');
const authController = require('../middleware/auth');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Route for getting upcoming events (must come before the :id route)
router.get('/upcoming', eventController.getUpcomingEvents);

// Routes for events
router.route('/')
  .get(eventController.getAllEvents)
  .post(eventController.createEvent);

// Routes for specific event by ID
router.route('/:id')
  .get(eventController.getEvent)
  .patch(eventController.updateEvent)
  .delete(eventController.deleteEvent);

module.exports = router;
