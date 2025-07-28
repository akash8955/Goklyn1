const cloudinary = require('cloudinary').v2;
const { promisify } = require('util');
const fs = require('fs');
const ApiError = require('./ApiError');

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Promisify Cloudinary methods
const uploadPromise = promisify(cloudinary.uploader.upload);
const destroyPromise = promisify(cloudinary.uploader.destroy);

/**
 * Upload a file to Cloudinary
 * @param {Object} file - The file object from multer
 * @param {string} folder - The folder in Cloudinary to upload to
 * @returns {Promise<Object>} - The Cloudinary upload result
 */
const uploadToCloudinary = async (file, folder = 'misc') => {
  try {
    if (!file) {
      throw new ApiError('No file provided', 400);
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new ApiError('File size exceeds 5MB limit', 400);
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new ApiError('Invalid file type. Only images are allowed', 400);
    }

    // Upload file to Cloudinary
    const result = await uploadPromise(file.path, {
      folder: `${process.env.CLOUDINARY_FOLDER || 'portfolio'}/${folder}`,
      resource_type: 'auto',
      use_filename: true,
      unique_filename: true,
      overwrite: true,
      quality: 'auto:good',
      format: 'webp',
      transformation: [
        { width: 2000, crop: 'limit', quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });

    // Delete the temporary file
    await fs.promises.unlink(file.path);

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height
    };
  } catch (error) {
    // Delete the temporary file if it exists
    if (file?.path && fs.existsSync(file.path)) {
      await fs.promises.unlink(file.path).catch(console.error);
    }
    
    console.error('Cloudinary upload error:', error);
    throw new ApiError(
      error.message || 'Error uploading file to Cloudinary',
      error.statusCode || 500,
      error
    );
  }
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - The public ID of the file to delete
 * @returns {Promise<Object>} - The Cloudinary delete result
 */
const deleteFromCloudinary = async (publicId) => {
  console.log(`Starting deleteFromCloudinary for: ${publicId}`);
  
  try {
    if (!publicId) {
      console.error('No public ID provided for deletion');
      throw new ApiError('No public ID provided', 400);
    }

    // Extract public ID from URL if a full URL is provided
    let idToDelete = publicId;
    if (publicId.startsWith('http')) {
      console.log('Processing URL to extract public ID');
      const urlParts = publicId.split('/');
      const fileName = urlParts[urlParts.length - 1];
      idToDelete = fileName.split('.')[0];
      
      // Reconstruct the public ID with the folder structure
      const folderIndex = urlParts.findIndex(part => part === 'upload');
      if (folderIndex > 0) {
        const folderParts = urlParts.slice(folderIndex + 2, -1);
        idToDelete = [...folderParts, idToDelete].join('/');
      }
      console.log(`Extracted public ID: ${idToDelete} from URL: ${publicId}`);
    }

    console.log(`Deleting from Cloudinary - Processed ID: ${idToDelete}`);
    
    // Add a timeout to the Cloudinary destroy operation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Cloudinary delete operation timed out after 10 seconds'));
      }, 10000); // 10 second timeout
    });

    // Race the Cloudinary operation against our timeout
    const result = await Promise.race([
      destroyPromise(idToDelete, {
        resource_type: 'image',
        invalidate: true,
        timeout: 8000 // Cloudinary's own timeout (slightly less than our race timeout)
      }),
      timeoutPromise
    ]);

    if (result.result === 'not found') {
      console.warn(`File with ID ${idToDelete} not found in Cloudinary`);
    } else {
      console.log(`Successfully deleted from Cloudinary: ${idToDelete}`);
    }

    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', {
      message: error.message,
      stack: error.stack,
      publicId: publicId,
      time: new Date().toISOString()
    });
    
    // Don't fail the entire operation if Cloudinary deletion fails
    // Just log the error and continue
    console.warn('Continuing with project deletion despite Cloudinary error');
    return { result: 'error', message: error.message };
  }
};

/**
 * Delete multiple files from Cloudinary
 * @param {string[]} publicIds - Array of public IDs to delete
 * @returns {Promise<Object>} - The Cloudinary delete results
 */
const deleteMultipleFromCloudinary = async (publicIds) => {
  try {
    if (!Array.isArray(publicIds) || publicIds.length === 0) {
      throw new ApiError('No public IDs provided', 400);
    }

    const results = await Promise.all(
      publicIds.map(id => deleteFromCloudinary(id).catch(e => ({
        publicId: id,
        success: false,
        error: e.message
      })))
    );

    return {
      success: true,
      results
    };
  } catch (error) {
    console.error('Cloudinary delete multiple error:', error);
    throw new ApiError(
      error.message || 'Error deleting files from Cloudinary',
      error.statusCode || 500,
      error
    );
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
  cloudinary // Export cloudinary instance for direct use if needed
};
