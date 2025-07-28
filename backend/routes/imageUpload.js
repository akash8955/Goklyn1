const express = require('express');
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const { protect } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage });

router.post('/', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'Please upload a file' });
  }
  res.status(200).send({
    message: 'Image uploaded successfully',
    url: req.file.path,
  });
});

module.exports = router;
