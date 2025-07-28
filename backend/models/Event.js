const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'An event must have a title'],
    trim: true,
    maxlength: [100, 'An event title must have less or equal than 100 characters'],
    minlength: [3, 'An event title must have more or equal than 3 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be longer than 500 characters']
  },
  start: {
    type: Date,
    required: [true, 'An event must have a start time']
  },
  end: {
    type: Date,
    required: [true, 'An event must have an end time'],
    validate: {
      validator: function(end) {
        return end > this.start;
      },
      message: 'End time must be after start time'
    }
  },
  type: {
    type: String,
    required: [true, 'An event must have a type'],
    enum: {
      values: ['meeting', 'deadline', 'call', 'reminder'],
      message: 'Event type must be either: meeting, deadline, call, or reminder'
    },
    default: 'meeting'
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
eventSchema.index({ start: 1 });
eventSchema.index({ end: 1 });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
