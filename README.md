# LUCINE - Full-Stack E-Commerce Platform

A modern, production-ready e-commerce application built with the MERN stack, featuring secure payment processing, comprehensive testing, and professional design patterns.

![Status](https://img.shields.io/badge/status-production--ready-success)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18.2.0-blue)
![MongoDB](https://img.shields.io/badge/mongodb-latest-green)

---

## 🚀 Features

### Core Functionality
- **User Authentication** - Secure JWT-based auth with role-based access control
- **Product Management** - Advanced search, filtering, and category browsing
- **Shopping Cart** - Real-time cart with stock validation and persistence
- **Order Processing** - Complete checkout flow with transaction safety
- **Admin Dashboard** - Product management, sales analytics, and order tracking
- **Email Notifications** - Automated order confirmations with beautiful HTML templates

### Payment Integration
- **Stripe** - Secure credit/debit card processing with Stripe Elements


### Quality Assurance
- **Unit Testing** - 200+ backend tests, 112+ frontend tests (TDD approach)
- **Integration Testing** - Later On ...
- **End To End Testing** - Later ON ...

---

## 🏗️ Architecture

Built following **Layered (3-Tier) Architecture** with SOLID principles:

```
┌─────────────────────────────────────┐
│   Presentation Layer (Frontend)     │
│   React Components & Pages          │
└─────────────────────────────────────┘
              ↕
┌─────────────────────────────────────┐
│   Business Logic Layer (Services)   │
│   Business Rules & Transactions     │
└─────────────────────────────────────┘
              ↕
┌─────────────────────────────────────┐
│   Data Access Layer (Repositories)  │
│   MongoDB with Mongoose             │
└─────────────────────────────────────┘
```

---

## 🎨 Design Patterns

The application implements three key design patterns for maintainability and scalability:

### 1. Strategy Pattern - Email Templates
**Problem:** Hard to add new email types without modifying existing code  
**Solution:** Separate strategy classes for each email template (Order Confirmation, Password Reset)  
**Benefit:** Easy to extend with new email types, isolated validation, testable components

**Implementation:**
- `EmailTemplateStrategy` - Base interface
- `OrderConfirmationTemplate` - Order confirmation emails
- `PasswordResetTemplate` - Password reset emails
- `EmailTemplateFactory` - Creates appropriate template strategy

### 2. Observer Pattern - Order Notifications
**Problem:** OrderService tightly coupled to notification services  
**Solution:** Observer pattern decouples order events from notification logic  
**Benefit:** Add/remove notifications without changing order logic, fault-tolerant

**Implementation:**
- `OrderObserver` - Subject that notifies observers
- `EmailNotificationObserver` - Sends emails on order events
- `AnalyticsObserver` - Updates sales analytics
- `InventoryObserver` - Manages stock levels

### 3. Factory Method Pattern - Service Creation
**Problem:** Complex dependencies and tight coupling in service creation  
**Solution:** Factory handles service instantiation with dependency injection  
**Benefit:** Easy testing with mocks, flexible dependency management

**Implementation:**
- `ServiceFactory` - Creates services with proper dependencies
- `RepositoryFactory` - Manages repository creation
- Supports both singleton and factory-based instantiation

---

## 💳 Payment Integration

### Stripe Integration
- Secure card processing with Stripe Elements

**Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

---

## 📧 Email Service

Automated email notifications powered by Gmail SMTP:

- **Order Confirmation** - Sent after successful payment



---

## 🧪 Testing

### Backend Testing
- **200+ Unit Tests** - All passing ✅
- **TDD Approach** - Test-Driven Development evidence in all tests
- **Coverage:** Controllers, Services, Repositories, Models, Middlewares, Utils

**Test Framework:** Vitest  
**Coverage Areas:**
- Authentication & Authorization
- Product Management
- Cart Operations
- Order Processing
- Payment Handling
- Email Notifications

### Frontend Testing
- **112+ Unit Tests** - Comprehensive component testing
- **TDD Evidence** - Test-driven development throughout
- **Coverage:** Pages, Components, Contexts, Utils

**Test Framework:** Vitest + React Testing Library  
**Coverage Areas:**
- User Authentication Flow
- Product Browsing & Search
- Shopping Cart Management
- Checkout Process
- Order Management
- Admin Dashboard

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js with Express
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT + bcrypt
- **Email:** Nodemailer (Gmail SMTP)
- **Payments:** Stripe SDK
- **Testing:** Vitest
- **Architecture:** Layered (3-Tier) with SOLID principles

### Frontend
- **Framework:** React 18 with Vite
- **Routing:** React Router DOM
- **Styling:** Tailwind CSS
- **State Management:** Context API
- **HTTP Client:** Axios
- **UI Components:** React Icons, React Toastify
- **Payments:** Stripe.js
- **Testing:** Vitest + React Testing Library

---

## 📦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. **Navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create `backend/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRE=7d
   
   # Email Configuration (Gmail SMTP)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   
   # Stripe (Optional - for payment processing)
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_TEST_SECRET_KEY=sk_test_...
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables (Optional):**
   Create `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:3000`

### Running Tests

**Backend:**
```bash
cd backend
npm test
```

**Frontend Unit/Integration:**
```bash
cd frontend
npm test
```

**Frontend E2E (Cypress):**
```bash
# Make sure both backend and frontend servers are running first!

# Terminal 1: Start backend
cd backend && npm run dev

# Terminal 2: Start frontend
cd frontend && npm run dev

# Terminal 3: Run E2E tests
cd frontend && npm run e2e

# Or use the helper script
cd frontend && ./run-e2e-tests.sh

# Or open Cypress GUI for interactive testing
cd frontend && npm run e2e:open
```

---

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control (Admin/Customer)
- Input validation and sanitization
- Protected API endpoints
- Secure payment processing
- Environment variable protection

---

## 📊 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── repositories/    # Data access
│   │   ├── models/          # Database schemas
│   │   ├── routes/          # API routes
│   │   ├── middlewares/     # Auth & error handling
│   │   ├── observers/       # Observer pattern
│   │   ├── strategies/     # Strategy pattern
│   │   └── factories/       # Factory pattern
│   └── tests/              # Unit tests
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── context/         # State management
│   │   ├── utils/           # Utilities
│   │   └── components/payment/  # Payment components
│   └── tests/               # Unit tests
│
└── documents/               # Project documentation
```

---

## 🎯 Key Highlights

**Production-Ready** - Complete error handling, validation, and security  
**Well-Tested** - 300+ unit tests with TDD approach  
**Scalable Architecture** - Design patterns for maintainability  
**Payment Ready** - Stripe integration  
**Professional Emails** - Automated order confirmations  
**Modern UI** - Responsive design with Tailwind CSS  
**SOLID Principles** - Clean, maintainable codebase  

---

## To Do Later On

- **Integration** and **E2E** Tests
- Complete Missing Unit tests If there are
- **OTP Generation** 


---

## 📝 License

This project is created for educational purposes.

---

**Built with LOVE using MERN Stack**
