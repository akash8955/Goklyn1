const Album = require('../models/Album');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all albums
// @route   GET /api/v1/gallery/albums
// @access  Public
exports.getAlbums = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single album
// @route   GET /api/v1/gallery/albums/:id
// @access  Public
exports.getAlbum = asyncHandler(async (req, res, next) => {
  const album = await Album.findById(req.params.id).populate({
    path: 'items',
    select: 'title description imageUrl mediaType'
  });

  if (!album) {
    return next(
      new ErrorResponse(`Album not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: album
  });
});

// @desc    Create new album
// @route   POST /api/v1/gallery/albums
// @access  Private/Admin/Publisher
exports.createAlbum = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.createdBy = req.user.id;

  const album = await Album.create(req.body);

  res.status(201).json({
    success: true,
    data: album
  });
});

// @desc    Update album
// @route   PUT /api/v1/gallery/albums/:id
// @access  Private/Admin/Publisher
exports.updateAlbum = asyncHandler(async (req, res, next) => {
  let album = await Album.findById(req.params.id);

  if (!album) {
    return next(
      new ErrorResponse(`Album not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is album owner or admin
  if (album.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this album`,
        401
      )
    );
  }

  // Update album
  album = await Album.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: album
  });
});

// @desc    Delete album
// @route   DELETE /api/v1/gallery/albums/:id
// @access  Private/Admin/Publisher
exports.deleteAlbum = asyncHandler(async (req, res, next) => {
  const album = await Album.findById(req.params.id);

  if (!album) {
    return next(
      new ErrorResponse(`Album not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is album owner or admin
  if (album.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this album`,
        401
      )
    );
  }

  await album.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});
