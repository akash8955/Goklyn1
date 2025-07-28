const mongoose = require('mongoose');

// Prevent model recompilation
let Album;

if (mongoose.models.Album) {
  Album = mongoose.model('Album');
} else {
  const albumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for the album'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  coverImage: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for gallery items in this album
albumSchema.virtual('items', {
  ref: 'Gallery',
  localField: '_id',
  foreignField: 'album',
  justOne: false
});

// Update the updatedAt field before saving
albumSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Cascade delete gallery items when an album is deleted
albumSchema.pre('remove', async function(next) {
  await this.model('Gallery').deleteMany({ album: this._id });
  next();
});

  Album = mongoose.model('Album', albumSchema);
}

module.exports = Album;
