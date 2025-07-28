const Project = require('../models/Project');
const { AppError } = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const httpStatus = require('http-status');
const { deleteFromCloudinary } = require('../utils/cloudinary');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
exports.getAllProjects = catchAsync(async (req, res, next) => {
  const projects = await Project
    .find()
    .sort('-createdAt')
    .select('-__v');

  res.status(httpStatus.OK).json({
    status: 'success',
    results: projects.length,
    data: {
      projects,
    },
  });
});

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Public
exports.getProjectById = catchAsync(async (req, res, next) => {
  const project = await Project
    .findById(req.params.id)
    .select('-__v');

  if (!project) {
    return next(new AppError('No project found with that ID', httpStatus.NOT_FOUND));
  }

  res.status(httpStatus.OK).json({
    status: 'success',
    data: {
      project,
    },
  });
});

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private/Admin
// @body    {string} title - Project title (required)
// @body    {string} description - Project description (required)
// @body    {string} [techStack] - Comma-separated list of technologies
// @body    {string} [demoUrl] - URL to the live demo
// @body    {string} [githubUrl] - URL to the GitHub repository
// @body    {file} [photo] - Project thumbnail image
// @body    {array} [screenshots] - Array of project screenshots
// @body    {date} [startDate] - Project start date
// @body    {date} [endDate] - Project end date
// @body    {boolean} [featured=false] - Whether the project is featured
exports.createProject = catchAsync(async (req, res, next) => {
  const {
    title,
    description,
    techStack,
    demoUrl,
    githubUrl,
    startDate,
    endDate,
    featured = false,
  } = req.body;

  // Process tech stack
  const techStackArray = techStack ? techStack.split(',').map(tech => tech.trim()) : [];

  const projectData = {
    title,
    description,
    techStack: techStackArray,
    demoUrl,
    githubUrl,
    status,
    startDate,
    endDate,
    featured,
  };

  // Add photo if uploaded
  if (req.file) {
    projectData.photo = req.file.path;
  }

  const project = await Project.create(projectData);

  res.status(httpStatus.CREATED).json({
    status: 'success',
    data: {
      project,
    },
  });
});

// @desc    Update a project
// @route   PATCH /api/projects/:id
// @access  Private/Admin
exports.updateProject = catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return next(new AppError('No project found with that ID', httpStatus.NOT_FOUND));
  }

  // Update allowed fields
  const allowedFields = [
    'title',
    'description',
    'techStack',
    'demoUrl',
    'githubUrl',
    'status',
    'startDate',
    'endDate',
    'featured',
  ];

  // Update fields that are in the request body
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      if (key === 'techStack' && typeof req.body.techStack === 'string') {
        project.techStack = req.body.techStack.split(',').map(tech => tech.trim());
      } else {
        project[key] = req.body[key];
      }
    }
  });

  // Handle photo update if a new one is uploaded
  if (req.file) {
    // Delete old photo from Cloudinary if it exists
    if (project.photo) {
      await deleteFromCloudinary(project.photo);
    }
    project.photo = req.file.path;
  }

  const updatedProject = await project.save();

  res.status(httpStatus.OK).json({
    status: 'success',
    data: {
      project: updatedProject,
    },
  });
});

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
exports.deleteProject = catchAsync(async (req, res, next) => {
  console.log('Starting project deletion for ID:', req.params.id);
  
  try {
    // First find the project to get the image URLs
    const project = await Project.findById(req.params.id);
    console.log('Project found:', !!project);

    if (!project) {
      console.log('Project not found, returning 404');
      return next(new AppError('No project found with that ID', httpStatus.NOT_FOUND));
    }

    // Store the image URLs before deleting the project
    const photoToDelete = project.photo;
    const screenshotsToDelete = project.screenshots || [];

    // Delete the project from the database first
    console.log('Deleting project from database...');
    await Project.findByIdAndDelete(req.params.id);
    console.log('Successfully deleted project from database');

    // Delete images from Cloudinary in the background
    (async () => {
      try {
        // Delete main photo if it exists
        if (photoToDelete) {
          console.log('Deleting project photo from Cloudinary:', photoToDelete);
          await deleteFromCloudinary(photoToDelete);
          console.log('Successfully deleted project photo');
        }

        // Delete screenshots if they exist
        if (screenshotsToDelete.length > 0) {
          console.log(`Deleting ${screenshotsToDelete.length} screenshots`);
          await Promise.all(
            screenshotsToDelete.map(async (screenshot, index) => {
              console.log(`Deleting screenshot ${index + 1}`);
              await deleteFromCloudinary(screenshot);
              console.log(`Successfully deleted screenshot ${index + 1}`);
            })
          );
          console.log('Successfully deleted all screenshots');
        }
      } catch (error) {
        // Log Cloudinary errors but don't fail the request
        console.error('Error in background Cloudinary cleanup:', error);
      }
    })();

    console.log('Sending success response');
    res.status(httpStatus.NO_CONTENT).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    console.error('Error in deleteProject controller:', {
      message: error.message,
      stack: error.stack,
      time: new Date().toISOString()
    });
    next(error);
  }
});
