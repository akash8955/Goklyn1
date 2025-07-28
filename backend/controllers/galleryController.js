const mongoose = require('mongoose');
const GalleryItem = require('../models/gallery.model');
const Album = require('../models/Album');
const { promisify } = require('util');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const ffmpeg = require('fluent-ffmpeg');
const ffprobe = promisify(ffmpeg.ffprobe);
const exifr = require('exifr');

// Initialize controller object
const galleryController = {};

// Helper function to extract metadata from media file
const extractMetadata = async (filePath, mediaType) => {
  try {
    const metadata = {};
    
    if (mediaType === 'image') {
      const image = sharp(filePath);
      const meta = await image.metadata();
      
      metadata.width = meta.width;
      metadata.height = meta.height;
      metadata.format = meta.format;
      metadata.size = (await fs.stat(filePath)).size;
      metadata.aspectRatio = meta.width / meta.height;
      
      // Extract EXIF data
      const exifData = await exifr.parse(filePath);
      if (exifData) {
        metadata.exif = {
          cameraMake: exifData.Make,
          cameraModel: exifData.Model,
          focalLength: exifData.FocalLength ? `${exifData.FocalLength}mm` : null,
          aperture: exifData.FNumber ? `f/${exifData.FNumber}` : null,
          shutterSpeed: exifData.ExposureTime ? `${exifData.ExposureTime}s` : null,
          iso: exifData.ISO,
          takenAt: exifData.DateTimeOriginal || exifData.CreateDate,
          location: exifData.latitude && exifData.longitude ? {
            type: 'Point',
            coordinates: [exifData.longitude, exifData.latitude],
            name: exifData.GPSAreaInformation || null
          } : null
        };
      }
    } else if (mediaType === 'video') {
      const probeData = await ffprobe(filePath);
      const videoStream = probeData.streams.find(s => s.codec_type === 'video');
      
      if (videoStream) {
        metadata.width = videoStream.width;
        metadata.height = videoStream.height;
        metadata.duration = Math.floor(parseFloat(probeData.format.duration));
        metadata.format = path.extname(filePath).replace('.', '');
        metadata.size = (await fs.stat(filePath)).size;
        metadata.aspectRatio = videoStream.display_aspect_ratio;
      }
    }
    
    return metadata;
  } catch (error) {
    console.error('Error extracting metadata:', error);
    return {};
  }
};

// Helper function to generate thumbnail
const generateThumbnail = async (filePath, mediaType) => {
  try {
    const thumbnailPath = path.join('/tmp', `thumb-${Date.now()}.jpg`);
    
    if (mediaType === 'image') {
      await sharp(filePath)
        .resize(300, 200, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);
    } else if (mediaType === 'video') {
      await new Promise((resolve, reject) => {
        ffmpeg(filePath)
          .screenshots({
            timestamps: ['10%'],
            filename: 'thumbnail-%i.jpg',
            folder: '/tmp',
            size: '300x200'
          })
          .on('end', () => {
            fs.rename('/tmp/thumbnail-1.jpg', thumbnailPath).then(resolve).catch(reject);
          })
          .on('error', reject);
      });
    }
    
    return thumbnailPath;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return null;
  }
};

// @desc    Get all albums with pagination
// @route   GET /api/gallery/albums
// @access  Public
galleryController.getAlbums = catchAsync(async (req, res, next) => {
  const albums = await Album.find({})
    .populate('coverImage', 'url')
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    count: albums.length,
    data: albums
  });
});

// @desc    Create a new album
// @route   POST /api/gallery/albums
// @access  Private/Admin
galleryController.createAlbum = catchAsync(async (req, res, next) => {
  const { title, description } = req.body;
  
  const album = await Album.create({
    title,
    description,
    createdBy: req.user.id
  });
  
  res.status(201).json({
    success: true,
    data: album
  });
});

