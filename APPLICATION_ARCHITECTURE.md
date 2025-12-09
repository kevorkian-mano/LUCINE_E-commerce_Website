# E-Commerce Application Architecture & Testing Flow

## 🏗️ Application Architecture Overview

### Frontend Architecture (React + Vite)
```
frontend/
├── src/
│   ├── App.jsx                 # Main app component with routing
│   ├── main.jsx               # React entry point
│   ├── index.css              # Global styles
│   ├── context/               # Global state management
│   │   ├── AuthContext.jsx    # Authentication state
│   │   └── CartContext.jsx    # Shopping cart state
│   ├── pages/                 # Page components
│   │   ├── Home.jsx           # Home page
│   │   ├── Products.jsx       # Products listing
│   │   ├── ProductDetails.jsx # Single product view
│   │   ├── Cart.jsx           # Shopping cart page
│   │   ├── Checkout.jsx       # Checkout page
│   │   ├── Login.jsx          # Login page
│   │   ├── Register.jsx       # Registration page
│   │   ├── Orders.jsx         # User orders page
│   │   ├── OrderDetails.jsx   # Order details page
│   │   └── admin/             # Admin pages
│   │       ├── AdminDashboard.jsx
│   │       ├── AdminProducts.jsx
│   │       ├── AdminOrders.jsx
│   │       └── AdminAnalytics.jsx
│   ├── components/            # Reusable components
│   │   ├── layout/
│   │   │   ├── Navbar.jsx     # Navigation bar
│   │   │   ├── Footer.jsx     # Footer
│   │   │   ├── ProtectedRoute.jsx  # Auth protection
│   │   │   └── AdminRoute.jsx      # Admin protection
│   │   └── other components
│   └── utils/
│       └── api.js             # Axios API client
├── tests/                      # Unit & integration tests
│   ├── unit/                   # Unit tests
│   └── integration/            # Integration tests
└── cypress/                    # E2E tests
    ├── e2e/                    # Test files
    └── support/                # Helpers & commands
```

### Backend Architecture (Express + MongoDB)
```
backend/
├── src/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/           # Request handlers
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   └── paymentController.js
│   ├── models/                # MongoDB schemas
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   └── Order.js
│   ├── services/              # Business logic
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── cartService.js
│   │   ├── orderService.js
│   │   └── paymentService.js
│   ├── repositories/          # Data access
│   │   ├── userRepository.js
│   │   ├── productRepository.js
│   │   ├── cartRepository.js
│   │   └── orderRepository.js
│   ├── routes/                # Express routes
│   │   ├── userRoutes.js
│   │   ├── productRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   └── paymentRoutes.js
│   ├── factories/             # Factory pattern implementation
│   │   ├── ServiceFactory.js
│   │   └── RepositoryFactory.js
│   ├── observers/             # Observer pattern for events
│   │   ├── OrderObserver.js
│   │   ├── EmailNotificationObserver.js
│   │   ├── AnalyticsObserver.js
│   │   └── InventoryObserver.js
│   ├── middlewares/           # Express middleware
│   │   ├── auth.js            # JWT authentication
│   │   └── errorHandler.js
│   ├── utils/
│   │   └── AppError.js
│   └── strategies/            # Strategy pattern for emails
│       └── email/
├── tests/                      # Unit & integration tests
│   ├── unit/
│   ├── integration/
│   └── helpers/
└── server.js                   # Express app entry point
```

---

## 🔄 Data Flow & User Journey

### 1. Authentication Flow

```
User Registration
│
├─ Frontend: Register.jsx
│  ├─ User fills name, email, password
│  ├─ Submits form
│  └─ POST /api/users/register
│
├─ Backend: authController.register()
│  ├─ Validate input
│  ├─ Check if email exists
│  ├─ Hash password (bcryptjs)
│  ├─ Create User in MongoDB
│  ├─ Generate JWT token
│  └─ Return { user, token }
│
└─ Frontend: AuthContext.register()
   ├─ Store token in localStorage
   ├─ Store user in localStorage
   ├─ Update AuthContext state
   └─ Redirect to home

---

User Login
│
├─ Frontend: Login.jsx
│  ├─ User enters email & password
│  ├─ Submits form
│  └─ POST /api/users/login
│
├─ Backend: authController.login()
│  ├─ Validate credentials
│  ├─ Compare password hash
│  ├─ Generate JWT token
│  └─ Return { user, token }
│
└─ Frontend: AuthContext.login()
   ├─ Store token & user in localStorage
   ├─ AuthContext calls getProfile to verify
   ├─ Update AuthContext state
   └─ Available for protected pages
```

