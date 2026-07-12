const { ZodError } = require('zod');

const errorHandler = (err, req, res, next) => {
  console.error('API Error:', err.message, err.stack);

  // Handle Schema Validation Errors (Zod)
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map(error => ({
      field: error.path.join('.'),
      message: error.message,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }

  // Handle standard server/database errors
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;
