class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (err.status ? err.status : 500);
  const message = err.isOperational ? err.message : (statusCode === 500 ? 'Internal server error' : err.message);

  if (statusCode === 500) {
    console.error('[Unhandled Server Error]', err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: err.code || 'ERROR',
      details: err.details || null
    }
  });
};

module.exports = {
  AppError,
  errorHandler
};
