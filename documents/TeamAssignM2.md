# 👥 Team Contributions In Milestone Two

The project was divided into 6 major components, each assigned to a team member who implemented their section following clean code principles and SOLID design patterns.

---

### 1. **Manuel** - Backend Infrastructure & Configuration

**Responsibilities:**
- Server setup and configuration
- Database connection and configuration
- Middleware implementation (authentication, error handling)
- Utility functions (JWT, validators, async handlers)
- Email service configuration
- Project structure and architecture foundation



**Key Achievements:**
- ✅ Implemented centralized error handling middleware
- ✅ Created reusable authentication middleware with role-based access control
- ✅ Set up database connection with proper error handling
- ✅ Developed utility functions following DRY principles
- ✅ Configured email service with template support
- ✅ Established project foundation with clean architecture

**SOLID Principles Applied:**
- **Single Responsibility**: Each utility has one clear purpose
- **Dependency Inversion**: Middleware depends on abstractions (JWT utils)

**Programming Paradigms:**
- **Imperative**: Step-by-step middleware logic, error handling flow
- **Declarative**: Route definitions, configuration objects

---

### 2. **Ebram** - Authentication & User Management

**Responsibilities:**
- User authentication system (register, login, logout)
- User model and schema design
- Password hashing and security
- User repository implementation
- Authentication service with business logic
- User routes and controllers

**Key Achievements:**
- ✅ Implemented secure password hashing with bcrypt
- ✅ Created JWT-based authentication system
- ✅ Built role-based access control (Admin/Customer)
- ✅ Developed user registration and login flows
- ✅ Created protected routes for frontend
- ✅ Implemented token management and validation

**SOLID Principles Applied:**
- **Single Responsibility**: AuthService handles only authentication logic
- **Open/Closed**: Extensible authentication methods
- **Dependency Inversion**: Service depends on repository abstraction

**Programming Paradigms:**
- **Imperative**: Step-by-step authentication flow, validation logic
- **Declarative**: React Context API for state management, route definitions

---

### 3. **Ammar** - Product Management System

**Responsibilities:**
- Product model and schema design
- Product repository with search and filtering
- Product service with business logic
- Product controllers and routes
- Product browsing, search, and filtering features
- Category management



**Key Achievements:**
- ✅ Implemented full-text search with MongoDB text indexes
- ✅ Created advanced filtering (category, price range)
- ✅ Built product CRUD operations
- ✅ Developed declarative query building
- ✅ Optimized queries with database indexes
- ✅ Created responsive product browsing UI

**SOLID Principles Applied:**
- **Single Responsibility**: ProductRepository handles only data access
- **Open/Closed**: Extensible filtering and search capabilities
- **Liskov Substitution**: Repository pattern allows easy implementation swapping

**Programming Paradigms:**
- **Imperative**: Product service business logic, validation
- **Declarative**: MongoDB query building, React component composition, aggregation pipelines

---

### 4. **Youstina** - Shopping Cart & Order Management

**Responsibilities:**
- Cart model and repository
- Cart service with concurrency handling
- Order model and repository
- Order service with transaction management
- Order controllers and routes
- Checkout process implementation

**Key Achievements:**
- ✅ Implemented atomic cart operations for concurrency safety
- ✅ Created transaction-based order creation
- ✅ Built stock validation and management
- ✅ Developed email notification integration
- ✅ Implemented order history and tracking
- ✅ Created seamless checkout flow

**SOLID Principles Applied:**
- **Single Responsibility**: Cart and Order services handle distinct responsibilities
- **Dependency Inversion**: Services depend on repository abstractions
- **Open/Closed**: Extensible order processing logic

**Programming Paradigms:**
- **Imperative**: Transaction management, step-by-step order creation, stock validation
- **Declarative**: MongoDB transactions, aggregation pipelines for analytics

---

### 5. **Chantal** - Admin Dashboard & Analytics

**Responsibilities:**
- Admin dashboard implementation
- Product management interface (CRUD)
- Order management interface
- Sales analytics and reporting
- Admin-specific routes and components


**Key Achievements:**
- ✅ Built comprehensive admin dashboard
- ✅ Implemented product CRUD interface
- ✅ Created order management system
- ✅ Developed sales analytics with aggregation pipelines
- ✅ Built sales by category reports
- ✅ Implemented date range filtering for analytics

**SOLID Principles Applied:**
- **Single Responsibility**: Each admin page handles one specific admin function
- **Interface Segregation**: Focused admin interfaces
- **Open/Closed**: Extensible analytics and reporting

**Programming Paradigms:**
- **Imperative**: Admin business logic, data processing
- **Declarative**: MongoDB aggregation pipelines for analytics, React component composition

---

### 6. **Ahmed** - Frontend UI/UX & Integration

**Responsibilities:**
- Frontend application structure
- React routing and navigation
- UI components and layout
- API integration and client setup
- Responsive design implementation
- User experience optimization



**Key Achievements:**
- ✅ Set up React application with Vite
- ✅ Implemented React Router for navigation
- ✅ Created responsive layout components
- ✅ Built centralized API client with interceptors
- ✅ Implemented Tailwind CSS design system
- ✅ Created reusable UI components
- ✅ Optimized user experience with loading states and error handling

**SOLID Principles Applied:**
- **Single Responsibility**: Each component has one clear purpose
- **Open/Closed**: Reusable, extensible components
- **Dependency Inversion**: Components depend on context abstractions

**Programming Paradigms:**
- **Imperative**: Event handlers, state management logic
- **Declarative**: React component composition, JSX, Tailwind utility classes

---