# End-to-End Testing Guide

Complete guide for running E2E tests on the entire e-commerce application.

## 🚀 Quick Start

### Step 1: Start Backend Server
```bash
cd backend
npm run dev
```
Backend should be running on `http://localhost:5000`

### Step 2: Start Frontend Server
```bash
cd frontend
npm run dev
```
Frontend should be running on `http://localhost:3001`

### Step 3: Run E2E Tests

**Option A: Interactive Mode (Recommended for first time)**
```bash
cd frontend
npm run e2e:open
```
This opens Cypress GUI where you can:
- Select tests to run
- Watch tests execute in real-time
- Debug failures
- See screenshots

**Option B: Headless Mode (CI/CD)**
```bash
cd frontend
npm run e2e
```

**Option C: Using Helper Script**
```bash
cd frontend
./run-e2e-tests.sh
```
This script checks if servers are running before executing tests.

## 📋 Test Coverage

### 1. Authentication Tests (`auth.cy.js`)
- ✅ Login page display
- ✅ Registration page display
- ✅ Navigation between pages
- ✅ Form validation
- ✅ Invalid credentials handling

### 2. Products Tests (`products.cy.js`)
- ✅ Products listing
- ✅ Product search
- ✅ Category filtering
- ✅ Product details navigation

### 3. Cart Tests (`cart.cy.js`)
- ✅ Empty cart display
- ✅ Cart page access
- ✅ Authentication requirements

### 4. Checkout Tests (`checkout.cy.js`)
- ✅ Checkout page display
- ✅ Shipping address form
- ✅ Form validation
- ✅ Empty cart handling

### 5. Orders Tests (`orders.cy.js`)
- ✅ Orders list display
- ✅ Order details navigation
- ✅ Empty orders handling

### 6. Complete Flow Test (`complete-flow.cy.js`)
- ✅ **Full User Journey:**
  - Register new user
  - Login
  - Browse products
  - Add to cart
  - Checkout
  - Create order

### 7. Admin Tests (`admin-flow.cy.js`)
- ✅ Admin dashboard access
- ✅ Admin products management
- ✅ Admin orders management

### 8. Navigation Tests (`navigation.cy.js`)
- ✅ Page navigation
- ✅ Navbar visibility
- ✅ Footer visibility

## 🛠️ Custom Commands

### Login via UI
```javascript
cy.login('user@example.com', 'password123');
```

### Register via UI
```javascript
cy.register('John Doe', 'john@example.com', 'password123');
```

### Login via API (Faster)
```javascript
cy.loginViaAPI('user@example.com', 'password123');
```

### Add to Cart
```javascript
cy.addToCart('product-id-123');
```

### Clear Auth State
```javascript
cy.clearAuth(); // Clears localStorage and cookies
```

## 📁 Project Structure

```
frontend/
├── cypress/
│   ├── e2e/                    # Test files
│   │   ├── auth.cy.js
│   │   ├── products.cy.js
│   │   ├── cart.cy.js
│   │   ├── checkout.cy.js
│   │   ├── orders.cy.js
│   │   ├── navigation.cy.js
│   │   ├── complete-flow.cy.js  # Full user journey
│   │   └── admin-flow.cy.js
│   ├── fixtures/               # Test data
│   ├── support/                # Custom commands
│   │   ├── commands.js
│   │   └── e2e.js
│   └── screenshots/            # Failure screenshots
├── cypress.config.js           # Cypress configuration
└── run-e2e-tests.sh            # Helper script
```

## ⚙️ Configuration

Cypress is configured in `cypress.config.js`:

- **Base URL:** `http://localhost:3001` (Frontend)
- **API URL:** `http://localhost:5000/api` (Backend)
- **Viewport:** 1280x720
- **Timeouts:** 15 seconds
- **Video:** Enabled (for debugging)
- **Retries:** 2 attempts in CI mode

## 🔍 Running Specific Tests

### Run Single Test File
```bash
npx cypress run --spec "cypress/e2e/auth.cy.js"
```

### Run Tests Matching Pattern
```bash
npx cypress run --spec "cypress/e2e/*flow*.cy.js"
```

### Run Tests in Specific Browser
```bash
npx cypress run --browser chrome
npx cypress run --browser firefox
npx cypress run --browser electron
```

## 🐛 Troubleshooting

### Issue: "Cannot connect to server"
**Solution:** Ensure both servers are running:
```bash
# Check backend
curl http://localhost:5000/api/health

# Check frontend
curl http://localhost:3001
```

### Issue: Tests timeout
**Solution:** Increase timeout in `cypress.config.js`:
```javascript
defaultCommandTimeout: 20000
```

### Issue: Elements not found
**Solution:**
- Add `cy.wait()` for async operations
- Use `{ force: true }` if element is covered
- Check if element is conditionally rendered

### Issue: Authentication fails
**Solution:**
- Ensure test users exist in database
- Use `cy.clearAuth()` in `beforeEach`
- Check JWT token expiration

## 📊 Test Results

After running tests:
- **Screenshots:** `cypress/screenshots/` (on failure)
- **Videos:** `cypress/videos/` (if enabled)
- **Console:** Test results in terminal

## 🎯 Best Practices

1. **Always clear auth state** in `beforeEach`
2. **Wait for API calls** using `cy.intercept()` and `cy.wait()`
3. **Use meaningful test descriptions**
4. **Handle async operations** with proper waits
5. **Use custom commands** for reusable actions
6. **Keep tests independent** (no test dependencies)

## 📚 Additional Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- See `frontend/CYPRESS_E2E_GUIDE.md` for detailed guide

## 🎉 Example: Full Test Run

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: E2E Tests
cd frontend && npm run e2e
```

This will run all E2E tests and provide a complete test report!

