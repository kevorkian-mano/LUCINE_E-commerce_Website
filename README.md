# E-commerce Full-Stack Application

A complete MERN stack e-commerce application with modern UI, secure authentication, shopping cart, order management, and admin dashboard.

---

## Project Overview

This project implements a full-stack e-commerce solution following **Layered (3-Tier) Architecture** with SOLID principles, featuring both imperative and declarative programming styles.

---

### Features

• User authentication (sign up, login, logout)

• Product browsing and advanced search by category, price, and rating

• Shopping cart and checkout system

• Order tracking and email notifications

• Admin dashboard for product and order management

• Unit, integration, and end-to-end testing

---

### Expected Outcomes

• A fully functioning web application (frontend + backend) deployed locally or online

• Clean, modular code following SOLID principles

• Unit, integration, and UI test cases demonstrating TDD practices

• Architecture and design documentation (class, sequence, and entity diagrams)

• Demonstration video and final report


---

### Tech Stack

#### Backend
- **Node.js** with **Express**
- **MongoDB** with **Mongoose**
- **JWT** for authentication
- **bcrypt** for password hashing
- **Nodemailer** for emails
- **Layered Architecture** (3-tier)

#### Frontend
- **React 18** with **Vite**
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API calls
- **Context API** for state management
- **React Icons** & **React Toastify**

---

### Getting Started

#### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm 

#### Backend Setup

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

#### Frontend Setup

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

---

### Functional Requirements

- **FR1:** User registration, login, and logout
- **FR2:** Product browsing and search (by category, name, price)
- **FR3:** Shopping cart management (add/remove items)
- **FR4:** Order placement and order history
- **FR5:** Email notifications for orders
- **FR6:** Admin product management and sales analytics
  
---

### Non-Functional Requirements

- **NFR1:** Performance (indexed queries, optimized responses)
- **NFR2:** Reliability (error handling, transactions)
- **NFR3:** Security (bcrypt, JWT, RBAC)
- **NFR4:** Maintainability (SOLID principles, modular code)
- **NFR5:** Concurrency (atomic operations, transactions)
- **NFR6:** Usability (responsive design, accessible UI)

---

### Architecture

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
  
   
---

### Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control (Admin/Customer)
- Input validation
- Protected routes
- Secure API endpoints



---

### Code Quality

- SOLID principles applied
- Separation of concerns
- Modular architecture
- Clean code practices
- Error handling throughout
- Input validation
- No syntax errors

---

### Implemented Design Patterns (Summary)

| Pattern | Problem Solved | Benefit |
|---------|---------------|---------|
| **Strategy** | Hard to add/modify email templates | Easy to add new email types without breaking existing ones |
| **Observer** | OrderService knows too much about notifications | Easy to add/remove notifications without changing order logic |
| **Factory Method** | Hard to test, tight coupling, complex dependencies | Easy to test, flexible, clear dependencies |



#### Why These Patterns Matter

1. **Maintainability**


2. **Extensibility**
 

3. **Testability**


4. **Professional Code**


5. **Scalability**




#### Simple Explanation 

1. **Strategy Pattern for Email Templates:**
   - "We needed to send different types of emails (order confirmation, password reset, etc.)"
   - "Instead of putting all email code in one place, we created separate classes for each email type"
   - "This makes it easy to add new email types without breaking existing ones"
   - "Each email type can validate its own data and handle errors independently"

2. **Observer Pattern for Order Notifications:**
   - "When an order is created, we need to do many things: send email, update analytics, check inventory, etc."
   - "Instead of OrderService calling all these services directly, we use Observer Pattern"
   - "OrderService just notifies observers, and each observer handles its own task"
   - "This makes it easy to add or remove notifications without changing order creation logic"
   - "If one notification fails, others still work"

3. **Factory Method Pattern for Service Creation:**
   - "Our services need repositories to access the database"
   - "Instead of services directly importing repositories, we use a Factory to create them"
   - "This makes it easy to test services by injecting fake repositories"
   - "The Factory handles complex dependencies automatically"
   - "We can swap implementations easily (real database vs. fake database)"

---

### License

This project is created for educational purposes.

---

### Contributing

This is a project implementation. For questions or issues, please refer to the documentation in each directory.

---

**Status:** **Beta Version Complete added Design Patterns - Ready for Testing**