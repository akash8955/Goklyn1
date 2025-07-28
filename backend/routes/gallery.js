const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/galleryController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../utils/multer');
const advancedResults = require('../middleware/advancedResults');
const Album = require('../models/Album');

// --- Public Routes ---
router
  .route('/')
  .get(galleryController.getAllGalleryItems);

router.get('/albums', 
  advancedResults(Album, { path: 'items', select: 'title description imageUrl mediaType' }), 
  galleryController.getAlbums
);

router.get('/albums/:id', galleryController.getAlbum);
router.get('/albums/:id/items', galleryController.getAlbumItems);

router
  .route('/:id')
  .get(galleryController.getGalleryItem);

// --- Protected Routes ---
router.use(protect);

// --- Gallery Item Management ---
const uploadSingle = upload('file');
const uploadMultipleFiles = upload('files', 50);

router
  .route('/')
  .post(
    uploadSingle,
    authorize('admin', 'publisher'),
    galleryController.createGalleryItem
  )
  .delete(authorize('admin'), galleryController.deleteMultipleGalleryItems);

router.post(
  '/bulk',
  authorize('admin', 'publisher'),
  uploadMultipleFiles,
  galleryController.bulkUploadGalleryItems
);

router
  .route('/:id')
  .put(
    authorize('admin', 'publisher'),
    uploadSingle,
    galleryController.updateGalleryItem
  )
  .delete(authorize('admin'), galleryController.deleteGalleryItem);

router
  .route('/:id/featured')
  .patch(authorize('admin'), galleryController.toggleFeatured);

// --- Album Management ---
const uploadCoverImage = upload('coverImage');

router
  .route('/albums')
  .post(
    authorize('admin', 'publisher'),
    uploadCoverImage,
    galleryController.createAlbum
  );

router
  .route('/albums/:id')
  .put(
    authorize('admin', 'publisher'),
    uploadCoverImage,
    galleryController.updateAlbum
  )
  .delete(authorize('admin'), galleryController.deleteAlbum);

module.exports = router;
