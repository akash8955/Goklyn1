class ErrorResponse extends Error {
  /**
   * Create a new error response
   * @param {string} message - The error message
   * @param {number} statusCode - The HTTP status code
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    // Capture stack trace, excluding constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ErrorResponse;
