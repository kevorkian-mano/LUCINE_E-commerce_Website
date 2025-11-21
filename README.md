# E-commerce Full-Stack Application

A complete MERN stack e-commerce application with modern UI, secure authentication, shopping cart, order management, and admin dashboard.

## 🚀 Project Overview

This project implements a full-stack e-commerce solution following **Layered (3-Tier) Architecture** with SOLID principles, featuring both imperative and declarative programming styles.

### Features

- ✅ User Authentication (Register, Login, Logout)
- ✅ Product Browsing & Advanced Search
- ✅ Shopping Cart Management
- ✅ Order Placement & History
- ✅ Email Notifications
- ✅ Admin Dashboard
- ✅ Product Management (CRUD)
- ✅ Sales Analytics & Reports
- ✅ Responsive Design
- ✅ Secure & Scalable

## 📁 Project Structure

```
Testing Project/
├── backend/          # Node.js/Express API
│   ├── src/
│   │   ├── config/      # Database configuration
│   │   ├── models/      # Mongoose models
│   │   ├── repositories/# Data access layer
│   │   ├── services/    # Business logic layer
│   │   ├── controllers/ # Request handlers
│   │   ├── routes/      # API routes
│   │   ├── middlewares/ # Auth, error handling
│   │   └── utils/       # Utilities (JWT, email, etc.)
│   └── server.js
│
└── frontend/        # React application
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── context/     # State management
    │   ├── pages/       # Page components
    │   ├── utils/       # API client, helpers
    │   └── App.jsx
    └── package.json
```

## 🛠️ Tech Stack

### Backend
- **Node.js** with **Express**
- **MongoDB** with **Mongoose**
- **JWT** for authentication
- **bcrypt** for password hashing
- **Nodemailer** for emails
- **Layered Architecture** (3-tier)

### Frontend
- **React 18** with **Vite**
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API calls
- **Context API** for state management
- **React Icons** & **React Toastify**

## 🚦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRE=7d
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

   Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Create `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   Frontend will run on `http://localhost:3000`

## 📚 API Documentation

See [backend/API_DOCUMENTATION.md](./backend/API_DOCUMENTATION.md) for complete API endpoint documentation.

## 🎯 Functional Requirements

- ✅ **FR1:** User registration, login, and logout
- ✅ **FR2:** Product browsing and search (by category, name, price)
- ✅ **FR3:** Shopping cart management (add/remove items)
- ✅ **FR4:** Order placement and order history
- ✅ **FR5:** Email notifications for orders
- ✅ **FR6:** Admin product management and sales analytics

## 🎨 Non-Functional Requirements

- ✅ **NFR1:** Performance (indexed queries, optimized responses)
- ✅ **NFR2:** Reliability (error handling, transactions)
- ✅ **NFR3:** Security (bcrypt, JWT, RBAC)
- ✅ **NFR4:** Maintainability (SOLID principles, modular code)
- ✅ **NFR5:** Concurrency (atomic operations, transactions)
- ✅ **NFR6:** Usability (responsive design, accessible UI)

## 🏗️ Architecture

The application follows **Layered (3-Tier) Architecture**:

1. **Presentation Layer** (Frontend)
   - React components and pages
   - User interface and interactions

2. **Business Logic Layer** (Backend Services)
   - Service classes with business rules
   - Transaction management
   - Email notifications

3. **Data Access Layer** (Repositories & Database)
   - Repository pattern
   - MongoDB with Mongoose
   - Data models and schemas

## 🔐 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control (Admin/Customer)
- Input validation
- Protected routes
- Secure API endpoints

## 📱 Responsive Design

The frontend is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile devices

## 🧪 Testing the Application

### Happy Path Scenario:

1. **Register a new user:**
   - Go to `/register`
   - Fill in details and create account

2. **Browse products:**
   - Visit `/products`
   - Search and filter products

3. **Add to cart:**
   - View product details
   - Add items to cart

4. **Place order:**
   - Go to cart (`/cart`)
   - Proceed to checkout (`/checkout`)
   - Complete order

5. **View orders:**
   - Check order history (`/orders`)
   - View order details

### Admin Features:

1. Login as admin user
2. Access admin dashboard (`/admin`)
3. Manage products (`/admin/products`)
4. View all orders (`/admin/orders`)
5. Check analytics (`/admin/analytics`)

## 📝 Code Quality

- ✅ SOLID principles applied
- ✅ Separation of concerns
- ✅ Modular architecture
- ✅ Clean code practices
- ✅ Error handling throughout
- ✅ Input validation
- ✅ No syntax errors

## 🚀 Deployment

### Backend Deployment
- Set up MongoDB (MongoDB Atlas recommended)
- Configure environment variables
- Deploy to services like Heroku, Railway, or AWS

### Frontend Deployment
- Build the project: `npm run build`
- Deploy `dist` folder to:
  - Vercel
  - Netlify
  - AWS S3 + CloudFront
  - Any static hosting service

## 📄 License

This project is created for educational purposes.

## 👥 Contributing

This is a project implementation. For questions or issues, please refer to the documentation in each directory.

---

**Status:** ✅ **Beta Version Complete - Ready for Testing**
