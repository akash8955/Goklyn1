const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A project must have a title'],
      trim: true,
      maxlength: [100, 'A project title must have less or equal than 100 characters'],
      minlength: [5, 'A project title must have more or equal than 5 characters'],
    },
    description: {
      type: String,
      required: [true, 'A project must have a description'],
      trim: true,
    },
    techStack: {
      type: [String],
      default: [],
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },
    screenshots: [String],
    demoUrl: String,
    githubUrl: String,

    featured: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
projectSchema.index({ title: 'text', description: 'text' });
projectSchema.index({ featured: 1 });

// Virtual property for duration
projectSchema.virtual('duration').get(function () {
  if (!this.startDate) return undefined;
  
  const end = this.endDate || new Date();
  const durationInMonths = (end - this.startDate) / (1000 * 60 * 60 * 24 * 30);
  
  if (durationInMonths < 1) {
    return 'Less than a month';
  } else if (durationInMonths < 12) {
    return `${Math.round(durationInMonths)} months`;
  } else {
    const years = Math.floor(durationInMonths / 12);
    const months = Math.round(durationInMonths % 12);
    return months > 0 ? `${years} years, ${months} months` : `${years} years`;
  }
});

// Default sorting for projects
projectSchema.pre(/^find/, function (next) {
  this.sort('-createdAt');
  next();
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
