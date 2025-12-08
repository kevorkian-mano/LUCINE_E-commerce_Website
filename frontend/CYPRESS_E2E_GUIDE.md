# Cypress End-to-End Testing Guide

This guide explains how to run end-to-end (E2E) tests for the entire e-commerce application using Cypress.

## Prerequisites

Before running E2E tests, ensure you have:

1. **Backend server running** on `http://localhost:5000`
2. **Frontend server running** on `http://localhost:3001`
3. **MongoDB database** running and accessible
4. **Test data** in the database (or tests will create it)

## Setup

### 1. Install Dependencies

Dependencies are already installed. If you need to reinstall:

```bash
cd frontend
npm install
```

### 2. Start Backend Server

```bash
cd backend
npm run dev
```

The backend should be running on `http://localhost:5000`

### 3. Start Frontend Server

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend should be running on `http://localhost:3001`

## Running E2E Tests

### Option 1: Interactive Mode (Recommended for Development)

Open Cypress Test Runner to see tests run in real-time:

```bash
cd frontend
npm run e2e:open
# or
npm run cypress:open
```

This opens the Cypress GUI where you can:
- Select which tests to run
- Watch tests execute in real-time
- Debug test failures
- See screenshots and videos

### Option 2: Headless Mode (CI/CD)

Run all tests in headless mode (no GUI):

```bash
cd frontend
npm run e2e
# or
npm run cypress:run
```

This runs all tests and generates:
- Test results in terminal
- Screenshots on failure (in `cypress/screenshots/`)
- Videos (if enabled in config)

### Option 3: Run Specific Test File

```bash
cd frontend
npx cypress run --spec "cypress/e2e/auth.cy.js"
```

## Test Structure

```
cypress/
├── e2e/                    # Test files
│   ├── auth.cy.js        # Authentication tests
│   ├── products.cy.js    # Product browsing tests
│   ├── cart.cy.js        # Shopping cart tests
│   ├── checkout.cy.js    # Checkout flow tests
│   ├── orders.cy.js      # Order management tests
│   ├── navigation.cy.js  # Navigation tests
│   ├── complete-flow.cy.js  # Full user journey
│   └── admin-flow.cy.js     # Admin functionality tests
├── fixtures/              # Test data
│   └── example.json
├── support/               # Custom commands and utilities
│   ├── commands.js       # Custom Cypress commands
│   └── e2e.js            # Support file
└── .gitignore            # Ignore test artifacts
```

## Available Custom Commands

### `cy.login(email, password)`
Login a user programmatically:
```javascript
cy.login('user@example.com', 'password123');
```

### `cy.register(name, email, password)`
Register a new user:
```javascript
cy.register('John Doe', 'john@example.com', 'password123');
```

### `cy.addToCart(productId)`
Add a product to cart:
```javascript
cy.addToCart('product-id-123');
```

### `cy.clearAuth()`
Clear authentication state:
```javascript
cy.clearAuth(); // Clears localStorage and cookies
```

## Test Scenarios Covered

### 1. Authentication Flow (`auth.cy.js`)
- Login page display
- Registration page display
- Navigation between login/register
- Form validation
- Invalid credentials handling

### 2. Products Flow (`products.cy.js`)
- Products page display
- Product search
- Category filtering
- Product details navigation

### 3. Cart Flow (`cart.cy.js`)
- Empty cart display
- Cart page access
- Authentication requirements

### 4. Checkout Flow (`checkout.cy.js`)
- Checkout page display
- Shipping address form
- Form validation
- Empty cart handling

### 5. Orders Flow (`orders.cy.js`)
- Orders list display
- Order details navigation
- Empty orders handling

### 6. Complete User Journey (`complete-flow.cy.js`)
- Full flow: Register → Login → Browse → Add to Cart → Checkout
- Tests the entire user experience end-to-end

### 7. Admin Flow (`admin-flow.cy.js`)
- Admin dashboard access
- Admin products management
- Admin orders management

### 8. Navigation (`navigation.cy.js`)
- Page navigation
- Navbar visibility
- Footer visibility

## Configuration

Cypress configuration is in `cypress.config.js`:

```javascript
{
  baseUrl: 'http://localhost:3001',  // Frontend URL
  viewportWidth: 1280,
  viewportHeight: 720,
  defaultCommandTimeout: 10000,
  env: {
    apiUrl: 'http://localhost:5000/api'  // Backend API URL
  }
}
```

## Troubleshooting

### Tests fail with "Cannot connect to server"

**Solution:** Ensure both backend and frontend servers are running:
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend  
cd frontend && npm run dev

# Terminal 3: Run tests
cd frontend && npm run e2e
```

### Tests timeout

**Solution:** Increase timeout in `cypress.config.js`:
```javascript
defaultCommandTimeout: 20000,  // Increase from 10000
```

### Tests fail due to authentication

**Solution:** Ensure test users exist in database or tests create them. Check `cy.clearAuth()` is called in `beforeEach`.

### Elements not found

**Solution:** 
- Check if selectors match actual HTML
- Use `cy.wait()` for async operations
- Check if elements are conditionally rendered
- Use `{ force: true }` option if element is covered

## Best Practices

1. **Always clear auth state** in `beforeEach`:
   ```javascript
   beforeEach(() => {
     cy.clearAuth();
   });
   ```

2. **Wait for API calls**:
   ```javascript
   cy.intercept('GET', '**/api/products**').as('getProducts');
   cy.wait('@getProducts');
   ```

3. **Use data-testid** for stable selectors (if available):
   ```javascript
   cy.get('[data-testid="product-card"]').click();
   ```

4. **Handle async operations**:
   ```javascript
   cy.wait(2000); // Wait for component to render
   ```

5. **Use meaningful test descriptions**:
   ```javascript
   it('should add product to cart when add button is clicked', () => {
     // test code
   });
   ```

## CI/CD Integration

To run E2E tests in CI/CD:

```yaml
# Example GitHub Actions
- name: Run E2E Tests
  run: |
    cd frontend
    npm run e2e
```

## Next Steps

1. **Add more test scenarios** for edge cases
2. **Add visual regression testing** using Cypress plugins
3. **Add API mocking** for faster tests
4. **Add test data fixtures** for consistent testing
5. **Add performance testing** for page load times

## Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Cypress Examples](https://example.cypress.io/)

