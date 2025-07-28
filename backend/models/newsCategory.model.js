/* eslint-env node */
'use strict';

const mongoose = require('mongoose');
const { slugify } = require('slugify');
const validator = require('validator');

// Constants for validation messages and limits
const VALIDATION = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    REQUIRED: 'A category must have a name',
    INVALID: 'Category name contains invalid characters. Only letters, numbers, and basic punctuation are allowed.'
  },
  DESCRIPTION: {
    MAX_LENGTH: 500,
    INVALID: 'Description contains invalid characters. Only standard text characters are allowed.'
  },
  URL: {
    INVALID: 'must be a valid HTTPS URL',
    PROTOCOLS: ['http', 'https'],
    OPTIONS: {
      requireProtocol: true,
      allowUnderscores: true
    }
  },
  PARENT: {
    SELF_REFERENCE: 'A category cannot be its own parent',
    NOT_FOUND: 'Parent category not found',
    INVALID: 'Invalid parent category reference'
  },
  KEYWORDS: {
    MAX_COUNT: 10,
    INVALID: 'Keywords can only contain letters, numbers, and basic punctuation',
    TOO_MANY: 'Cannot have more than 10 keywords'
  }
};

/**
 * Validates if a string is a valid URL with the given options
 * @param {string} value - The URL to validate
 * @param {boolean} [isRequired=false] - Whether the URL is required
 * @returns {boolean} True if valid, false otherwise
 */
const isValidUrl = (value, isRequired = false) => {
  if (!value) return !isRequired;
  return validator.isURL(value, {
    protocols: VALIDATION.URL.PROTOCOLS,
    ...VALIDATION.URL.OPTIONS
  });
};

/**
 * Validates if a string contains only safe characters
 * @param {string} value - The string to validate
 * @returns {boolean} True if valid, false otherwise
 */
const hasValidCharacters = (value) => {
  if (!value) return true;
  return validator.isAscii(value) && !/[<>{}]/.test(value);
};

/**
 * News Category Schema
 * @typedef {Object} NewsCategory
 * @property {string} name - The name of the category
 * @property {string} slug - URL-friendly slug
 * @property {string} [description] - Category description
 * @property {mongoose.Types.ObjectId} [parent] - Parent category reference
 * @property {boolean} [featured] - Whether the category is featured
 * @property {number} [featuredOrder] - Order in featured list
 * @property {string} [icon] - URL to category icon
 * @property {string} [coverImage] - URL to cover image
 * @property {string} [coverImageAlt] - Alt text for cover image
 * @property {Object} [seo] - SEO metadata
 * @property {string} [seo.metaTitle] - Meta title for SEO
 * @property {string} [seo.metaDescription] - Meta description for SEO
 * @property {string[]} [seo.keywords] - SEO keywords
 * @property {boolean} [isActive] - Whether the category is active
 * @property {mongoose.Types.ObjectId} createdBy - User who created the category
 * @property {mongoose.Types.ObjectId} [updatedBy] - User who last updated the category
 */
const newsCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, VALIDATION.NAME.REQUIRED],
      trim: true,
      unique: true,
      minlength: [
        VALIDATION.NAME.MIN_LENGTH,
        `Category name must be at least ${VALIDATION.NAME.MIN_LENGTH} characters`
      ],
      maxlength: [
        VALIDATION.NAME.MAX_LENGTH,
        `Category name cannot exceed ${VALIDATION.NAME.MAX_LENGTH} characters`
      ],
      validate: {
        validator: hasValidCharacters,
        message: VALIDATION.NAME.INVALID
      }
    },
    
    slug: {
      type: String,
      unique: true,
      index: true,
      immutable: true
    },
    
    description: {
      type: String,
      trim: true,
      maxlength: [
        VALIDATION.DESCRIPTION.MAX_LENGTH,
        `Description cannot exceed ${VALIDATION.DESCRIPTION.MAX_LENGTH} characters`
      ],
      validate: {
        validator: hasValidCharacters,
        message: VALIDATION.DESCRIPTION.INVALID
      }
    },
    
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NewsCategory',
      default: null,
      validate: {
        validator: async function validateParent(value) {
          if (!value) return true;
          
          if (this._id && value.equals(this._id)) {
            throw new Error(VALIDATION.PARENT.SELF_REFERENCE);
          }
          
          const parentExists = await mongoose
            .model('NewsCategory')
            .exists({ _id: value, _id: { $ne: this._id } });
            
          if (!parentExists) {
            throw new Error(VALIDATION.PARENT.NOT_FOUND);
          }
          
          return true;
        },
        message: VALIDATION.PARENT.INVALID
      }
    },
    
    featured: {
      type: Boolean,
      default: false
    },
    
    featuredOrder: {
      type: Number,
      default: 0,
      min: 0
    },
    
    icon: {
      type: String,
      trim: true,
      validate: {
        validator: (value) => isValidUrl(value),
        message: `Icon ${VALIDATION.URL.INVALID}`
      }
    },
    
    coverImage: {
      type: String,
      trim: true,
      validate: {
        validator: (value) => isValidUrl(value),
        message: `Cover image ${VALIDATION.URL.INVALID}`
      }
    },
    
    coverImageAlt: {
      type: String,
      trim: true,
      default: ''
    },
    
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: {
        type: [{
          type: String,
          trim: true,
          lowercase: true,
          validate: {
            validator: hasValidCharacters,
            message: VALIDATION.KEYWORDS.INVALID
          }
        }],
        validate: [{
          validator: (keywords) => keywords.length <= VALIDATION.KEYWORDS.MAX_COUNT,
          message: VALIDATION.KEYWORDS.TOO_MANY
        }]
      }
    },
    
    isActive: {
      type: Boolean,
      default: true
    },
    
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Category must have a creator']
    },
    
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    toJSON: { 
      virtuals: true,
      transform: (doc, ret) => {
        const transformed = { ...ret };
        delete transformed.__v;
        delete transformed._id;
        
        if (transformed.seo) {
          delete transformed.seo._id;
        }
        
        return transformed;
      }
    },
    toObject: { 
      virtuals: true,
      transform: (doc, ret) => {
        const transformed = ret;
        delete transformed.__v;
        return transformed;
      }
    }
  }
);

// Add indexes for better query performance
newsCategorySchema.index({ name: 'text', description: 'text' });
newsCategorySchema.index({ slug: 1 }, { unique: true });
newsCategorySchema.index({ parent: 1 });
newsCategorySchema.index({ featured: 1, featuredOrder: 1 });

/**
 * Pre-save hook to generate slug from name
 */
newsCategorySchema.pre('save', function preSave(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

/**
 * Get categories with news count
 * @param {Object} options - Query options
 * @param {boolean} [options.includeInactive=false] - Include inactive categories
 * @param {boolean} [options.onlyFeatured=false] - Only include featured categories
 * @returns {Promise<Array>} Array of categories with news count
 */
newsCategorySchema.statics.getCategoriesWithCount = async function getCategoriesWithCount(
  { includeInactive = false, onlyFeatured = false } = {}
) {
  const match = {};
  
  if (!includeInactive) {
    match.isActive = true;
  }
  
  if (onlyFeatured) {
    match.featured = true;
  }
  
  return this.aggregate([
    { $match: match },
    {
      $lookup: {
        from: 'news',
        localField: '_id',
        foreignField: 'category',
        as: 'newsItems'
      }
    },
    {
      $project: {
        name: 1,
        slug: 1,
        description: 1,
        parent: 1,
        featured: 1,
        featuredOrder: 1,
        icon: 1,
        coverImage: 1,
        isActive: 1,
        newsCount: { $size: '$newsItems' }
      }
    },
    { $sort: { featuredOrder: 1, name: 1 } }
  ]);
};

/**
 * Get category hierarchy with nested subcategories
 * @returns {Promise<Array>} Array of categories with nested subcategories
 */
newsCategorySchema.statics.getCategoryHierarchy = async function getCategoryHierarchy() {
  const categories = await this.find({ isActive: true })
    .select('name slug parent featured featuredOrder')
    .sort({ featuredOrder: 1, name: 1 })
    .lean();

  const categoryMap = {};
  const rootCategories = [];
  
  // First pass: create a map of all categories
  categories.forEach((category) => {
    category.subcategories = [];
    categoryMap[category._id] = category;
  });
  
  // Second pass: build the hierarchy
  categories.forEach((category) => {
    if (category.parent && categoryMap[category.parent]) {
      categoryMap[category.parent].subcategories.push(category);
    } else {
      rootCategories.push(category);
    }
  });
  
  return rootCategories;
};

module.exports = mongoose.model('NewsCategory', newsCategorySchema);
