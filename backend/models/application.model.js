const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  internship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Internship',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  resume: {
    type: String, // This will store the URL to the resume
    required: true
  },
  status: {
    type: String,
    enum: ['Received', 'Under Review', 'Interviewing', 'Rejected', 'Hired'],
    default: 'Received'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

const Application = mongoose.model('Application', applicationSchema);

module.exports = Application;