// @desc    Get a single album
// @route   GET /api/gallery/albums/:id
// @access  Public
galleryController.getAlbum = catchAsync(async (req, res, next) => {
  const album = await Album.findById(req.params.id)
    .populate('coverImage', 'url')
    .populate('items', 'title description url mediaType');
  
  if (!album) {
    return next(new ApiError('Album not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: album
  });
});

// @desc    Update an album
// @route   PUT /api/gallery/albums/:id
// @access  Private/Admin
galleryController.updateAlbum = catchAsync(async (req, res, next) => {
  const { title, description, coverImage } = req.body;
  
  const album = await Album.findByIdAndUpdate(
    req.params.id,
    { title, description, coverImage },
    { new: true, runValidators: true }
  );
  
  if (!album) {
    return next(new ApiError('Album not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: album
  });
});

// @desc    Delete an album
// @route   DELETE /api/gallery/albums/:id
// @access  Private/Admin
galleryController.deleteAlbum = catchAsync(async (req, res, next) => {
  const album = await Album.findByIdAndDelete(req.params.id);
  
  if (!album) {
    return next(new ApiError('Album not found', 404));
  }
  
  // TODO: Delete all items in the album
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get all gallery items with filtering and pagination
// @route   GET /api/gallery
// @access  Public
galleryController.getAllGalleryItems = catchAsync(async (req, res, next) => {
  try {
    const { category, featured, status, search, album, mediaType, page = 1, limit = 12, sort = '-createdAt' } = req.query;

    // Build query
    const query = {};
    
    // Only show published items to non-admin users
    if (req.user?.role !== 'admin') {
      query.status = 'published';
    } else if (status) {
      query.status = status;
    }

    // Add filters
    if (category) query.category = category;
    if (featured) query.isFeatured = featured === 'true';
    if (album) query.album = album;
    if (mediaType) query.mediaType = mediaType;

    // Handle text search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Execute query with pagination
    const items = await GalleryItem.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('album', 'title')
      .populate('createdBy', 'name email');

    // Get total count for pagination
    const total = await GalleryItem.countDocuments(query);

    res.status(200).json({
      success: true,
      count: items.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: items
    });
  } catch (error) {
    console.error('Error in getAllGalleryItems:', error);
    next(new ApiError('Failed to fetch gallery items', 500));
  }
});

// @desc    Get a single gallery item
// @route   GET /api/gallery/:id
// @access  Public
galleryController.getGalleryItem = catchAsync(async (req, res, next) => {
  const item = await GalleryItem.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  )
  .populate('album', 'title')
  .populate('createdBy', 'name email');
  
  if (!item) {
    return next(new ApiError('Gallery item not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: item
  });
});

// @desc    Create a new gallery item
// @route   POST /api/gallery
// @access  Private/Admin
galleryController.createGalleryItem = catchAsync(async (req, res, next) => {
  const { title, description, album, isFeatured, status, tags } = req.body;
  
  // Handle file upload
  if (!req.file) {
    return next(new ApiError('Please upload a file', 400));
  }
  
  // Determine media type
  const fileType = req.file.mimetype.split('/')[0];
  const mediaType = fileType === 'image' ? 'image' : 'video';
  
  // Extract metadata
  const metadata = await extractMetadata(req.file.path, mediaType);
  
  // Generate thumbnail
  const thumbnailPath = await generateThumbnail(req.file.path, mediaType);
  let thumbnailUrl = null;
  
  if (thumbnailPath) {
    const thumbnailResult = await uploadToCloudinary(thumbnailPath, 'gallery/thumbnails');
    thumbnailUrl = thumbnailResult.secure_url;
    
    // Clean up temp file
    await fs.unlink(thumbnailPath).catch(console.error);
  }
  
  // Upload main file to cloudinary
  const result = await uploadToCloudinary(req.file.path, 'gallery');
  
  // Create gallery item
  const galleryItem = await GalleryItem.create({
    title,
    description,
    album,
    isFeatured: isFeatured === 'true',
    status: status || 'published',
    mediaType,
    url: result.secure_url,
    thumbnailUrl,
    metadata,
    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
    createdBy: req.user.id
  });
  
  // Clean up temp file
  await fs.unlink(req.file.path).catch(console.error);
  
  res.status(201).json({
    success: true,
    data: galleryItem
  });
});

// @desc    Update a gallery item
// @route   PUT /api/gallery/:id
// @access  Private/Admin
galleryController.updateGalleryItem = catchAsync(async (req, res, next) => {
  const { title, description, album, isFeatured, status, tags } = req.body;
  
  const updateData = {
    title,
    description,
    album,
    isFeatured: isFeatured === 'true',
    status: status || 'published',
    tags: tags ? tags.split(',').map(tag => tag.trim()) : []
  };
  
  // Handle file upload if provided
  if (req.file) {
    // Delete old file from cloudinary
    const item = await GalleryItem.findById(req.params.id);
    if (item && item.publicId) {
      await deleteFromCloudinary(item.publicId);
    }
    
    // Upload new file
    const result = await uploadToCloudinary(req.file.path, 'gallery');
    updateData.url = result.secure_url;
    updateData.publicId = result.public_id;
    
    // Generate new thumbnail
    const fileType = req.file.mimetype.split('/')[0];
    const mediaType = fileType === 'image' ? 'image' : 'video';
    const thumbnailPath = await generateThumbnail(req.file.path, mediaType);
    
    if (thumbnailPath) {
      const thumbnailResult = await uploadToCloudinary(thumbnailPath, 'gallery/thumbnails');
      updateData.thumbnailUrl = thumbnailResult.secure_url;
      
      // Clean up temp file
      await fs.unlink(thumbnailPath).catch(console.error);
    }
    
    // Clean up temp file
    await fs.unlink(req.file.path).catch(console.error);
  }
  
  const updatedItem = await GalleryItem.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );
  
  if (!updatedItem) {
    return next(new ApiError('Gallery item not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: updatedItem
  });
});

// @desc    Delete a gallery item
// @route   DELETE /api/gallery/:id
// @access  Private/Admin
galleryController.deleteGalleryItem = catchAsync(async (req, res, next) => {
  const item = await GalleryItem.findById(req.params.id);
  
  if (!item) {
    return next(new ApiError('Gallery item not found', 404));
  }
  
  // Delete file from cloudinary
  if (item.publicId) {
    await deleteFromCloudinary(item.publicId);
  }
  
  // Delete thumbnail if exists
  if (item.thumbnailPublicId) {
    await deleteFromCloudinary(item.thumbnailPublicId);
  }
  
  await item.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Toggle featured status of a gallery item
// @route   PATCH /api/gallery/:id/featured
// @access  Private/Admin
galleryController.toggleFeatured = catchAsync(async (req, res, next) => {
  const item = await GalleryItem.findById(req.params.id);
  
  if (!item) {
    return next(new ApiError('Gallery item not found', 404));
  }
  
  item.isFeatured = !item.isFeatured;
  await item.save();
  
  res.status(200).json({
    success: true,
    data: item
  });
});

// @desc    Get all items in an album
// @route   GET /api/gallery/albums/:id/items
// @access  Public
galleryController.getAlbumItems = catchAsync(async (req, res, next) => {
  const { sort = '-createdAt', page = 1, limit = 12 } = req.query;
  
  // Check if album exists and is public
  const album = await Album.findById(req.params.id);
  if (!album) {
    return next(new ApiError('Album not found', 404));
  }
  
  // Build query
  const query = { album: req.params.id };
  
  // Only show published items to non-admin users
  if (req.user?.role !== 'admin') {
    query.status = 'published';
  }
  
  // Execute query with pagination
  const items = await GalleryItem.find(query)
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('createdBy', 'name email');
  
  // Get total count for pagination
  const total = await GalleryItem.countDocuments(query);
  
  res.status(200).json({
    success: true,
    count: items.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: items
  });
});

// @desc    Upload multiple gallery items
// @route   POST /api/gallery/bulk
// @access  Private/Admin
galleryController.bulkUploadGalleryItems = catchAsync(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new ApiError('Please upload files', 400));
  }
  
  const { album } = req.body;
  const uploadedItems = [];
  
  // Process files in parallel with a concurrency limit
  const concurrencyLimit = 5;
  const processFile = async (file) => {
    try {
      const fileType = file.mimetype.split('/')[0];
      const mediaType = fileType === 'image' ? 'image' : 'video';
      
      // Extract metadata
      const metadata = await extractMetadata(file.path, mediaType);
      
      // Generate thumbnail
      const thumbnailPath = await generateThumbnail(file.path, mediaType);
      let thumbnailUrl = null;
      
      if (thumbnailPath) {
        const thumbnailResult = await uploadToCloudinary(thumbnailPath, 'gallery/thumbnails');
        thumbnailUrl = thumbnailResult.secure_url;
        
        // Clean up temp file
        await fs.unlink(thumbnailPath).catch(console.error);
      }
      
      // Upload main file to cloudinary
      const result = await uploadToCloudinary(file.path, 'gallery');
      
      // Create gallery item
      const galleryItem = await GalleryItem.create({
        title: path.parse(file.originalname).name,
        album,
        mediaType,
        url: result.secure_url,
        thumbnailUrl,
        metadata,
        createdBy: req.user.id
      });
      
      uploadedItems.push(galleryItem);
      
      // Clean up temp file
      await fs.unlink(file.path).catch(console.error);
      
      return galleryItem;
    } catch (error) {
      console.error(`Error processing file ${file.originalname}:`, error);
      return null;
    }
  };
  
  // Process files in batches
  for (let i = 0; i < req.files.length; i += concurrencyLimit) {
    const batch = req.files.slice(i, i + concurrencyLimit);
    await Promise.all(batch.map(processFile));
  }
  
  res.status(201).json({
    success: true,
    count: uploadedItems.length,
    data: uploadedItems
  });
});

// @desc    Delete multiple gallery items
// @route   DELETE /api/gallery
// @access  Private/Admin
galleryController.deleteMultipleGalleryItems = catchAsync(async (req, res, next) => {
  const { ids } = req.body;
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return next(new ApiError('Please provide an array of gallery item IDs to delete', 400));
  }
  
  // Find all items to be deleted
  const items = await GalleryItem.find({ _id: { $in: ids } });
  
  // Delete files from cloudinary
  const deletePromises = items.map(async (item) => {
    if (item.publicId) {
      await deleteFromCloudinary(item.publicId);
    }
    if (item.thumbnailPublicId) {
      await deleteFromCloudinary(item.thumbnailPublicId);
    }
    return item.remove();
  });
  
  await Promise.all(deletePromises);
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

module.exports = galleryController;
