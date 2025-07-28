const mongoose = require('mongoose');
const slugify = require('slugify');
const readingTime = require('reading-time');

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A news article must have a title'],
      trim: true,
      maxlength: [200, 'A news title must have less or equal than 200 characters'],
      minlength: [10, 'A news title must have more or equal than 10 characters']
    },
    slug: String,
    excerpt: {
      type: String,
      required: [true, 'Please provide an excerpt'],
      trim: true,
      maxlength: [300, 'An excerpt must have less or equal than 300 characters']
    },
    content: {
      type: String,
      required: [true, 'Please provide news content']
    },
    featuredImage: {
      type: String,
      required: [true, 'A news article must have a featured image']
    },
    featuredImageAlt: {
      type: String,
      default: ''
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'NewsCategory',
      required: [true, 'News article must belong to a category']
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    author: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'News article must have an author']
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft'
    },
    publishedAt: {
      type: Date,
      default: Date.now()
    },
    scheduledPublish: {
      type: Date,
      validate: {
        validator: function(val) {
          // Only validate if scheduledPublish is set
          if (!val) return true;
          return val > Date.now();
        },
        message: 'Scheduled publish date must be in the future'
      }
    },
    readingTime: {
      type: Number, // in minutes
      default: 0
    },
    wordCount: {
      type: Number,
      default: 0
    },
    featured: {
      type: Boolean,
      default: false
    },
    relatedNews: [{
      type: mongoose.Schema.ObjectId,
      ref: 'News'
    }],
    meta: {
      viewCount: {
        type: Number,
        default: 0
      },
      likeCount: {
        type: Number,
        default: 0
      },
      shareCount: {
        type: Number,
        default: 0
      },
      commentCount: {
        type: Number,
        default: 0
      }
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
      ogImage: String
    },
    lastEditedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    lastEditedAt: Date
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
newsSchema.index({ title: 'text', excerpt: 'text', content: 'text' });
newsSchema.index({ status: 1, publishedAt: -1 });
newsSchema.index({ featured: 1, publishedAt: -1 });
newsSchema.index({ category: 1, publishedAt: -1 });
newsSchema.index({ tags: 1, publishedAt: -1 });
newsSchema.index({ author: 1, publishedAt: -1 });
newsSchema.index({ slug: 1 }, { unique: true });

// Virtual populate for comments
newsSchema.virtual('comments', {
  ref: 'NewsComment',
  foreignField: 'news',
  localField: '_id'
});

// Document middleware: runs before .save() and .create()
newsSchema.pre('save', function(next) {
  // Generate slug from title if it's new or title was modified
  if (this.isNew || this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  
  // Calculate reading time and word count
  if (this.isModified('content')) {
    const stats = readingTime(this.content || '');
    this.readingTime = Math.ceil(stats.minutes);
    this.wordCount = stats.words;
  }
  
  // If status is changed to published and publishedAt is not set, set it to now
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = Date.now();
  }
  
  // If scheduledPublish is in the past and status is draft, set status to published
  if (this.scheduledPublish && this.scheduledPublish <= Date.now() && this.status === 'draft') {
    this.status = 'published';
    this.publishedAt = this.scheduledPublish;
  }
  
  next();
});

// Query middleware
newsSchema.pre(/^find/, function(next) {
  // By default, only show published news unless specifically queried otherwise
  if (this.getQuery().status === undefined) {
    this.find({ status: 'published', publishedAt: { $lte: Date.now() } });
  }
  next();
});

// Populate author and category by default
newsSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'author',
    select: 'name photo'
  }).populate({
    path: 'category',
    select: 'name slug'
  });
  next();
});

// Static method to find related news based on tags
newsSchema.statics.findRelatedNews = async function(newsId, limit = 3) {
  const news = await this.findById(newsId);
  if (!news) return [];
  
  return this.find({
    _id: { $ne: news._id },
    status: 'published',
    publishedAt: { $lte: Date.now() },
    $or: [
      { tags: { $in: news.tags } },
      { category: news.category }
    ]
  })
  .sort('-publishedAt')
  .limit(limit)
  .select('title slug excerpt featuredImage publishedAt readingTime');
};

// Static method to get news by month for archive
newsSchema.statics.getArchives = async function() {
  return this.aggregate([
    {
      $match: {
        status: 'published',
        publishedAt: { $lte: new Date() }
      }
    },
    {
      $project: {
        year: { $year: '$publishedAt' },
        month: { $month: '$publishedAt' },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: { year: '$year', month: '$month' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': -1, '_id.month': -1 }
    }
  ]);
};

// Method to increment view count
newsSchema.methods.incrementViewCount = async function() {
  this.meta.viewCount += 1;
  await this.save({ validateBeforeSave: false });
};

// Method to increment like count
newsSchema.methods.incrementLikeCount = async function() {
  this.meta.likeCount += 1;
  await this.save({ validateBeforeSave: false });
};

// Method to increment share count
newsSchema.methods.incrementShareCount = async function() {
  this.meta.shareCount += 1;
  await this.save({ validateBeforeSave: false });
};

const News = mongoose.model('News', newsSchema);

module.exports = News;
