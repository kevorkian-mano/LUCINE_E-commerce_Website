// Validation utility functions

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateProductData = (data) => {
  const errors = [];
  if (!data.name || data.name.trim().length === 0) {
    errors.push("Product name is required");
  }
  if (!data.description || data.description.trim().length === 0) {
    errors.push("Product description is required");
  }
  if (!data.price || data.price <= 0) {
    errors.push("Valid price is required");
  }
  if (!data.category || data.category.trim().length === 0) {
    errors.push("Product category is required");
  }
  if (data.stock === undefined || data.stock < 0) {
    errors.push("Valid stock quantity is required");
  }
  return errors;
};

export const validateShippingAddress = (address) => {
  const errors = [];
  if (!address.street || address.street.trim().length === 0) {
    errors.push("Street address is required");
  }
  if (!address.city || address.city.trim().length === 0) {
    errors.push("City is required");
  }
  if (!address.state || address.state.trim().length === 0) {
    errors.push("State is required");
  }
  if (!address.zipCode || address.zipCode.trim().length === 0) {
    errors.push("Zip code is required");
  }
  if (!address.country || address.country.trim().length === 0) {
    errors.push("Country is required");
  }
  return errors;
};

