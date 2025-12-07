import { describe, it, expect, beforeEach, vi } from 'vitest';
import authController from '../../../src/controllers/authController.js';
import authService from '../../../src/services/authService.js';
import { mockUser } from '../../helpers/mockData.js';

// Mock authService
vi.mock('../../../src/services/authService.js', () => ({
  default: {
    register: vi.fn(),
    login: vi.fn(),
    getProfile: vi.fn(),
    logout: vi.fn()
  }
}));

describe('AuthController', () => {
  let req, res, next;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      body: {},
      user: { id: mockUser._id }
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };

    next = vi.fn();
  });

  describe('register', () => {
    // TDD Evidence:
    // RED: This test failed because register controller method did not exist
    // GREEN: After implementing register controller, test passed
    // REFACTOR: Test still passes
    it('should register user and return 201 status', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const serviceResult = {
        user: { id: '123', ...userData },
        token: 'jwt-token'
      };

      req.body = userData;
      authService.register.mockResolvedValue(serviceResult);

      await authController.register(req, res, next);

      expect(authService.register).toHaveBeenCalledWith(userData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User registered successfully',
        data: serviceResult
      });
    });

    // TDD Evidence:
    // RED: This test failed because register didn't handle service errors
    // GREEN: After asyncHandler catches errors, test passed
    // REFACTOR: Test still passes
    it('should pass errors to next middleware', async () => {
      const error = new Error('Registration failed');
      req.body = { email: 'test@example.com' };
      authService.register.mockRejectedValue(error);

      await authController.register(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('login', () => {
    // TDD Evidence:
    // RED: This test failed because login controller method did not exist
    // GREEN: After implementing login controller, test passed
    // REFACTOR: Test still passes
    it('should login user and return success response', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const serviceResult = {
        user: { id: '123', email: loginData.email },
        token: 'jwt-token'
      };

      req.body = loginData;
      authService.login.mockResolvedValue(serviceResult);

      await authController.login(req, res, next);

      expect(authService.login).toHaveBeenCalledWith(loginData.email, loginData.password);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        data: serviceResult
      });
    });

    // TDD Evidence:
    // RED: This test failed because login didn't extract email and password from body
    // GREEN: After destructuring req.body, test passed
    // REFACTOR: Test still passes
    it('should extract email and password from request body', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      authService.login.mockResolvedValue({ user: {}, token: 'token' });

      await authController.login(req, res, next);

      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  describe('getProfile', () => {
    // TDD Evidence:
    // RED: This test failed because getProfile controller method did not exist
    // GREEN: After implementing getProfile controller, test passed
    // REFACTOR: Test still passes
    it('should return user profile', async () => {
      authService.getProfile.mockResolvedValue(mockUser);

      await authController.getProfile(req, res, next);

      expect(authService.getProfile).toHaveBeenCalledWith(req.user.id);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUser
      });
    });

    // TDD Evidence:
    // RED: This test failed because getProfile didn't use req.user.id
    // GREEN: After using req.user.id, test passed
    // REFACTOR: Test still passes
    it('should use user id from req.user', async () => {
      req.user = { id: 'custom-user-id' };
      authService.getProfile.mockResolvedValue(mockUser);

      await authController.getProfile(req, res, next);

      expect(authService.getProfile).toHaveBeenCalledWith('custom-user-id');
    });
  });

  describe('logout', () => {
    // TDD Evidence:
    // RED: This test failed because logout controller method did not exist
    // GREEN: After implementing logout controller, test passed
    // REFACTOR: Test still passes
    it('should return success message on logout', async () => {
      await authController.logout(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logged out successfully'
      });
    });
  });
});

 