### 2. Product Browsing Flow

```
User Views Products
│
├─ Frontend: Products.jsx
│  ├─ Component mounts
│  ├─ GET /api/products
│  └─ User can search/filter
│
├─ Backend: productController.getAll()
│  ├─ Query MongoDB
│  ├─ Apply filters/search
│  └─ Return products array
│
└─ Frontend: Display products
   ├─ Render product cards
   ├─ Show prices & descriptions
   └─ Links to product details

---

View Product Details
│
├─ Frontend: ProductDetails.jsx
│  ├─ Receives product ID from URL
│  ├─ GET /api/products/:id
│  └─ Display full details
│
├─ Backend: productController.getById()
│  ├─ Find product by ID
│  ├─ Return product data
│  └─ Include images & description
│
└─ Frontend: Show "Add to Cart" button
```

### 3. Shopping Cart Flow

```
Add to Cart
│
├─ Frontend: ProductDetails.jsx
│  ├─ User clicks "Add to Cart"
│  ├─ POST /api/cart/items
│  └─ Pass { productId, quantity }
│
├─ Backend: cartController.addItem()
│  ├─ Verify user authenticated (JWT)
│  ├─ Find/create cart for user
│  ├─ Add/update product in cart
│  ├─ Update cart total
│  └─ Return updated cart
│
├─ Frontend: CartContext.addToCart()
│  ├─ Update cart state
│  ├─ Show "Added to cart" toast
│  └─ Update cart icon count
│
└─ Page: Cart shows item added

---

View Cart
│
├─ Frontend: Cart.jsx
│  ├─ Requires authentication
│  ├─ CartContext fetches cart
│  └─ GET /api/cart
│
├─ Backend: cartController.getCart()
│  ├─ Find cart for authenticated user
│  ├─ Return cart with items
│  └─ Include product details
│
└─ Frontend: CartContext.cart
   ├─ Display items
   ├─ Show totals
   ├─ Allow quantity updates
   ├─ Allow item removal
   └─ "Proceed to Checkout" button
```

### 4. Checkout & Order Flow

```
Checkout
│
├─ Frontend: Checkout.jsx
│  ├─ Requires authentication
│  ├─ Gets cart from CartContext
│  ├─ If cart empty → redirect to /cart
│  └─ Display checkout form
│
├─ User fills:
│  ├─ Shipping address (street, city, etc)
│  ├─ Payment method (PayPal, Stripe, Bank Transfer)
│  └─ Submits form
│
├─ Frontend: POST /api/orders
│  └─ Pass { shippingAddress, paymentMethod, cartItems }
│
├─ Backend: orderController.create()
│  ├─ Verify user authenticated
│  ├─ Validate cart items exist
│  ├─ Calculate order total
│  ├─ Create Order in MongoDB
│  ├─ Clear user's cart
│  ├─ Trigger order observers:
│  │  ├─ EmailNotificationObserver → Send confirmation email
│  │  ├─ AnalyticsObserver → Update sales stats
│  │  └─ InventoryObserver → Update stock
│  └─ Return { orderId, status }
│
└─ Frontend: OrderDetails.jsx
   ├─ Display order confirmation
   ├─ Show order number, items, total
   └─ Option to return to shopping
```

### 5. Orders History Flow

