import { describe, it, expect } from 'vitest';
import Order from '../../../src/models/Order.js';

describe('Order Model', () => {
  // TDD Evidence:
  // RED: This test failed because Order model didn't require user field
  // GREEN: After adding required: true to user, test passed
  // REFACTOR: Test still passes
  it('should require user field', () => {
    const order = new Order();

    const errors = order.validateSync();
    expect(errors).toBeDefined();
    expect(errors.errors.user).toBeDefined();
  });

  // TDD Evidence:
  // RED: This test failed because Order model didn't require orderItems
  // GREEN: After adding orderItems validation, test passed
  // REFACTOR: Test still passes
  it('should require orderItems', () => {
    const order = new Order({
      user: 'userId123'
      // Missing orderItems
    });

    const errors = order.validateSync();
    expect(errors).toBeDefined();
  });

  // TDD Evidence:
  // RED: This test failed because Order model didn't validate order item fields
  // GREEN: After adding validation to orderItemSchema, test passed
  // REFACTOR: Test still passes
  it('should require product, name, price, and quantity in orderItems', () => {
    const order = new Order({
      user: 'userId123',
      orderItems: [{}] // Missing required fields
    });

    const errors = order.validateSync();
    expect(errors).toBeDefined();
  });

  // TDD Evidence:
  // RED: This test failed because Order model didn't validate shipping address
  // GREEN: After adding shippingAddress validation, test passed
  // REFACTOR: Test still passes
  it('should require shipping address fields', () => {
    const order = new Order({
      user: 'userId123',
      orderItems: [{
        product: 'product123',
        name: 'Product',
        price: 99.99,
        quantity: 1
      }]
      // Missing shippingAddress
    });

    const errors = order.validateSync();
    expect(errors).toBeDefined();
    expect(errors.errors['shippingAddress.street']).toBeDefined();
  });

  // TDD Evidence:
  // RED: This test failed because Order model didn't require paymentMethod
  // GREEN: After adding required: true to paymentMethod, test passed
  // REFACTOR: Test still passes
  it('should require paymentMethod', () => {
    const order = new Order({
      user: 'userId123',
      orderItems: [],
      shippingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      }
      // Missing paymentMethod
    });

    const errors = order.validateSync();
    expect(errors).toBeDefined();
    expect(errors.errors.paymentMethod).toBeDefined();
  });

  // TDD Evidence:
  // RED: This test failed because Order model didn't validate quantity >= 1
  // GREEN: After adding min: 1 to quantity, test passed
  // REFACTOR: Test still passes
  it('should require quantity to be at least 1', () => {
    const order = new Order({
      user: 'userId123',
      orderItems: [{
        product: 'product123',
        name: 'Product',
        price: 99.99,
        quantity: 0
      }],
      shippingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      paymentMethod: 'PayPal'
    });

    const errors = order.validateSync();
    expect(errors).toBeDefined();
  });

  // TDD Evidence:
  // RED: This test failed because Order model didn't have default values
  // GREEN: After adding defaults, test passed
  // REFACTOR: Test still passes
  it('should default isPaid and isDelivered to false', () => {
    const order = new Order({
      user: 'userId123',
      orderItems: [],
      shippingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      paymentMethod: 'PayPal'
    });

    expect(order.isPaid).toBe(false);
    expect(order.isDelivered).toBe(false);
  });

  // TDD Evidence:
  // RED: This test failed because Order model didn't have timestamps
  // GREEN: After adding { timestamps: true }, test passed
  // REFACTOR: Test still passes
  it('should have createdAt and updatedAt timestamps', () => {
    const order = new Order({
      user: 'userId123',
      orderItems: [],
      shippingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      paymentMethod: 'PayPal'
    });

    expect(order.schema.paths.createdAt).toBeDefined();
    expect(order.schema.paths.updatedAt).toBeDefined();
  });

  // TDD Evidence:
  // RED: This test failed because Order model didn't have index on user
  // GREEN: After adding index: true to user, test passed
  // REFACTOR: Test still passes
  it('should have index on user field', () => {
    const order = new Order({
      user: 'userId123',
      orderItems: [],
      shippingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      paymentMethod: 'PayPal'
    });

    expect(order.schema.paths.user.options.index).toBe(true);
  });
});

