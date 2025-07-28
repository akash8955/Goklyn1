const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Activity must belong to a user']
  },
  type: {
    type: String,
    required: [true, 'Activity must have a type'],
    enum: [
      'login', 'register', 'logout',
      'project_create', 'project_update', 'project_delete',
      'internship_create', 'internship_update', 'internship_delete',
      'testimonial_create', 'testimonial_update', 'testimonial_delete',
      'profile_update', 'password_change', 'settings_update'
    ]
  },
  title: {
    type: String,
    required: [true, 'Activity must have a title']
  },
  description: {
    type: String,
    required: [true, 'Activity must have a description']
  },
  entityType: {
    type: String,
    enum: ['project', 'internship', 'testimonial', 'user', 'auth', 'settings'],
    required: [true, 'Activity must have an entity type']
  },
  entityId: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Activity must have an entity ID']
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ type: 1, createdAt: -1 });
activitySchema.index({ entityType: 1, entityId: 1 });

// Populate user data when querying
activitySchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name email role'
  });
  next();
});

const Activity = mongoose.model('Activity', activitySchema);
module.exports = Activity;
