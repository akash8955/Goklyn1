const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../utils/multer');

// Debug: Log all controller methods that are being used
const requiredHandlers = [
  'getAllNews',
  'getCategories',
  'getNewsBySlug',
  'getRelatedArticles',
  'createArticle',
  'updateArticle',
  'deleteArticle',
  'toggleFeatured'
];

// Verify all required handlers exist
const missingHandlers = requiredHandlers.filter(handler => !newsController[handler]);
if (missingHandlers.length > 0) {
  console.error('❌ Missing required handlers in newsController:', missingHandlers.join(', '));
  throw new Error(`Missing required handlers in newsController: ${missingHandlers.join(', ')}`);
}

console.log('✅ All required news handlers are available');

const uploadSingle = upload('featuredImage');

// Public routes
router.get('/', newsController.getAllNews);
router.get('/categories', newsController.getCategories);
router.get('/:slug', newsController.getNewsBySlug);
router.get('/:id/related', newsController.getRelatedArticles);

// Protected routes (require authentication)
router.use(protect);

// Author and Admin routes
router.post('/', uploadSingle, newsController.createArticle);
router.put('/:id', uploadSingle, newsController.updateArticle);
router.delete('/:id', newsController.deleteArticle);

// Admin-only routes
router.use(authorize('admin'));
router.patch('/:id/featured', newsController.toggleFeatured);

module.exports = router;