```
View My Orders
│
├─ Frontend: Orders.jsx
│  ├─ Requires authentication
│  ├─ GET /api/orders/my-orders
│  └─ Display user's orders
│
├─ Backend: orderController.getUserOrders()
│  ├─ Get authenticated user ID
│  ├─ Query all orders for user
│  ├─ Return orders array
│  └─ Include status, total, date
│
└─ Frontend: Show order list
   ├─ Each order has:
   │  ├─ Order ID
   │  ├─ Date
   │  ├─ Total amount
   │  └─ Status (pending, completed, etc)
   └─ Click to see details

---

View Order Details
│
├─ Frontend: OrderDetails.jsx
│  ├─ Receives order ID from URL
│  ├─ GET /api/orders/:id
│  └─ Display full order info
│
├─ Backend: orderController.getById()
│  ├─ Find order by ID
│  ├─ Verify user owns order
│  ├─ Include all items & details
│  └─ Return full order data
│
└─ Frontend: Show order details
   ├─ Items ordered
   ├─ Prices & quantities
   ├─ Shipping address
   ├─ Payment method
   └─ Order status
```

---

## 🔐 Authentication & Authorization

### JWT Token Flow
```
1. User registers/logs in
   ↓
2. Backend generates JWT token with user ID & role
   ↓
3. Token sent to frontend
   ↓
4. Frontend stores in localStorage
   ↓
5. Every API request includes: Authorization: Bearer <token>
   ↓
6. Backend auth middleware verifies token
   ↓
7. Request proceeds or returns 401 Unauthorized
```

### Protected Routes
```javascript
// Frontend
<Route 
  path="/cart" 
  element={
    <ProtectedRoute>
      <Cart />
    </ProtectedRoute>
  } 
/>

// What ProtectedRoute does:
// 1. Check if user exists in AuthContext
// 2. If no user → redirect to /login
// 3. If user exists → render <Cart />

// Backend
app.get('/api/cart', auth, cartController.getCart)

// What auth middleware does:
// 1. Extract token from Authorization header
// 2. Verify token signature
// 3. Decode user ID from token
// 4. Attach user to request
// 5. Proceed to controller
```

### Admin Routes
```javascript
// Frontend
<Route 
  path="/admin" 
  element={
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  } 
/>

// What AdminRoute does:
// 1. Check if user is authenticated
// 2. Check if user.role === 'admin'
// 3. If not admin → redirect to home
// 4. If admin → render component
```

---

## 🧪 Testing Each Flow

### Unit Tests (Backend)
```
✅ Auth Service Tests
   ├─ Register validation
   ├─ Login verification
   ├─ Password hashing
   └─ Token generation

✅ Product Service Tests
   ├─ Get all products
   ├─ Search products
   ├─ Filter by category
   └─ Get single product

✅ Cart Service Tests
   ├─ Add item to cart
   ├─ Remove item from cart
   ├─ Update quantities
   └─ Calculate totals

✅ Order Service Tests
   ├─ Create order
   ├─ Validate items exist
   ├─ Calculate totals
   └─ Clear cart after order
```

### Integration Tests (Backend)
```
✅ Full Auth Flow
   ├─ Register → Login → Token verification

✅ Cart Operations
   ├─ Add product → View cart → Modify item

✅ Order Creation
   ├─ Cart → Checkout → Order created → Email sent

✅ Payment Processing
   ├─ Process Stripe payment
   ├─ Process PayPal payment
   └─ Update order status
```

### Unit Tests (Frontend)
```
✅ Component Tests
   ├─ Login form submission
   ├─ Product card rendering
   ├─ Cart item display
   └─ Checkout form validation

✅ Context Tests
   ├─ AuthContext updates
   ├─ CartContext state changes
   └─ Error handling
```

### Integration Tests (Frontend)
```
✅ Auth Flow
   ├─ Register → Login → Token stored → Protected page access

✅ Shopping Flow
   ├─ Browse → Product details → Add to cart → View cart

✅ Checkout Flow
   ├─ Cart → Checkout form → Order submission → Order page
```

### E2E Tests (Cypress)
```
✅ Complete User Journey
   ├─ Register new user
   ├─ Browse products
   ├─ Add to cart
   ├─ Checkout
   ├─ View orders
   └─ And more...
```

---

## 🔍 Key Components & Their Roles

### AuthContext
**Purpose:** Global authentication state management
```javascript
Provides:
├─ user (current logged-in user or null)
├─ loading (boolean for loading state)
├─ register(userData) → Creates user & stores token
├─ login(email, password) → Authenticates & stores token
├─ logout() → Clears token & user data
└─ isAdmin (boolean helper)

UseEffect:
└─ On mount: Checks localStorage for token & verifies it
```

