/**
 * Utility functions for handling file operations
 */

/**
 * Get file extension from filename
 * @param {string} filename
 * @returns {string} File extension in lowercase
 */
export const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

/**
 * Check if file is an image
 * @param {File} file
 * @returns {boolean}
 */
export const isImage = (file) => {
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const ext = getFileExtension(file.name);
  return imageTypes.includes(ext);
};

/**
 * Check if file is a video
 * @param {File} file
 * @returns {boolean}
 */
export const isVideo = (file) => {
  const videoTypes = ['mp4', 'webm', 'ogg', 'mov'];
  const ext = getFileExtension(file.name);
  return videoTypes.includes(ext);
};

/**
 * Format file size to human readable format
 * @param {number} bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Create a preview URL for a file
 * @param {File} file
 * @returns {Promise<string>} Data URL for the file
 */
export const createPreviewUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Validate file before upload
 * @param {File} file
 * @param {Object} options
 * @param {number} options.maxSize - Max file size in MB
 * @param {string[]} options.allowedTypes - Allowed file types
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
export const validateFile = async (file, options = {}) => {
  const { maxSize = 10, allowedTypes = ['image/*', 'video/*'] } = options;
  
  // Check file size
  if (file.size > maxSize * 1024 * 1024) {
    return {
      valid: false,
      error: `File is too large. Maximum size is ${maxSize}MB.`
    };
  }

  // Check file type
  const isAllowed = allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.split('/*')[0]);
    }
    return file.type === type;
  });

  if (!isAllowed) {
    return {
      valid: false,
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
    };
  }

  return { valid: true };
};

/**
 * Convert base64 to file
 * @param {string} dataurl - Base64 string
 * @param {string} filename - Output filename
 * @returns {File}
 */
export const dataURLtoFile = (dataurl, filename) => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
};

/**
 * Download file from URL
 * @param {string} url - File URL
 * @param {string} filename - Output filename
 */
export const downloadFile = (url, filename) => {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'download';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
