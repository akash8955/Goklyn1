const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const { protect, isAdminOrSubAdmin, isAdmin } = require('../middleware/auth');
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/project.controller');
const AppError = require('../utils/appError');

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'gollywood-portfolio/projects',
    allowed_formats: ['jpeg', 'jpg', 'png', 'gif'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }],
    use_filename: true,
    unique_filename: true
  },
});

// Configure multer for file uploads
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new AppError('Only image files are allowed!', 400), false);
    }
  }
});

/**
 * @route   GET /api/projects
 * @desc    Get all projects (public)
 * @access  Public
 */
router.get('/', getAllProjects);

/**
 * @route   GET /api/projects/:id
 * @desc    Get a single project by ID (public)
 * @access  Public
 */
router.get('/:id', getProjectById);

// Protect all routes after this middleware
router.use(protect);

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private/Admin
 */
router.post(
  '/',
  isAdminOrSubAdmin,
  upload.single('photo'),
  createProject
);

/**
 * @route   PATCH /api/projects/:id
 * @desc    Update a project
 * @access  Private/Admin
 */
router.patch(
  '/:id',
  isAdminOrSubAdmin,
  upload.single('photo'),
  updateProject
);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete a project
 * @access  Private/Admin
 */
router.delete(
  '/:id',
  isAdmin,
  deleteProject
);

module.exports = router;
