const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Activity must belong to a user'],
    },
    type: {
      type: String,
      required: [true, 'Activity must have a type'],
      enum: [
        'login', 'logout', 'create', 'update', 'delete',
        'register', 'password_reset', 'profile_update', 'other'
      ]
    },
    entityType: {
      type: String,
      enum: ['user', 'project', 'internship', 'testimonial', 'other'],
      required: [true, 'Please specify the entity type']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'entityType',
      required: [true, 'Please provide the entity ID']
    },
    title: {
      type: String,
      required: [true, 'Activity must have a title']
    },
    description: {
      type: String,
      required: [true, 'Activity must have a description']
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    ipAddress: String,
    userAgent: String
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for faster querying
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ entityType: 1, entityId: 1 });
activitySchema.index({ createdAt: -1 });

// Populate user data when querying
activitySchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name email role'
  });
  next();
});

// Static method to log an activity
activitySchema.statics.logActivity = async function(activityData) {
  try {
    const activity = await this.create(activityData);
    return activity;
  } catch (error) {
    console.error('Error logging activity:', error);
    return null;
  }
};

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
