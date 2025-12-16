// Set JWT_SECRET BEFORE any imports that might use it
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
}
if (!process.env.JWT_EXPIRE) {
  process.env.JWT_EXPIRE = '1h';
}

import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from '../../src/config/db.js';
import productRoutes from '../../src/routes/productRoutes.js';
import userRoutes from '../../src/routes/userRoutes.js';
import orderRoutes from '../../src/routes/orderRoutes.js';
import cartRoutes from '../../src/routes/cartRoutes.js';
import paymentRoutes from '../../src/routes/paymentRoutes.js';
import { errorHandler, notFound } from '../../src/middlewares/errorHandler.js';

dotenv.config();

// Ensure JWT_SECRET is still set after dotenv (dotenv might override it)
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
}

// Test database connection string - use a separate test database
const TEST_MONGO_URI = process.env.TEST_MONGO_URI || process.env.MONGO_URI?.replace(/\/[^/]+$/, '/test_db') || 'mongodb://localhost:27017/ecommerce_test';

let testApp = null;
let testServer = null;

/**
 * Reset test app instance - creates a fresh app for better isolation
 */
export const resetTestApp = () => {
  testApp = null;
  return setupTestApp();
};

/**
 * Setup test Express app
 */
export const setupTestApp = () => {
  if (testApp) return testApp;

  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check route
  app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Server is running' });
  });

  // Routes
  app.use('/api/products', productRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/payments', paymentRoutes);

  // Error handling middleware (must be last)
  app.use(notFound);
  app.use(errorHandler);

  testApp = app;
  return app;
};

/**
 * Connect to test database
 */
export const connectTestDB = async () => {
  try {
    // Close existing connection if any
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      // Wait a bit for connection to fully close
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Connect to test database with options for better isolation
    await mongoose.connect(TEST_MONGO_URI, {
      // Use new connection settings for tests
      bufferCommands: false,
      maxPoolSize: 1, // Single connection for tests
    });
    console.log('Test MongoDB connected ✅');
  } catch (error) {
    console.error('Test MongoDB connection error ❌', error);
    throw error;
  }
};

/**
 * Clear test database collections - more aggressive cleanup
 * This ensures complete isolation between tests
 */
export const clearTestDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      return; // Not connected
    }
    
    const db = mongoose.connection.db;
    if (!db) {
      return;
    }
    
    // Import models to ensure they're registered
    const User = (await import('../../src/models/User.js')).default;
    const Product = (await import('../../src/models/Product.js')).default;
    const Cart = (await import('../../src/models/Cart.js')).default;
    const Order = (await import('../../src/models/Order.js')).default;
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    
    // Delete all documents from all collections (except system collections)
    const deletePromises = collections
      .filter(col => !col.name.startsWith('system.'))
      .map(async (collection) => {
        try {
          await db.collection(collection.name).deleteMany({});
        } catch (error) {
          // Ignore errors
        }
      });
    
    // Also explicitly delete from known models (double safety)
    deletePromises.push(
      User.deleteMany({}).catch(() => {}),
      Product.deleteMany({}).catch(() => {}),
      Cart.deleteMany({}).catch(() => {}),
      Order.deleteMany({}).catch(() => {})
    );
    
    await Promise.all(deletePromises);
    
    // Wait longer to ensure MongoDB indexes are fully updated and all operations complete
    await new Promise(resolve => setTimeout(resolve, 100));
  } catch (error) {
    console.error('Error clearing test database:', error);
  }
};

/**
 * Close test database connection
 */
export const closeTestDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    // Suppress console log in tests
    // console.log('Test MongoDB connection closed ✅');
  } catch (error) {
    console.error('Error closing test database:', error);
  }
};

/**
 * Setup before all tests
 */
export const setupBeforeAll = async () => {
  // Override MONGO_URI for tests
  process.env.MONGO_URI = TEST_MONGO_URI;
  
  // Reset app instance for fresh start
  testApp = null;
  
  // Connect to test database
  await connectTestDB();
  
  // Clear database before starting test suite
  await clearTestDB();
  
  // Setup test app
  setupTestApp();
};

/**
 * Cleanup after all tests in a test file
 * Note: When tests run in parallel, this may interfere with other test files
 * Consider using test-specific cleanup in beforeEach instead
 */
export const cleanupAfterAll = async () => {
  // Don't clear everything - let each test file manage its own cleanup
  // This prevents interference when tests run concurrently
  // await clearTestDB();
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Note: We don't close the connection here because other test files might need it
  // The connection will be closed at the very end of all tests
};

/**
 * Cleanup between test files - minimal cleanup to avoid interference
 */
export const cleanupBetweenTestFiles = async () => {
  // Don't clear everything - let each test file manage its own cleanup
  // This prevents interference when tests run concurrently
  // await clearTestDB();
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 50));
};

/**
 * Clear only Cart and Order collections (preserves Users and Products)
 * Use this in beforeEach() when you want to keep users and products
 * @param {string|string[]} userIds - Optional user ID(s) to clear carts/orders for. If not provided, clears all.
 */
export const clearCartAndOrders = async (userIds = null) => {
  try {
    if (mongoose.connection.readyState === 0) {
      return; // Not connected
    }
    
    const Cart = (await import('../../src/models/Cart.js')).default;
    const Order = (await import('../../src/models/Order.js')).default;
    
    // If userIds provided, only clear for those users (better test isolation)
    if (userIds) {
      const mongoose = (await import('mongoose')).default;
      const userIdArray = Array.isArray(userIds) ? userIds : [userIds];
      // Convert string IDs to ObjectIds for proper query matching
      const objectIdArray = userIdArray.map(id => 
        typeof id === 'string' ? new mongoose.Types.ObjectId(id) : id
      );
      await Promise.all([
        Cart.deleteMany({ user: { $in: objectIdArray } }).catch(() => {}),
        Order.deleteMany({ user: { $in: objectIdArray } }).catch(() => {})
      ]);
    } else {
      // Clear all carts and orders (for complete cleanup)
      await Promise.all([
        Cart.deleteMany({}).catch(() => {}),
        Order.deleteMany({}).catch(() => {})
      ]);
    }
    
    // Wait a bit to ensure cleanup is complete
    await new Promise(resolve => setTimeout(resolve, 50));
  } catch (error) {
    console.error('Error clearing cart and orders:', error);
  }
};

/**
 * Setup before each test - ensures clean state
 */
export const setupBeforeEach = async () => {
  // Ensure database is connected
  if (mongoose.connection.readyState === 0) {
    await connectTestDB();
  }
  
  // Clear all collections before each test - this is critical for test isolation
  await clearTestDB();
  
  // Wait longer to ensure MongoDB indexes are fully updated and cleanup is complete
  // This helps prevent race conditions with index updates
  await new Promise(resolve => setTimeout(resolve, 150));
};

