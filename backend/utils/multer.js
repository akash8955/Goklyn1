const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ApiError = require('./ApiError');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter for images
const imageFilter = (req, file, cb) => {
  try {
    // Check file type
    const filetypes = /jpeg|jpg|png|webp|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      const error = new ApiError(
        'Only image files (jpeg, jpg, png, webp, gif) are allowed!',
        400
      );
      return cb(error, false);
    }
  } catch (error) {
    return cb(error, false);
  }
};

// File size limit (5MB)
const limits = {
  fileSize: 5 * 1024 * 1024 // 5MB
};

// Configure multer with error handling
const fileUpload = (fieldName, fileCount = 1) => {
  console.log(`[Multer] Setting up upload for field: "${fieldName}"`);
  const upload = multer({
    storage,
    fileFilter: imageFilter,
    limits
  });

  if (fileCount > 1) {
    return (req, res, next) => {
      console.log('[Multer] Processing multiple files...');
      const uploadFiles = upload.array(fieldName, fileCount);
      uploadFiles(req, res, function (err) {
        console.log('[Multer] Multiple files upload result:', { err, files: req.files });
        handleUploadError(err, req, res, next);
      });
    };
  } else {
    return (req, res, next) => {
      console.log(`[Multer] Processing single file for field: "${fieldName}"`);
      const uploadFile = upload.single(fieldName);
      uploadFile(req, res, function (err) {
        console.log('[Multer] Single file upload result:', { 
          err, 
          file: req.file,
          body: req.body,
          headers: req.headers
        });
        handleUploadError(err, req, res, next);
      });
    };
  }
};

// Handle upload errors
const handleUploadError = (err, req, res, next) => {
  console.log('[Multer] handleUploadError called with:', { 
    error: err?.message || err,
    file: req.file,
    files: req.files,
    body: req.body
  });

  if (err) {
    // Log the specific error code and message
    console.error('[Multer] Upload error:', {
      code: err.code,
      message: err.message,
      stack: err.stack
    });

    // Clean up any uploaded files if there was an error
    if (req.file) {
      console.log(`[Multer] Cleaning up file: ${req.file.path}`);
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error('[Multer] Error cleaning up file:', unlinkErr);
      });
    } else if (req.files) {
      console.log(`[Multer] Cleaning up ${req.files.length} files`);
      req.files.forEach(file => {
        fs.unlink(file.path, (unlinkErr) => {
          if (unlinkErr) console.error('[Multer] Error cleaning up file:', unlinkErr);
        });
      });
    }

    // Handle specific multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      console.error('[Multer] File size exceeds limit');
      return next(new ApiError('File size exceeds 5MB limit', 400));
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      console.error('[Multer] Too many files uploaded');
      return next(new ApiError('Too many files uploaded', 400));
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      console.error('[Multer] Unexpected field in file upload');
      console.error('[Multer] Expected field name should be:', req.uploadFieldName);
      return next(new ApiError(`Unexpected field in file upload. Expected field: ${req.uploadFieldName}`, 400));
    } else if (err instanceof ApiError) {
      console.error('[Multer] API Error:', err.message);
      return next(err);
    } else {
      console.error('[Multer] Unknown upload error:', err);
      return next(new ApiError(`File upload error: ${err.message || 'Unknown error'}`, 400));
    }
  }
  
  console.log('[Multer] No errors, proceeding to next middleware');
  next();
};

// Middleware to clean up uploaded files after request is complete
const cleanupUploads = (req, res, next) => {
  // Skip if no files were uploaded
  if (!req.file && (!req.files || req.files.length === 0)) {
    return next();
  }

  // Store the original send function
  const originalSend = res.send;

  // Override the send function to clean up files after the response is sent
  res.send = function (body) {
    // Clean up files after the response is sent
    res.on('finish', () => {
      // Handle single file
      if (req.file && req.file.path) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error cleaning up file:', err);
        });
      }
      
      // Handle multiple files
      if (req.files && Array.isArray(req.files)) {
        req.files.forEach(file => {
          if (file.path) {
            fs.unlink(file.path, (err) => {
              if (err) console.error('Error cleaning up file:', err);
            });
          }
        });
      }
    });

    // Call the original send function
    return originalSend.call(this, body);
  };

  next();
};

module.exports = {
  upload: fileUpload,
  cleanupUploads
};
