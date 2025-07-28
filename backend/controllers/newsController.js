const News = require('../models/news.model');
const NewsCategory = require('../models/newsCategory.model');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const httpStatus = require('http-status');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const slugify = require('slugify');
const logger = require('../config/logger');

// Helper function to generate slug from title
const generateSlug = (title) => {
  return slugify(title, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
};

// @desc    Get all news articles
// @route   GET /api/news
// @access  Public
exports.getAllNews = catchAsync(async (req, res, next) => {
  const startTime = Date.now();
  logger.info('[News] Starting to fetch news articles', { query: req.query });
  
  try {
    const { category, status, search, tag, featured, author, fields } = req.query;
    
    // Build query
    const query = {};
    
    // Only show published articles to non-admin users
    if (req.user?.role !== 'admin') {
      query.status = 'published';
      query.publishedAt = { $lte: new Date() };
      logger.debug('[News] Non-admin access - filtering published articles only');
    } else if (status) {
      query.status = status;
    }
    
    // Add filters
    if (category) query.category = category;
    if (featured) query['meta.isFeatured'] = featured === 'true';
    if (author) query.author = author;
    if (tag) query.tags = tag;
    
    // Handle text search
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      query.$or = [
        { title: searchRegex },
        { excerpt: searchRegex },
        { content: searchRegex }
      ];
      logger.debug('[News] Adding regex search filter', { search });
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100); // Max 100 items per page
    const skip = (page - 1) * limit;
    
    // Field selection
    const selectFields = fields ? fields.split(',').join(' ') : '';
    
    // Sorting - default to most recent first
    let sort = { publishedAt: -1, _id: -1 };
    if (req.query.sort) {
      sort = {};
      sort[req.query.sort] = req.query.order === 'asc' ? 1 : -1;
    }
    
    logger.debug('[News] Executing database query', { query, sort, skip, limit });
    
    // Execute queries in parallel
    const [articles, total] = await Promise.all([
      News.find(query)
        .select(selectFields)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('author', 'name email avatar')
        .lean()
        .maxTimeMS(10000), // 10 second timeout
      
      News.countDocuments(query)
        .maxTimeMS(5000) // 5 second timeout for count
    ]);
    
    const totalPages = Math.ceil(total / limit);
    const duration = Date.now() - startTime;
    
    logger.info(`[News] Fetched ${articles.length} of ${total} articles in ${duration}ms`, {
      queryTime: duration,
      page,
      limit,
      totalPages
    });
    
    // Set cache headers
    res.set('Cache-Control', 'public, max-age=60'); // Cache for 1 minute
    
    // Increment view count for each article (non-blocking)
    if (req.query.trackView === 'true') {
      const articleIds = articles.map(article => article._id);
      News.updateMany(
        { _id: { $in: articleIds } },
        { $inc: { 'meta.views': 1 } }
      ).catch(err => {
        logger.error('[News] Error updating view counts', { error: err.message });
      });
    }
    
    res.status(httpStatus.OK).json({
      success: true,
      count: articles.length,
      total,
      totalPages,
      currentPage: page,
      data: articles
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`[News] Error fetching news after ${duration}ms`, {
      error: error.message,
      stack: error.stack,
      query: req.query,
      user: req.user?.id
    });
    
    // Handle specific error types
    if (error.name === 'MongoServerError' && error.code === 50) {
      return next(new ApiError('Database operation timed out', httpStatus.GATEWAY_TIMEOUT));
    }
    
    next(error);
  }
});

// @desc    Get single news article by slug
// @route   GET /api/news/:slug
// @access  Public
exports.getNewsBySlug = catchAsync(async (req, res, next) => {
  const { slug } = req.params;
  const article = await News.findOne({ slug })
    .populate('author', 'name email avatar bio')
    .populate('relatedArticles');
    
  if (!article) {
    return next(new ApiError('Article not found', httpStatus.NOT_FOUND));
  }
  
  // Only show published articles to non-admin users
  if (!req.user?.isAdmin && (article.status !== 'published' || article.publishedAt > new Date())) {
    return next(new ApiError('Article not found', httpStatus.NOT_FOUND));
  }
  
  // Increment view count
  if (req.query.trackView !== 'false') {
    article.meta.views += 1;
    await article.save();
  }
  
  res.status(httpStatus.OK).json({
    success: true,
    data: article
  });
});

// @desc    Create new article
// @route   POST /api/news
// @access  Private/Author & Admin
exports.createArticle = catchAsync(async (req, res, next) => {
  const { title, excerpt, content, category, tags, status, metaTitle, metaDescription, metaKeywords } = req.body;
  
  // Generate slug from title
  const slug = generateSlug(title);
  
  // Check if slug already exists
  const existingArticle = await News.findOne({ slug });
  if (existingArticle) {
    return next(new ApiError('An article with this title already exists', httpStatus.BAD_REQUEST));
  }
  
  // Handle featured image upload
  let featuredImage = '';
  if (req.files?.featuredImage) {
    const result = await uploadToCloudinary(req.files.featuredImage, 'news');
    featuredImage = result.secure_url;
  }
  
  const articleData = {
    title,
    slug,
    excerpt,
    content,
    featuredImage,
    category,
    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
    status: status || 'draft',
    author: req.user.id,
    seo: {
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || (excerpt ? excerpt.substring(0, 160) : ''),
      metaKeywords: metaKeywords ? metaKeywords.split(',').map(kw => kw.trim()) : []
    }
  };
  
  // Set publishedAt if status is published
  if (status === 'published') {
    articleData.publishedAt = new Date();
  }
  
  const article = await News.create(articleData);
  
  res.status(httpStatus.CREATED).json({
    success: true,
    data: article
  });
});

// @desc    Update article
// @route   PUT /api/news/:id
// @access  Private/Author & Admin
exports.updateArticle = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { title, excerpt, content, category, tags, status, metaTitle, metaDescription, metaKeywords } = req.body;
  
  const article = await News.findById(id);
  
  if (!article) {
    return next(new ApiError('Article not found', httpStatus.NOT_FOUND));
  }
  
  // Check if user is the author or admin
  if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ApiError('Not authorized to update this article', httpStatus.FORBIDDEN));
  }
  
  // Update fields
  if (title) {
    article.title = title;
    // Update slug if title changes
    article.slug = generateSlug(title);
  }
  if (excerpt) article.excerpt = excerpt;
  if (content) article.content = content;
  if (category) article.category = category;
  if (tags) article.tags = tags.split(',').map(tag => tag.trim());
  
  // Handle status change
  if (status && ['draft', 'published', 'archived'].includes(status)) {
    article.status = status;
    // Set publishedAt if status changes to published
    if (status === 'published' && article.status !== 'published') {
      article.publishedAt = new Date();
    }
  }
  
  // Update SEO fields
  if (metaTitle) article.seo.metaTitle = metaTitle;
  if (metaDescription) article.seo.metaDescription = metaDescription;
  if (metaKeywords) article.seo.metaKeywords = metaKeywords.split(',').map(kw => kw.trim());
  
  // Handle featured image update
  if (req.files?.featuredImage) {
    // Delete old image if exists
    if (article.featuredImage) {
      await deleteFromCloudinary(article.featuredImage);
    }
    const result = await uploadToCloudinary(req.files.featuredImage, 'news');
    article.featuredImage = result.secure_url;
  }
  
  await article.save();
  
  res.status(httpStatus.OK).json({
    success: true,
    data: article
  });
});

