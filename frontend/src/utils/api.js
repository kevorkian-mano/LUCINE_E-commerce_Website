import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/users/register', data),
  login: (data) => api.post('/users/login', data),
  getProfile: () => api.get('/users/profile'),
  logout: () => api.post('/users/logout'),
};

// Product API
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  search: (params) => api.get('/products/search', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
  getByCategory: (category) => api.get(`/products/category/${category}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addItem: (data) => api.post('/cart/items', data),
  updateItem: (productId, quantity) => api.put(`/cart/items/${productId}`, { quantity }),
  removeItem: (productId) => api.delete(`/cart/items/${productId}`),
  clearCart: () => api.delete('/cart'),
};

// Order API
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getUserOrders: () => api.get('/orders/my-orders'),
  getById: (id) => api.get(`/orders/${id}`),
  updatePayment: (id, data) => api.put(`/orders/${id}/payment`, data),
  getAll: () => api.get('/orders'),
  getAnalytics: (params) => api.get('/orders/analytics/sales', { params }),
  getSalesByCategory: (params) => api.get('/orders/analytics/category', { params }),
};

// Payment API
export const paymentAPI = {
  createIntent: (data) => api.post('/payments/create-intent', data),
  confirm: (data) => api.post('/payments/confirm', data),
  getStatus: (paymentIntentId) => api.get(`/payments/status/${paymentIntentId}`),
  cancel: (paymentIntentId) => api.post('/payments/cancel', { paymentIntentId }),
};

// PayPal API
export const paypalAPI = {
  createOrder: (data) => api.post('/paypal/create-order', data),
  captureOrder: (data) => api.post('/paypal/capture-order', data),
  getOrderStatus: (paypalOrderId) => api.get(`/paypal/order/${paypalOrderId}`),
};

export default api;
