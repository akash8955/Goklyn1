const router = require('express').Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const Internship = require('../models/internship.model');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'goklyn-portfolio/internships',
    allowed_formats: ['jpeg', 'jpg', 'png', 'gif'],
    transformation: [{ width: 800, height: 400, crop: 'limit' }]
  },
});

const upload = multer({ storage });

router.get('/', (req, res) => {
  Internship.find().sort({ createdAt: -1 })
    .then(internships => res.json(internships))
    .catch(err => res.status(400).json({ msg: 'Error: ' + err }));
});

// @route   GET api/internships/:id
// @desc    Get a single internship by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);
    if (!internship) {
      return res.status(404).json({ msg: 'Internship not found' });
    }
    res.json(internship);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST /api/internships/add
// @desc    Add a new internship
// @access  Private (should be protected)
router.post('/add', upload.single('photo'), async (req, res) => {
    console.log('Received request to add internship');
    
    try {
        console.log('Request body:', req.body);
        console.log('Uploaded file:', req.file ? {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        } : 'No file uploaded');

        const { title, description, eligibility, isOpen } = req.body;
        
        if (!title || !description) {
            console.log('Validation failed - missing required fields');
            return res.status(400).json({ 
                success: false,
                message: 'Title and description are required' 
            });
        }

        console.log('Creating new internship with data:', {
            title,
            description,
            eligibility,
            hasPhoto: !!req.file
        });

        const newInternship = new Internship({
            title,
            description,
            eligibility: eligibility || '',
            isOpen: isOpen !== undefined ? isOpen : true,
            photo: req.file ? req.file.path : undefined,
            photoPublicId: req.file ? req.file.filename : undefined
        });

        console.log('Saving internship to database...');
        const savedInternship = await newInternship.save();
        console.log('Internship saved successfully:', savedInternship);
        
        res.status(201).json({ 
            success: true, 
            message: 'Internship added successfully!', 
            internship: savedInternship 
        });
        
    } catch (err) {
        console.error('Error adding internship:', {
            error: err,
            message: err.message,
            stack: err.stack,
            name: err.name
        });
        
        res.status(500).json({ 
            success: false,
            message: 'Server error while adding internship.',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

// @route   POST api/internships/update-with-photo/:id
// @desc    Update an internship (with/without new photo) - for React admin update form
// @access  Private (should be protected)
router.post('/update-with-photo/:id', upload.single('photo'), async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);
        if (!internship) {
            return res.status(404).json({ msg: 'Internship not found' });
        }

        // If a new photo is uploaded, delete the old one from Cloudinary and update fields
        if (req.file) {
            if (internship.photoPublicId) {
                await cloudinary.uploader.destroy(internship.photoPublicId);
            }
            internship.photo = req.file.path;
            internship.photoPublicId = req.file.filename;
        }

        // Update other fields
        const { title, description, eligibility, isOpen } = req.body;
        internship.title = title || internship.title;
        internship.description = description || internship.description;
        internship.eligibility = eligibility || internship.eligibility;
        if (isOpen !== undefined) {
            internship.isOpen = isOpen;
        }

        await internship.save();
        res.json({ msg: 'Internship updated successfully', internship });

    } catch (err) {
        console.error('Error updating internship:', err);
        res.status(500).json({ msg: 'Server error while updating internship.' });
    }
});

// @route   POST api/internships/update/:id
// @desc    Update an internship
// @access  Private (should be protected)
router.post('/update/:id', upload.single('photo'), async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);
        if (!internship) {
            return res.status(404).json({ msg: 'Internship not found' });
        }

        // If a new photo is uploaded, delete the old one from Cloudinary and update fields
        if (req.file) {
            if (internship.photoPublicId) {
                await cloudinary.uploader.destroy(internship.photoPublicId);
            }
            internship.photo = req.file.path;
            internship.photoPublicId = req.file.filename;
        }

        // Update other fields
        const { title, description, eligibility, isOpen } = req.body;
        internship.title = title || internship.title;
        internship.description = description || internship.description;
        internship.eligibility = eligibility || internship.eligibility;
        if (isOpen !== undefined) {
            internship.isOpen = isOpen;
        }

        await internship.save();
        res.json({ msg: 'Internship updated successfully', internship });

    } catch (err) {
        console.error('Error updating internship:', err);
        res.status(500).json({ msg: 'Server error while updating internship.' });
    }
});

// @route   DELETE api/internships/:id
// @desc    Delete an internship
// @access  Private (should be protected)
router.delete('/:id', async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id);
        if (!internship) {
            return res.status(404).json({ msg: 'Internship not found' });
        }

        // If there's a photo, delete it from Cloudinary
        if (internship.photoPublicId) {
            await cloudinary.uploader.destroy(internship.photoPublicId);
        }

        await Internship.findByIdAndDelete(req.params.id);
        
        res.json({ msg: 'Internship deleted successfully.' });

    } catch (err) {
        console.error('Error deleting internship:', err);
        res.status(500).json({ msg: 'Server error while deleting internship.' });
    }
});

module.exports = router;
