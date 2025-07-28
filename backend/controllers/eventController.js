const Event = require('../models/Event');
const catchAsync = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');

// Helper function to filter allowed fields
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Create a new event
exports.createEvent = catchAsync(async (req, res, next) => {
  // 1) Filter out unwanted fields that are not allowed to be set
  const filteredBody = filterObj(
    req.body,
    'title',
    'description',
    'start',
    'end',
    'type'
  );

  // 2) Create event
  const newEvent = await Event.create(filteredBody);

  // 3) Send response
  res.status(201).json({
    status: 'success',
    data: {
      event: newEvent
    }
  });
});

// Get all events
exports.getAllEvents = catchAsync(async (req, res, next) => {
  const events = await Event.find().sort({ start: 1 });
  
  res.status(200).json({
    status: 'success',
    results: events.length,
    data: {
      events
    }
  });
});

// Get a single event
exports.getEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.params.id);
  
  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      event
    }
  });
});

// Update an event
exports.updateEvent = catchAsync(async (req, res, next) => {
  // 1) Filter out unwanted fields that are not allowed to be updated
  const filteredBody = filterObj(
    req.body,
    'title',
    'description',
    'start',
    'end',
    'type'
  );

  // 2) Update event
  const updatedEvent = await Event.findByIdAndUpdate(
    req.params.id,
    filteredBody,
    {
      new: true,
      runValidators: true
    }
  );

  if (!updatedEvent) {
    return next(new AppError('No event found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      event: updatedEvent
    }
  });
});

// Delete an event
exports.deleteEvent = catchAsync(async (req, res, next) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  
  if (!event) {
    return next(new AppError('No event found with that ID', 404));
  }
  
  res.status(204).send();
});

// Get upcoming events
exports.getUpcomingEvents = catchAsync(async (req, res, next) => {
  const now = new Date();
  const limit = parseInt(req.query.limit) || 5;
  
  const events = await Event.find({
    end: { $gte: now }
  })
  .sort({ start: 1 })
  .limit(limit);
  
  res.status(200).json({
    status: 'success',
    results: events.length,
    data: {
      events
    }
  });
});
