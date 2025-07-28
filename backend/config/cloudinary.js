const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');

// Load environment variables
const result = dotenv.config({ path: '.env' });
if (result.error) {
  console.error('Error loading .env file:', result.error);
}

// Validate required Cloudinary environment variables
const requiredCloudinaryVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missingCloudinaryVars = requiredCloudinaryVars.filter(varName => !process.env[varName]);

if (missingCloudinaryVars.length > 0) {
  console.error('Missing required Cloudinary environment variables:', missingCloudinaryVars.join(', '));
  throw new Error(`Missing required Cloudinary environment variables: ${missingCloudinaryVars.join(', ')}`);
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // Force HTTPS
});

// Configure Cloudinary Storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    console.log('Processing file upload:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });

    const params = {
      folder: 'goklyn-portfolio/projects',
      allowed_formats: ['jpeg', 'jpg', 'png', 'gif'],
      transformation: [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto:good' }
      ],
      resource_type: 'auto',
      public_id: `project-${Date.now()}-${Math.round(Math.random() * 1E9)}`,
      // Add error handling for uploads
      invalidate: true
    };

    console.log('Cloudinary upload params:', params);
    return params;
  },
  // Add error handling
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const filename = `project-${uniqueSuffix}`;
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

// Add error handling for Cloudinary
cloudinary.api.ping()
  .then(() => console.log('Cloudinary connection successful'))
  .catch(err => console.error('Cloudinary connection error:', err));

module.exports = { cloudinary, storage };

// Debug log environment variables
console.log('Cloudinary Config - Environment Variables:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '***' : 'MISSING',
  api_key: process.env.CLOUDINARY_API_KEY ? '***' : 'MISSING',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '***' : 'MISSING'
});

// Validate required environment variables
const requiredEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  throw new Error(`Missing required Cloudinary environment variables: ${missingVars.join(', ')}`);
}

// Configure Cloudinary
try {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('Cloudinary configured successfully');
} catch (error) {
  console.error('Failed to configure Cloudinary:', error.message);
  throw error;
}

module.exports = cloudinary;
