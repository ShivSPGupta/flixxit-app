exports.notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

exports.errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message: isProduction && statusCode === 500 ? 'Server error' : err.message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
};
