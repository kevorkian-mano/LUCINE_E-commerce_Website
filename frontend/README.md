# E-commerce Frontend

Modern React-based frontend for the E-commerce application built with Vite, React Router, and Tailwind CSS.

## Features

- ✅ User Authentication (Login/Register)
- ✅ Product Browsing & Search
- ✅ Shopping Cart Management
- ✅ Order Placement & History
- ✅ Admin Dashboard
- ✅ Product Management (Admin)
- ✅ Sales Analytics (Admin)
- ✅ Responsive Design
- ✅ Modern UI/UX

## Tech Stack

- **React 18** - UI Library
- **Vite** - Build Tool
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - HTTP Client
- **React Context API** - State Management
- **React Icons** - Icons
- **React Toastify** - Notifications

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment (Optional):**
   Create a `.env` file:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```

4. **Build for Production:**
   ```bash
   npm run build
   ```

5. **Preview Production Build:**
   ```bash
   npm run preview
   ```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── layout/          # Navbar, Footer, ProtectedRoute
│   ├── context/             # AuthContext, CartContext
│   ├── pages/               # All page components
│   │   ├── admin/           # Admin pages
│   │   ├── Home.jsx
│   │   ├── Products.jsx
│   │   ├── ProductDetails.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── Orders.jsx
│   │   ├── OrderDetails.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── utils/
│   │   └── api.js           # API client
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Available Routes

### Public Routes
- `/` - Home page
- `/products` - Product listing
- `/products/:id` - Product details
- `/login` - User login
- `/register` - User registration

### Protected Routes (Requires Authentication)
- `/cart` - Shopping cart
- `/checkout` - Checkout page
- `/orders` - Order history
- `/orders/:id` - Order details

### Admin Routes (Requires Admin Role)
- `/admin` - Admin dashboard
- `/admin/products` - Product management
- `/admin/orders` - All orders
- `/admin/analytics` - Sales analytics

## Features in Detail

### Authentication
- User registration with validation
- Secure login with JWT tokens
- Protected routes
- Role-based access control (Admin/Customer)

### Product Management
- Browse all products
- Search by name/description
- Filter by category and price
- Product details page
- Add to cart functionality

### Shopping Cart
- Add/remove items
- Update quantities
- Real-time cart total
- Persistent cart (per user)

### Order Management
- Place orders from cart
- View order history
- Order details with tracking
- Order status updates

### Admin Features
- Dashboard with analytics
- Product CRUD operations
- View all orders
- Sales analytics and reports
- Sales by category breakdown

## API Integration

The frontend communicates with the backend API through the `api.js` utility file. All API calls are centralized and include:
- Automatic token injection
- Error handling
- Response interceptors

## Styling

The application uses Tailwind CSS for styling with:
- Custom color palette (primary colors)
- Responsive design utilities
- Reusable component classes
- Modern UI components

## Development

The development server runs on `http://localhost:3000` by default and proxies API requests to `http://localhost:5000/api`.

## Production Build

The production build creates optimized static files in the `dist` directory, ready for deployment to any static hosting service.

