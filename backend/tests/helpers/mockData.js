// Mock data for testing

export const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashedpassword123',
  role: 'customer',
  createdAt: new Date(),
  updatedAt: new Date()
};

export const mockAdmin = {
  _id: '507f1f77bcf86cd799439012',
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'hashedpassword123',
  role: 'admin',
  createdAt: new Date(),
  updatedAt: new Date()
};

export const mockProduct = {
  _id: '507f1f77bcf86cd799439013',
  name: 'Test Product',
  description: 'Test Description',
  price: 99.99,
  category: 'Electronics',
  stock: 10,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

export const mockOrder = {
  _id: '507f1f77bcf86cd799439014',
  user: '507f1f77bcf86cd799439011',
  orderItems: [
    {
      product: '507f1f77bcf86cd799439013',
      name: 'Test Product',
      price: 99.99,
      quantity: 2
    }
  ],
  shippingAddress: {
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA'
  },
  paymentMethod: 'PayPal',
  itemsPrice: 199.98,
  shippingPrice: 10,
  taxPrice: 19.998,
  totalPrice: 229.978,
  isPaid: false,
  createdAt: new Date()
};

export const mockCart = {
  _id: '507f1f77bcf86cd799439015',
  user: '507f1f77bcf86cd799439011',
  items: [
    {
      product: mockProduct,
      quantity: 2
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
};

