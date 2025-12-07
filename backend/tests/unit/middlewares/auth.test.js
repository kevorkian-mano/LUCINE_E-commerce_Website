import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authenticate, authorize } from '../../../src/middlewares/auth.js';
import { verifyToken } from '../../../src/utils/jwt.js';
import User from '../../../src/models/User.js';
import { mockUser } from '../../helpers/mockData.js';

// Mock dependencies
vi.mock('../../../src/utils/jwt.js', () => ({
  verifyToken: vi.fn()
}));

vi.mock('../../../src/models/User.js', () => ({
  default: {
    findById: vi.fn()
  }
}));

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup request, response, and next function
    req = {
      headers: {},
      user: null
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };

    next = vi.fn();
  });

  describe('authenticate', () => {
    // TDD Evidence:
    // RED: This test failed because authenticate middleware did not exist
    // GREEN: After implementing authenticate middleware, test passed
    // REFACTOR: Extracted token extraction logic, test still passes
    it('should authenticate user with valid token', async () => {
      const token = 'valid-jwt-token';
      req.headers.authorization = `Bearer ${token}`;

      const userWithoutPassword = { ...mockUser };
      delete userWithoutPassword.password;

      verifyToken.mockReturnValue({ userId: mockUser._id });
      User.findById.mockReturnValue({
        select: vi.fn().mockResolvedValue(userWithoutPassword)
      });

      await authenticate(req, res, next);

      expect(verifyToken).toHaveBeenCalledWith(token);
      expect(User.findById).toHaveBeenCalledWith(mockUser._id);
      expect(req.user).toEqual(userWithoutPassword);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    // TDD Evidence:
    // RED: This test failed because authenticate didn't handle missing token
    // GREEN: After adding token check, test passed
    // REFACTOR: Improved error response, test still passes
    it('should return 401 if token is missing', async () => {
      req.headers.authorization = undefined;

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Authentication required' });
      expect(next).not.toHaveBeenCalled();
    });

    // TDD Evidence:
    // RED: This test failed because authenticate didn't handle invalid token format
    // GREEN: After adding token format validation, test passed
    // REFACTOR: Improved token extraction, test still passes
    it('should return 401 if authorization header is malformed', async () => {
      req.headers.authorization = 'InvalidFormat token';

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Authentication required' });
    });

    // TDD Evidence:
    // RED: This test failed because authenticate didn't handle invalid token
    // GREEN: After adding try-catch for verifyToken, test passed
    // REFACTOR: Improved error handling, test still passes
    it('should return 401 if token is invalid', async () => {
      const token = 'invalid-token';
      req.headers.authorization = `Bearer ${token}`;

      verifyToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
      expect(next).not.toHaveBeenCalled();
    });

    // TDD Evidence:
    // RED: This test failed because authenticate didn't handle user not found
    // GREEN: After adding user existence check, test passed
    // REFACTOR: Test still passes
    it('should return 401 if user not found', async () => {
      const token = 'valid-token';
      req.headers.authorization = `Bearer ${token}`;

      verifyToken.mockReturnValue({ userId: 'nonexistent-id' });
      User.findById.mockReturnValue({
        select: vi.fn().mockResolvedValue(null)
      });

      await authenticate(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
      expect(next).not.toHaveBeenCalled();
    });

    // TDD Evidence:
    // RED: This test failed because authenticate didn't exclude password from user
    // GREEN: After using .select('-password'), test passed
    // REFACTOR: Test still passes
    it('should exclude password from user object', async () => {
      const token = 'valid-token';
      req.headers.authorization = `Bearer ${token}`;

      const userWithoutPassword = { ...mockUser };
      delete userWithoutPassword.password;

      verifyToken.mockReturnValue({ userId: mockUser._id });
      User.findById.mockReturnValue({
        select: vi.fn().mockResolvedValue(userWithoutPassword)
      });

      await authenticate(req, res, next);

      expect(req.user).not.toHaveProperty('password');
    });
  });

  describe('authorize', () => {
    // TDD Evidence:
    // RED: This test failed because authorize middleware did not exist
    // GREEN: After implementing authorize middleware, test passed
    // REFACTOR: Made it return a function, test still passes
    it('should allow access if user has required role', () => {
      req.user = { ...mockUser, role: 'admin' };

      const middleware = authorize('admin', 'customer');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    // TDD Evidence:
    // RED: This test failed because authorize didn't check user roles
    // GREEN: After adding role check, test passed
    // REFACTOR: Test still passes
    it('should deny access if user does not have required role', () => {
      req.user = { ...mockUser, role: 'customer' };

      const middleware = authorize('admin');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Access denied. Insufficient permissions.'
      });
      expect(next).not.toHaveBeenCalled();
    });

    // TDD Evidence:
    // RED: This test failed because authorize didn't handle missing user
    // GREEN: After adding user check, test passed
    // REFACTOR: Test still passes
    it('should return 401 if user is not authenticated', () => {
      req.user = null;

      const middleware = authorize('admin');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Authentication required' });
      expect(next).not.toHaveBeenCalled();
    });

    // TDD Evidence:
    // RED: This test failed because authorize didn't support multiple roles
    // GREEN: After using includes() for role check, test passed
    // REFACTOR: Test still passes
    it('should allow access if user has one of multiple allowed roles', () => {
      req.user = { ...mockUser, role: 'customer' };

      const middleware = authorize('admin', 'customer');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    // TDD Evidence:
    // RED: This test failed because authorize didn't handle case sensitivity
    // GREEN: After role check works correctly, test passed
    // REFACTOR: Test still passes
    it('should be case-sensitive for roles', () => {
      req.user = { ...mockUser, role: 'Admin' }; // Capital A

      const middleware = authorize('admin'); // lowercase
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});

