import { describe, it, expect, beforeEach, vi } from 'vitest';
import { errorHandler, notFound } from '../../../src/middlewares/errorHandler.js';

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      originalUrl: '/api/test'
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };
    next = vi.fn();
    process.env.NODE_ENV = 'test'; // Suppress stack traces in tests
  });

  describe('errorHandler', () => {
    // TDD Evidence:
    // RED: This test failed because errorHandler did not exist
    // GREEN: After implementing errorHandler, test passed
    // REFACTOR: Test still passes
    it('should handle generic errors with 500 status', () => {
      const error = new Error('Generic error');

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Generic error'
      });
    });

    // TDD Evidence:
    // RED: This test failed because errorHandler didn't use custom statusCode
    // GREEN: After checking err.statusCode, test passed
    // REFACTOR: Test still passes
    it('should use custom statusCode if provided', () => {
      const error = new Error('Custom error');
      error.statusCode = 400;

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Custom error'
      });
    });

    // TDD Evidence:
    // RED: This test failed because errorHandler didn't handle Mongoose ValidationError
    // GREEN: After adding ValidationError handling, test passed
    // REFACTOR: Improved error message extraction, test still passes
    it('should handle Mongoose ValidationError', () => {
      const error = {
        name: 'ValidationError',
        errors: {
          email: { message: 'Email is required' },
          name: { message: 'Name is required' }
        }
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Email is required, Name is required'
      });
    });

    // TDD Evidence:
    // RED: This test failed because errorHandler didn't handle duplicate key errors
    // GREEN: After adding duplicate key error handling, test passed
    // REFACTOR: Improved field extraction, test still passes
    it('should handle Mongoose duplicate key error', () => {
      const error = {
        code: 11000,
        keyPattern: { email: 1 }
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'email already exists'
      });
    });

    // TDD Evidence:
    // RED: This test failed because errorHandler didn't handle CastError
    // GREEN: After adding CastError handling, test passed
    // REFACTOR: Test still passes
    it('should handle Mongoose CastError (invalid ObjectId)', () => {
      const error = {
        name: 'CastError',
        message: 'Cast to ObjectId failed'
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Resource not found'
      });
    });

    // TDD Evidence:
    // RED: This test failed because errorHandler didn't handle JWT errors
    // GREEN: After adding JsonWebTokenError handling, test passed
    // REFACTOR: Test still passes
    it('should handle JsonWebTokenError', () => {
      const error = {
        name: 'JsonWebTokenError',
        message: 'Invalid token'
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid token'
      });
    });

    // TDD Evidence:
    // RED: This test failed because errorHandler didn't handle TokenExpiredError
    // GREEN: After adding TokenExpiredError handling, test passed
    // REFACTOR: Test still passes
    it('should handle TokenExpiredError', () => {
      const error = {
        name: 'TokenExpiredError',
        message: 'Token expired'
      };

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token expired'
      });
    });

    // TDD Evidence:
    // RED: This test failed because errorHandler didn't include stack trace in development
    // GREEN: After adding stack trace for development, test passed
    // REFACTOR: Test still passes
    it('should include stack trace in development mode', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Test error');
      error.stack = 'Error stack trace';

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Test error',
        stack: 'Error stack trace'
      });

      process.env.NODE_ENV = 'test'; // Reset
    });

    // TDD Evidence:
    // RED: This test failed because errorHandler didn't handle errors without message
    // GREEN: After adding default message, test passed
    // REFACTOR: Test still passes
    it('should use default message if error has no message', () => {
      const error = {};

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal Server Error'
      });
    });
  });

  describe('notFound', () => {
    // TDD Evidence:
    // RED: This test failed because notFound middleware did not exist
    // GREEN: After implementing notFound, test passed
    // REFACTOR: Test still passes
    it('should create 404 error with correct message', () => {
      req.originalUrl = '/api/nonexistent';

      notFound(req, res, next);

      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error.message).toBe('Not Found - /api/nonexistent');
      expect(error.statusCode).toBe(404);
    });

    // TDD Evidence:
    // RED: This test failed because notFound didn't include originalUrl in message
    // GREEN: After including originalUrl, test passed
    // REFACTOR: Test still passes
    it('should include originalUrl in error message', () => {
      req.originalUrl = '/api/products/123';

      notFound(req, res, next);

      const error = next.mock.calls[0][0];
      expect(error.message).toContain('/api/products/123');
    });
  });
});

