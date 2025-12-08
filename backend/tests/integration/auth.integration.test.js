import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import supertest from 'supertest';
import { setupTestApp, setupBeforeAll, cleanupAfterAll, setupBeforeEach } from './setup.js';
import User from '../../src/models/User.js';

describe('Authentication Integration Tests', () => {
  let app;

  beforeAll(async () => {
    await setupBeforeAll();
    app = setupTestApp();
  });

  afterAll(async () => {
    await cleanupAfterAll();
  });

  beforeEach(async () => {
    await setupBeforeEach();
  });

  // TDD Evidence:
  // RED: This test failed because registration endpoint did not exist
  // GREEN: After implementing registration, test passed
  // REFACTOR: Test still passes
  describe('POST /api/users/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await supertest(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('registered successfully');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.name).toBe(userData.name);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should return 400 if email already exists', async () => {
      // Create a user first
      await User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123'
      });

      const response = await supertest(app)
        .post('/api/users/register')
        .send({
          name: 'New User',
          email: 'existing@example.com',
          password: 'password123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await supertest(app)
        .post('/api/users/register')
        .send({
          email: 'test@example.com'
          // Missing name and password
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 if password is too short', async () => {
      const response = await supertest(app)
        .post('/api/users/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: '123' // Too short
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // TDD Evidence:
  // RED: This test failed because login endpoint did not exist
  // GREEN: After implementing login, test passed
  // REFACTOR: Test still passes
  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      // Create a test user
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should login user with valid credentials', async () => {
      const response = await supertest(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Login successful');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    it('should return 401 with invalid email', async () => {
      const response = await supertest(app)
        .post('/api/users/login')
        .send({
          email: 'wrong@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should return 401 with invalid password', async () => {
      const response = await supertest(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should return 400 if email or password is missing', async () => {
      const response = await supertest(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com'
          // Missing password
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // TDD Evidence:
  // RED: This test failed because profile endpoint did not exist
  // GREEN: After implementing profile endpoint, test passed
  // REFACTOR: Test still passes
  describe('GET /api/users/profile', () => {
    let authToken;
    let userId;

    beforeEach(async () => {
      // Create and login a user
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      userId = user._id;

      // Login to get token
      const loginResponse = await supertest(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      authToken = loginResponse.body.data.token;
    });

    it('should get user profile with valid token', async () => {
      const response = await supertest(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('test@example.com');
      expect(response.body.data.name).toBe('Test User');
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should return 401 without token', async () => {
      const response = await supertest(app)
        .get('/api/users/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return 401 with invalid token', async () => {
      const response = await supertest(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  // TDD Evidence:
  // RED: This test failed because logout endpoint did not exist
  // GREEN: After implementing logout endpoint, test passed
  // REFACTOR: Test still passes
  describe('POST /api/users/logout', () => {
    let authToken;

    beforeEach(async () => {
      // Create and login a user
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

      const loginResponse = await supertest(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      authToken = loginResponse.body.data.token;
    });

    it('should logout user successfully', async () => {
      const response = await supertest(app)
        .post('/api/users/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logged out successfully');
    });

    it('should return 401 without token', async () => {
      const response = await supertest(app)
        .post('/api/users/logout')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

