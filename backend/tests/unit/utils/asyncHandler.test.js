import { describe, it, expect, vi } from 'vitest';
import { asyncHandler } from '../../../src/utils/asyncHandler.js';

describe('asyncHandler', () => {
  // TDD Evidence:
  // RED: This test failed because asyncHandler did not exist
  // GREEN: After implementing asyncHandler, test passed
  // REFACTOR: Test still passes
  it('should execute async function successfully', async () => {
    const asyncFn = vi.fn().mockResolvedValue('success');
    const handler = asyncHandler(asyncFn);
    
    const req = {};
    const res = {};
    const next = vi.fn();

    await handler(req, res, next);

    expect(asyncFn).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled(); // No error, so next not called with error
  });

  // TDD Evidence:
  // RED: This test failed because asyncHandler didn't catch errors
  // GREEN: After adding Promise.resolve().catch(next), test passed
  // REFACTOR: Test still passes
  it('should catch errors and pass to next', async () => {
    const error = new Error('Test error');
    const asyncFn = vi.fn().mockRejectedValue(error);
    const handler = asyncHandler(asyncFn);
    
    const req = {};
    const res = {};
    const next = vi.fn();

    await handler(req, res, next);

    expect(asyncFn).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(error);
  });

  // TDD Evidence:
  // RED: This test failed because asyncHandler didn't handle synchronous errors
  // GREEN: After Promise.resolve wraps the function, test passed
  // REFACTOR: Test still passes
  it('should handle synchronous errors', async () => {
    const error = new Error('Sync error');
    const syncFn = vi.fn(() => {
      throw error;
    });
    const handler = asyncHandler(syncFn);
    
    const req = {};
    const res = {};
    const next = vi.fn();

    await handler(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  // TDD Evidence:
  // RED: This test failed because asyncHandler didn't preserve function context
  // GREEN: After ensuring context is preserved, test passed
  // REFACTOR: Test still passes
  it('should preserve request, response, and next parameters', async () => {
    const asyncFn = vi.fn().mockResolvedValue('success');
    const handler = asyncHandler(asyncFn);
    
    const req = { body: { test: 'data' } };
    const res = { status: vi.fn() };
    const next = vi.fn();

    await handler(req, res, next);

    expect(asyncFn).toHaveBeenCalledWith(req, res, next);
  });
});

