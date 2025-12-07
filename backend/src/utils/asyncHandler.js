// Utility to handle async route handlers and catch errors
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    try {
      const result = Promise.resolve(fn(req, res, next));
      return result.catch(next);
    } catch (error) {
      next(error);
    }
  };
};

