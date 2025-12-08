// Centralized error handling middleware
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors).map(e => e.message).join(", ");
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} already exists`;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 404;
    message = "Resource not found";
  }

  // JWT errors - handle these before message-based logic
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // Handle common error messages and set appropriate status codes
  // Only apply if statusCode hasn't been set by specific error handlers above
  if (!err.statusCode && statusCode === 500 && err.message) {
    const lowerMessage = err.message.toLowerCase();
    
    // Authentication/authorization errors
    if (lowerMessage.includes('invalid credentials') || 
        lowerMessage.includes('user not found') ||
        lowerMessage.includes('invalid email') ||
        lowerMessage.includes('invalid password')) {
      statusCode = 401;
    }
    
    // Validation errors
    if (lowerMessage.includes('required') ||
        (lowerMessage.includes('invalid') && !lowerMessage.includes('credentials') && !lowerMessage.includes('token')) ||
        lowerMessage.includes('must be') ||
        lowerMessage.includes('already exists') ||
        lowerMessage.includes('password must')) {
      statusCode = 400;
    }
    
    // Not found errors
    if (lowerMessage.includes('not found')) {
      statusCode = 404;
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
};

// 404 handler
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

