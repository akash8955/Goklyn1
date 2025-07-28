const express = require('express');
const multer = require('multer');
const path = require('path');
const { storage: cloudinaryStorage } = require('../config/cloudinary'); // Cloudinary storage for images
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

const router = express.Router();

// === Cloudinary Image Upload Setup ===
const multerCloudinary = require('multer');
const imageUpload = multerCloudinary({ storage: cloudinaryStorage });

// New route for uploading images to Cloudinary (for News & Gallery)
router.post('/image', imageUpload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Image upload failed. Please try again.' });
  }
  // On success, Cloudinary provides the URL in req.file.path
  res.status(201).json({
    message: 'Image uploaded successfully!',
    url: req.file.path,
  });
});


const storage = multer.memoryStorage();

function checkFileType(file, cb) {
  const filetypes = /pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: PDFs Only!');
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 2000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).single('resume');

router.post('/resume', (req, res) => {
  console.log('Upload request received. Checking file...');
  
  upload(req, res, async (err) => {
    if (err) {
      console.error('Multer upload error:', err);
      return res.status(400).json({ 
        success: false,
        error: 'File upload failed',
        details: err.toString() 
      });
    }
    
    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({ 
        success: false,
        error: 'No file selected or file is too large (max 2MB)'
      });
    }
    try {
      // Debug: log file details
      console.log('Received file:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      });
      console.log('Buffer length:', req.file.buffer.length);
      // Check PDF signature before uploading
      const pdfSignature = req.file.buffer.slice(0, 4).toString();
            if (pdfSignature !== '%PDF') {
                return res.status(400).json({ msg: 'Uploaded file is not a valid PDF.' });
            }

            console.log('Starting Cloudinary upload...');
            const public_id = `${path.parse(req.file.originalname).name}-${Date.now()}`;
            
            console.log('Uploading to folder: goklyn-portfolio/resumes');
            console.log('Public ID:', public_id);
            
            // Create a promise to handle the upload
            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'raw',
                        folder: 'goklyn-portfolio/resumes',
                        public_id: public_id,
                        type: 'upload',
                        format: 'pdf'
                    },
                    (error, result) => {
                        if (error) {
                            console.error('Cloudinary upload error:', error);
                            reject(error);
                        } else {
                            console.log('Cloudinary upload successful:', {
                                url: result.secure_url,
                                public_id: result.public_id,
                                format: result.format
                            });
                            resolve(result);
                        }
                    }
                );
                
                // Handle stream errors
                uploadStream.on('error', (error) => {
                    console.error('Upload stream error:', error);
                    reject(new Error('Failed to process file upload'));
                });
                
                // Pipe the file buffer to the upload stream
                streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
            });
            
            // If we get here, upload was successful
            return res.status(200).json({
                success: true,
                message: 'File uploaded successfully',
                url: uploadResult.secure_url,
                public_id: uploadResult.public_id,
                format: uploadResult.format,
                created_at: uploadResult.created_at
            });
        } catch (e) {
            return res.status(500).json({ msg: 'Server error uploading file', error: e.message });
        }
    });
});

module.exports = router;
