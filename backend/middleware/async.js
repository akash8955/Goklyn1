/**
 * Async handler to wrap each route
 * @param {Function} fn - The async function to be wrapped
 * @returns {Function} - A middleware function that handles async/await errors
 */
const asyncHandler = fn => (req, res, next) => {
  // Return a new promise that resolves the request handler
  // and catches any errors to pass them to Express's error handler
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
