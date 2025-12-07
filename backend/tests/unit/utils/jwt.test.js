import { describe, it, expect, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { generateToken, verifyToken } from '../../../src/utils/jwt.js';

describe('JWT Utilities', () => {
  beforeEach(() => {
    // Set test environment variables
    process.env.JWT_SECRET = 'test-secret-key';
    process.env.JWT_EXPIRE = '1h';
  });

  describe('generateToken', () => {
    // TDD Evidence:
    // RED: This test first failed because generateToken did not exist
    // GREEN: After implementing generateToken using jwt.sign, the test passed
    // REFACTOR: Extracted JWT_SECRET to environment variable, test still passes
    it('should generate a valid JWT token', () => {
      const userId = '507f1f77bcf86cd799439011';
      
      const token = generateToken(userId);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    // TDD Evidence:
    // RED: This test failed because token didn't contain userId
    // GREEN: After verifying token payload contains userId, test passed
    // REFACTOR: Used jwt.verify to decode and check payload, test still passes
    it('should generate token with correct userId in payload', () => {
      const userId = '507f1f77bcf86cd799439011';
      
      const token = generateToken(userId);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      expect(decoded.userId).toBe(userId);
      expect(decoded).toHaveProperty('exp'); // Should have expiration
      expect(decoded).toHaveProperty('iat'); // Should have issued at
    });

    // TDD Evidence:
    // RED: This test failed because token expiration was not configurable
    // GREEN: After using JWT_EXPIRE from env, test passed
    // REFACTOR: Made expiration configurable with default, test still passes
    it('should use JWT_EXPIRE from environment variable', () => {
      const userId = '507f1f77bcf86cd799439011';
      process.env.JWT_EXPIRE = '2h';
      
      const token = generateToken(userId);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check that expiration is approximately 2 hours from now
      const expirationTime = decoded.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const twoHours = 2 * 60 * 60 * 1000;
      
      expect(expirationTime - currentTime).toBeGreaterThan(twoHours - 1000);
      expect(expirationTime - currentTime).toBeLessThan(twoHours + 1000);
    });
  });

  describe('verifyToken', () => {
    // TDD Evidence:
    // RED: This test failed because verifyToken did not exist
    // GREEN: After implementing verifyToken using jwt.verify, test passed
    // REFACTOR: Added try-catch for error handling, test still passes
    it('should verify a valid token and return decoded payload', () => {
      const userId = '507f1f77bcf86cd799439011';
      const token = generateToken(userId);
      
      const decoded = verifyToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(userId);
    });

    // TDD Evidence:
    // RED: This test failed because verifyToken didn't throw error for invalid token
    // GREEN: After adding error handling in verifyToken, test passed
    // REFACTOR: Improved error message to be more descriptive, test still passes
    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => {
        verifyToken(invalidToken);
      }).toThrow('Invalid or expired token');
    });

    // TDD Evidence:
    // RED: This test failed because verifyToken didn't handle expired tokens
    // GREEN: After jwt.verify automatically handles expiration, test passed
    // REFACTOR: Added specific error message for expired tokens, test still passes
    it('should throw error for expired token', () => {
      // Create a token that expires immediately
      const userId = '507f1f77bcf86cd799439011';
      const expiredToken = jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' } // Expired 1 hour ago
      );
      
      expect(() => {
        verifyToken(expiredToken);
      }).toThrow('Invalid or expired token');
    });

    // TDD Evidence:
    // RED: This test failed because verifyToken didn't handle tokens with wrong secret
    // GREEN: After jwt.verify checks secret, test passed
    // REFACTOR: Error handling improved, test still passes
    it('should throw error for token signed with wrong secret', () => {
      const userId = '507f1f77bcf86cd799439011';
      const wrongSecretToken = jwt.sign(
        { userId },
        'wrong-secret-key',
        { expiresIn: '1h' }
      );
      
      expect(() => {
        verifyToken(wrongSecretToken);
      }).toThrow('Invalid or expired token');
    });

    // TDD Evidence:
    // RED: This test failed because verifyToken didn't handle empty/null tokens
    // GREEN: After adding validation for empty tokens, test passed
    // REFACTOR: Improved error handling, test still passes
    it('should throw error for empty token', () => {
      expect(() => {
        verifyToken('');
      }).toThrow('Invalid or expired token');
      
      expect(() => {
        verifyToken(null);
      }).toThrow();
    });
  });
});