### CartContext
**Purpose:** Global cart state management
```javascript
Provides:
├─ cart (user's shopping cart)
├─ loading (boolean for loading state)
├─ addToCart(productId, quantity)
├─ updateCartItem(productId, quantity)
├─ removeFromCart(productId)
├─ clearCart()
├─ cartItemCount (derived total items)
└─ cartTotal (derived total price)

UseEffect:
└─ When user changes: Fetches user's cart from backend
```

### API Client (axios)
**Purpose:** HTTP communication with backend
```javascript
Exports:
├─ authAPI.register()
├─ authAPI.login()
├─ authAPI.getProfile()
├─ productAPI.getAll()
├─ productAPI.search()
├─ cartAPI.getCart()
├─ cartAPI.addItem()
├─ orderAPI.create()
└─ orderAPI.getUserOrders()

Features:
├─ Automatic token attachment to headers
├─ Error handling (401 → redirect to login)
└─ Base URL configuration
```

---

## 📊 Data Models

### User
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['customer', 'admin']),
  createdAt: Date,
  updatedAt: Date
}
```

### Product
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  category: String,
  image: String (URL),
  stock: Number,
  rating: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Cart
```javascript
{
  _id: ObjectId,
  user: ObjectId (User reference),
  items: [{
    product: ObjectId (Product reference),
    quantity: Number,
    price: Number
  }],
  total: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Order
```javascript
{
  _id: ObjectId,
  user: ObjectId (User reference),
  items: [{
    product: ObjectId (Product reference),
    quantity: Number,
    price: Number
  }],
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  paymentMethod: String (enum: ['Stripe', 'PayPal', 'Bank Transfer']),
  status: String (enum: ['pending', 'completed', 'shipped', 'delivered']),
  total: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎬 State Transitions

### User State Transitions
```
┌─────────────┐
│  Anonymous  │ (no token, no user)
└─────────────┘
      │ Register/Login
      ▼
┌─────────────────────┐
│  Authenticated      │ (token in localStorage)
│  (Role: customer)   │
└─────────────────────┘
      │ Access protected pages
      ▼
┌──────────────────────────┐
│  Can view cart, orders   │
│  Can checkout, purchase  │
└──────────────────────────┘
      │ Logout or token expires
      ▼
┌─────────────┐
│  Anonymous  │
└─────────────┘
```

### Cart State Transitions
```
┌─────────────┐
│ No User     │ (cart is null)
└─────────────┘
      │ User logs in
      ▼
┌─────────────────┐
│ Empty Cart      │ (cart exists, no items)
└─────────────────┘
      │ Add product
      ▼
┌─────────────────┐
│ Items in Cart   │ (1+ items)
└─────────────────┘
      │ Proceed to checkout
      ▼
┌─────────────────┐
│ Order Created   │ (cart cleared)
└─────────────────┘
      │ User logs out
      ▼
┌─────────────┐
│ No Cart     │
└─────────────┘
```

---

## 🧠 Understanding Test Context

When you run Cypress tests, the following happens:

1. **Setup Phase**
   ```
   beforeEach() → Clear auth → Set up intercepts
   ```

2. **Execution Phase**
   ```
   cy.visit() → Page loads
        ↓
   AuthContext.useEffect() → Checks token
        ↓
   If user: CartContext.useEffect() → Fetches cart
        ↓
   UI renders with state
   ```

3. **Assertion Phase**
   ```
   Verify correct content displayed
   Verify API calls made correctly
   Verify state changes happened
   ```

4. **Cleanup Phase**
   ```
   Test ends → cy.clearAuth() in next test's beforeEach()
   ```

---

## ✅ Checklist for Understanding the System

- [ ] Understand how JWT tokens work
- [ ] Know what AuthContext provides
- [ ] Know what CartContext provides
- [ ] Understand protected routes
- [ ] Know the complete order flow
- [ ] Understand API structure
- [ ] Know the data models
- [ ] Understand state transitions
- [ ] Know how tests interact with this system

---

**Last Updated:** December 9, 2025
**Purpose:** Help understand application flow for E2E testing
