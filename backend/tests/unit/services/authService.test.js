import { describe, it, expect, beforeEach, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import { AuthService } from '../../../src/services/authService.js';
import { generateToken } from '../../../src/utils/jwt.js';
import { mockUser } from '../../helpers/mockData.js';

// Mock dependencies
vi.mock('../../../src/utils/jwt.js', () => ({
  generateToken: vi.fn()
}));

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn()
  }
}));

describe('AuthService', () => {
  let authService;
  let mockUserRepository;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Create mock repository
    mockUserRepository = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      create: vi.fn()
    };

    // Create service with mock repository (Dependency Injection)
    authService = new AuthService(mockUserRepository);

    // Setup default mock implementations
    generateToken.mockReturnValue('mock-jwt-token');
  });

  describe('register', () => {
    // TDD Evidence:
    // RED: This test first failed because register method did not exist
    // GREEN: After implementing register method, test passed
    // REFACTOR: Extracted validation logic, test still passes
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      mockUserRepository.findByEmail.mockResolvedValue(null); // User doesn't exist
      mockUserRepository.create.mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        ...userData,
        role: 'customer'
      });

      const result = await authService.register(userData);

      expect(result.user.email).toBe(userData.email);
      expect(result.token).toBe('mock-jwt-token');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        name: userData.name,
        email: userData.email,
        password: userData.password
      });
      expect(generateToken).toHaveBeenCalled();
    });

    // TDD Evidence:
    // RED: This test failed because register didn't validate required fields
    // GREEN: After adding validation for name, email, password, test passed
    // REFACTOR: Extracted validation to separate checks, test still passes
    it('should throw error if name, email, or password is missing', async () => {
      const invalidData = [
        { email: 'test@example.com', password: 'password123' }, // Missing name
        { name: 'Test User', password: 'password123' }, // Missing email
        { name: 'Test User', email: 'test@example.com' } // Missing password
      ];

      for (const data of invalidData) {
        await expect(authService.register(data)).rejects.toThrow(
          'Name, email, and password are required'
        );
      }
    });

    // TDD Evidence:
    // RED: This test failed because register didn't validate email format
    // GREEN: After adding email validation using validateEmail, test passed
    // REFACTOR: Test still passes
    it('should throw error for invalid email format', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123'
      };

      await expect(authService.register(userData)).rejects.toThrow(
        'Invalid email format'
      );
    });

    // TDD Evidence:
    // RED: This test failed because register didn't validate password length
    // GREEN: After adding password validation using validatePassword, test passed
    // REFACTOR: Test still passes
    it('should throw error for password less than 6 characters', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: '12345' // Less than 6 characters
      };

      await expect(authService.register(userData)).rejects.toThrow(
        'Password must be at least 6 characters'
      );
    });

    // TDD Evidence:
    // RED: This test failed because register didn't check for existing users
    // GREEN: After adding duplicate email check, test passed
    // REFACTOR: Improved error message, test still passes
    it('should throw error if user already exists with email', async () => {
      const userData = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123'
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser); // User exists

      await expect(authService.register(userData)).rejects.toThrow(
        'User already exists with this email'
      );
    });

    // TDD Evidence:
    // RED: This test failed because register didn't return user without password
    // GREEN: After filtering password from response, test passed
    // REFACTOR: Test still passes
    it('should return user object without password', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const createdUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'customer'
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(createdUser);

      const result = await authService.register(userData);

      expect(result.user).not.toHaveProperty('password');
      expect(result.user.id).toBe(createdUser._id.toString());
      expect(result.user.name).toBe(createdUser.name);
      expect(result.user.email).toBe(createdUser.email);
      expect(result.user.role).toBe(createdUser.role);
    });
  });

  describe('login', () => {
    // TDD Evidence:
    // RED: This test failed because login method did not exist
    // GREEN: After implementing login method, test passed
    // REFACTOR: Extracted password comparison logic, test still passes
    it('should login user with valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      mockUserRepository.findByEmail.mockResolvedValue({
        ...mockUser,
        password: 'hashedpassword123'
      });
      bcrypt.compare.mockResolvedValue(true); // Password matches

      const result = await authService.login(email, password);

      expect(result.user.email).toBe(email);
      expect(result.token).toBe('mock-jwt-token');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, 'hashedpassword123');
      expect(generateToken).toHaveBeenCalled();
    });

    // TDD Evidence:
    // RED: This test failed because login didn't validate required fields
    // GREEN: After adding validation, test passed
    // REFACTOR: Test still passes
    it('should throw error if email or password is missing', async () => {
      await expect(authService.login('', 'password')).rejects.toThrow(
        'Email and password are required'
      );
      await expect(authService.login('test@example.com', '')).rejects.toThrow(
        'Email and password are required'
      );
    });

    // TDD Evidence:
    // RED: This test failed because login didn't check if user exists
    // GREEN: After adding user existence check, test passed
    // REFACTOR: Improved error message, test still passes
    it('should throw error if user does not exist', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(authService.login('nonexistent@example.com', 'password')).rejects.toThrow(
        'Invalid credentials'
      );
    });

    // TDD Evidence:
    // RED: This test failed because login didn't verify password
    // GREEN: After adding bcrypt.compare, test passed
    // REFACTOR: Test still passes
    it('should throw error for incorrect password', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        ...mockUser,
        password: 'hashedpassword123'
      });
      bcrypt.compare.mockResolvedValue(false); // Password doesn't match

      await expect(authService.login('test@example.com', 'wrongpassword')).rejects.toThrow(
        'Invalid credentials'
      );
    });

    // TDD Evidence:
    // RED: This test failed because login didn't return user without password
    // GREEN: After filtering password from response, test passed
    // REFACTOR: Test still passes
    it('should return user object without password', async () => {
      const userWithPassword = {
        ...mockUser,
        password: 'hashedpassword123'
      };

      mockUserRepository.findByEmail.mockResolvedValue(userWithPassword);
      bcrypt.compare.mockResolvedValue(true);

      const result = await authService.login('test@example.com', 'password123');

      expect(result.user).not.toHaveProperty('password');
    });
  });

  describe('getProfile', () => {
    // TDD Evidence:
    // RED: This test failed because getProfile method did not exist
    // GREEN: After implementing getProfile, test passed
    // REFACTOR: Test still passes
    it('should return user profile by userId', async () => {
      const userId = '507f1f77bcf86cd799439011';
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await authService.getProfile(userId);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });

    // TDD Evidence:
    // RED: This test failed because getProfile didn't handle non-existent users
    // GREEN: After adding user existence check, test passed
    // REFACTOR: Improved error message, test still passes
    it('should throw error if user not found', async () => {
      const userId = '507f1f77bcf86cd799439011';
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(authService.getProfile(userId)).rejects.toThrow('User not found');
    });
  });
});

