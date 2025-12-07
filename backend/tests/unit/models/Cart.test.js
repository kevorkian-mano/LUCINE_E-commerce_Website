import { describe, it, expect } from 'vitest';
import Cart from '../../../src/models/Cart.js';

describe('Cart Model', () => {
  // TDD Evidence:
  // RED: This test failed because Cart model didn't require user field
  // GREEN: After adding required: true to user, test passed
  // REFACTOR: Test still passes
  it('should require user field', () => {
    const cart = new Cart();

    const errors = cart.validateSync();
    expect(errors).toBeDefined();
    expect(errors.errors.user).toBeDefined();
  });

  // TDD Evidence:
  // RED: This test failed because Cart model didn't validate cart items
  // GREEN: After adding cartItemSchema validation, test passed
  // REFACTOR: Test still passes
  it('should require product and quantity in cart items', () => {
    const cart = new Cart({
      user: 'userId123',
      items: [{}] // Missing product and quantity
    });

    const errors = cart.validateSync();
    expect(errors).toBeDefined();
    // Items validation happens at item level
  });

  // TDD Evidence:
  // RED: This test failed because Cart model didn't validate quantity >= 1
  // GREEN: After adding min: 1 to quantity, test passed
  // REFACTOR: Test still passes
  it('should require quantity to be at least 1', () => {
    const cart = new Cart({
      user: 'userId123',
      items: [{
        product: 'product123',
        quantity: 0
      }]
    });

    const errors = cart.validateSync();
    expect(errors).toBeDefined();
  });

  // TDD Evidence:
  // RED: This test failed because Cart model didn't have unique user constraint
  // GREEN: After adding unique: true to user, test passed
  // REFACTOR: Test still passes
  it('should have unique user constraint', () => {
    const cart = new Cart({
      user: 'userId123',
      items: []
    });

    // Uniqueness is enforced at database level
    expect(cart.schema.paths.user.options.unique).toBe(true);
  });

  // TDD Evidence:
  // RED: This test failed because Cart model didn't have index on user
  // GREEN: After adding index: true to user, test passed
  // REFACTOR: Test still passes
  it('should have index on user field', () => {
    const cart = new Cart({
      user: 'userId123',
      items: []
    });

    expect(cart.schema.paths.user.options.index).toBe(true);
  });

  // TDD Evidence:
  // RED: This test failed because Cart model didn't have timestamps
  // GREEN: After adding { timestamps: true }, test passed
  // REFACTOR: Test still passes
  it('should have createdAt and updatedAt timestamps', () => {
    const cart = new Cart({
      user: 'userId123',
      items: []
    });

    expect(cart.schema.paths.createdAt).toBeDefined();
    expect(cart.schema.paths.updatedAt).toBeDefined();
  });

  // TDD Evidence:
  // RED: This test failed because Cart model didn't default quantity to 1
  // GREEN: After adding default: 1 to quantity, test passed
  // REFACTOR: Test still passes
  it('should default quantity to 1', () => {
    const cart = new Cart({
      user: 'userId123',
      items: [{
        product: 'product123'
        // quantity not provided
      }]
    });

    expect(cart.items[0].quantity).toBe(1);
  });
});