// @desc    Delete article
// @route   DELETE /api/news/:id
// @access  Private/Author & Admin
exports.deleteArticle = catchAsync(async (req, res, next) => {
  const article = await News.findById(req.params.id);
  
  if (!article) {
    return next(new ApiError('Article not found', httpStatus.NOT_FOUND));
  }
  
  // Check if user is the author or admin
  if (article.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ApiError('Not authorized to delete this article', httpStatus.FORBIDDEN));
  }
  
  // Delete featured image if exists
  if (article.featuredImage) {
    await deleteFromCloudinary(article.featuredImage);
  }
  
  await article.remove();
  
  res.status(httpStatus.OK).json({
    success: true,
    data: {}
  });
});

// @desc    Toggle article featured status
// @route   PATCH /api/news/:id/featured
// @access  Private/Admin
exports.toggleFeatured = catchAsync(async (req, res, next) => {
  const article = await News.findById(req.params.id);
  
  if (!article) {
    return next(new ApiError('Article not found', httpStatus.NOT_FOUND));
  }
  
  article.meta.isFeatured = !article.meta.isFeatured;
  await article.save();
  
  res.status(httpStatus.OK).json({
    success: true,
    data: article
  });
});

// @desc    Get related articles
// @route   GET /api/news/:id/related
// @access  Public
exports.getRelatedArticles = catchAsync(async (req, res, next) => {
  const article = await News.findById(req.params.id);
  
  if (!article) {
    return next(new ApiError('Article not found', httpStatus.NOT_FOUND));
  }
  
  const relatedArticles = await News.find({
    _id: { $ne: article._id },
    status: 'published',
    publishedAt: { $lte: new Date() },
    $or: [
      { category: article.category },
      { tags: { $in: article.tags } }
    ]
  })
  .sort({ 'meta.views': -1, publishedAt: -1 })
  .limit(4)
  .select('title slug excerpt featuredImage publishedAt')
  .lean();
  
  res.status(httpStatus.OK).json({
    success: true,
    count: relatedArticles.length,
    data: relatedArticles
  });
});

// @desc    Get article categories
// @route   GET /api/news/categories
// @access  Public
exports.getCategories = catchAsync(async (req, res, next) => {
  // Fetch active categories and optionally populate with article count
  const categories = await NewsCategory.find({ status: 'active' })
    .sort({ name: 1 })
    .select('name slug description featured')
    .lean();
  
  res.status(httpStatus.OK).json({
    success: true,
    count: categories.length,
    data: categories
  });
});
