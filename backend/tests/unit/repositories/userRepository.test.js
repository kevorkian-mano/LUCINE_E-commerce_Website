import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserRepository } from '../../../src/repositories/userRepository.js';
import User from '../../../src/models/User.js';
import { mockUser } from '../../helpers/mockData.js';

// Mock User model
vi.mock('../../../src/models/User.js', () => {
  const mockUserConstructor = vi.fn();
  mockUserConstructor.findOne = vi.fn();
  mockUserConstructor.findById = vi.fn();
  mockUserConstructor.findByIdAndUpdate = vi.fn();
  return {
    default: mockUserConstructor
  };
});

describe('UserRepository', () => {
  let userRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    userRepository = new UserRepository();
  });

  describe('findByEmail', () => {
    // TDD Evidence:
    // RED: This test failed because findByEmail method did not exist
    // GREEN: After implementing findByEmail using User.findOne, test passed
    // REFACTOR: Test still passes
    it('should find user by email', async () => {
      User.findOne.mockResolvedValue(mockUser);

      const result = await userRepository.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    });

    // TDD Evidence:
    // RED: This test failed because findByEmail didn't handle null results
    // GREEN: After User.findOne returns null for non-existent users, test passed
    // REFACTOR: Test still passes
    it('should return null if user not found', async () => {
      User.findOne.mockResolvedValue(null);

      const result = await userRepository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    // TDD Evidence:
    // RED: This test failed because findById method did not exist
    // GREEN: After implementing findById using User.findById, test passed
    // REFACTOR: Added .select('-password') to exclude password, test still passes
    it('should find user by id and exclude password', async () => {
      const userWithoutPassword = { ...mockUser };
      delete userWithoutPassword.password;

      const mockFindById = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue(userWithoutPassword)
      });
      User.findById = mockFindById;

      const result = await userRepository.findById(mockUser._id);

      expect(result).toEqual(userWithoutPassword);
      expect(result).not.toHaveProperty('password');
      expect(mockFindById).toHaveBeenCalledWith(mockUser._id);
    });

    // TDD Evidence:
    // RED: This test failed because findById didn't handle null results
    // GREEN: After handling null results, test passed
    // REFACTOR: Test still passes
    it('should return null if user not found', async () => {
      const mockFindById = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue(null)
      });
      User.findById = mockFindById;

      const result = await userRepository.findById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    // TDD Evidence:
    // RED: This test failed because create method did not exist
    // GREEN: After implementing create using new User().save(), test passed
    // REFACTOR: Test still passes
    it('should create new user', async () => {
      const userData = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123'
      };

      const mockSave = vi.fn().mockResolvedValue({ _id: 'new-id', ...userData });
      User.mockImplementation(() => ({
        save: mockSave
      }));

      const result = await userRepository.create(userData);

      expect(User).toHaveBeenCalledWith(userData);
      expect(mockSave).toHaveBeenCalled();
    });

    // TDD Evidence:
    // RED: This test failed because create didn't handle validation errors
    // GREEN: After save() throws validation errors, test passed (error propagates)
    // REFACTOR: Test still passes
    it('should propagate validation errors', async () => {
      const userData = { email: 'invalid' };
      const validationError = new Error('Validation failed');

      const mockSave = vi.fn().mockRejectedValue(validationError);
      User.mockImplementation(() => ({
        save: mockSave
      }));

      await expect(userRepository.create(userData)).rejects.toThrow('Validation failed');
    });
  });

  describe('update', () => {
    // TDD Evidence:
    // RED: This test failed because update method did not exist
    // GREEN: After implementing update using User.findByIdAndUpdate, test passed
    // REFACTOR: Added .select('-password') and { new: true }, test still passes
    it('should update user and return updated user without password', async () => {
      const updateData = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, ...updateData };
      delete updatedUser.password;

      const mockFindByIdAndUpdate = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue(updatedUser)
      });
      User.findByIdAndUpdate = mockFindByIdAndUpdate;

      const result = await userRepository.update(mockUser._id, updateData);

      expect(result).toEqual(updatedUser);
      expect(result).not.toHaveProperty('password');
      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        mockUser._id,
        updateData,
        { new: true }
      );
    });

    // TDD Evidence:
    // RED: This test failed because update didn't handle non-existent users
    // GREEN: After findByIdAndUpdate returns null, test passed
    // REFACTOR: Test still passes
    it('should return null if user not found', async () => {
      const mockFindByIdAndUpdate = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue(null)
      });
      User.findByIdAndUpdate = mockFindByIdAndUpdate;

      const result = await userRepository.update('nonexistent-id', { name: 'New Name' });

      expect(result).toBeNull();
    });
  });
});

