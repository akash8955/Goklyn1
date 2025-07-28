const router = require('express').Router();
console.log('Testimonials routes loaded');

// Debug: Simple test route to confirm router registration
router.post('/test', (req, res) => {
  res.json({ msg: 'Test route works!' });
});
const Testimonial = require('../models/testimonial.model');

// --- API ROUTES ---

// @route   GET api/testimonials
// @desc    Get all approved testimonials
// @access  Public
router.route('/').get((req, res) => {
    Testimonial.find().sort({ createdAt: -1 })
        .then(testimonials => res.json(testimonials))
        .catch(err => res.status(400).json({ msg: 'Error: ' + err }));
});

// @route   GET api/testimonials/all
// @desc    Get all testimonials (for admin)
// @access  Private (should be protected)
router.route('/all').get((req, res) => {
    Testimonial.find().sort({ createdAt: -1 })
        .then(testimonials => res.json(testimonials))
        .catch(err => res.status(400).json({ msg: 'Error: ' + err }));
});

// @route   POST api/testimonials/add
// @desc    Add a new testimonial
// @access  Private (should be protected)
router.post('/add', async (req, res) => {
    try {
        const { clientName, company, feedback, rating } = req.body;
        
        const newTestimonial = new Testimonial({
            clientName,
            company,
            feedback,
            rating,
            photo: req.file ? req.file.path : undefined,
            photoPublicId: req.file ? req.file.filename : undefined
        });

        await newTestimonial.save();
        res.status(201).json({ msg: 'Testimonial added successfully!', testimonial: newTestimonial });

    } catch (err) {
        console.error('Error adding testimonial:', err);
        res.status(500).json({ msg: 'Server error while adding testimonial.' });
    }
});

// @route   POST api/testimonials/update/:id
// @desc    Update a testimonial
// @access  Private (should be protected)
// @route   POST api/testimonials/update-with-photo/:id
// @desc    Update a testimonial (with/without new photo) - for React admin update form
// @access  Private (should be protected)
router.post('/update-with-photo/:id', async (req, res) => {
  console.log('Received POST to /update-with-photo/', req.params.id);
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ msg: 'Testimonial not found' });
        }

        const { clientName, company, feedback, rating, name, quote } = req.body;
        // Accept both admin and user field names for compatibility
        testimonial.clientName = clientName || name || testimonial.clientName;
        testimonial.feedback = feedback || quote || testimonial.feedback;
        testimonial.company = company || testimonial.company;
        if (rating) testimonial.rating = rating;
        await testimonial.save();
        res.json({ msg: 'Testimonial updated successfully', testimonial });
    } catch (err) {
        console.error('Error updating testimonial:', err);
        res.status(500).json({ msg: 'Server error while updating testimonial.' });
    }
});

// @route   POST api/testimonials/update/:id
// @desc    Update a testimonial
// @access  Private (should be protected)
router.post('/update/:id', async (req, res) => {
    try {
        const testimonial = await Testimonial.findById(req.params.id);
        if (!testimonial) {
            return res.status(404).json({ msg: 'Testimonial not found' });
        }

        if (req.file) {
            if (testimonial.photoPublicId) {
                await cloudinary.uploader.destroy(testimonial.photoPublicId);
            }
            testimonial.photo = req.file.path;
            testimonial.photoPublicId = req.file.filename;
        }

        const { clientName, company, feedback, rating } = req.body;
        testimonial.clientName = clientName || testimonial.clientName;
        testimonial.company = company || testimonial.company;
        testimonial.feedback = feedback || testimonial.feedback;
        if (rating) testimonial.rating = rating;

        await testimonial.save();
        res.json({ msg: 'Testimonial updated successfully', testimonial });

    } catch (err) {
        console.error('Error updating testimonial:', err);
        res.status(500).json({ msg: 'Server error while updating testimonial.' });
    }
});

// @route   DELETE api/testimonials/:id
// @desc    Delete a testimonial
// @access  Private (should be protected)
router.delete('/:id', async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ msg: 'Testimonial not found' });
    }
    if (testimonial.photoPublicId) {
      await cloudinary.uploader.destroy(testimonial.photoPublicId);
    }
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Testimonial deleted successfully.' });
  } catch (err) {
    console.error('Error deleting testimonial:', err);
    res.status(500).json({ msg: 'Server error while deleting testimonial.' });
  }
});

// @route   GET api/testimonials/:id
// @desc    Get a single testimonial by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ msg: 'Testimonial not found' });
    }
    res.json(testimonial);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
