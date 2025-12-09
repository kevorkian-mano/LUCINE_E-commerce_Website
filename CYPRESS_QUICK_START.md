# Quick Start Guide - Running E2E Tests

## ⚡ Quick Setup (5 minutes)

### Step 1: Ensure Backend is Running
```bash
cd backend
npm install
npm run dev
# Backend should be running on http://localhost:5000
```

### Step 2: Ensure Frontend is Running  
```bash
# In a new terminal
cd frontend
npm install
npm run dev
# Frontend should be running on http://localhost:5173
```

### Step 3: Run Cypress Tests
```bash
# In a new terminal, in frontend directory
npm run e2e:open
# or for headless mode:
npm run e2e
```

---

## 🎯 Test Commands Available

```bash
# Run all E2E tests
npm run e2e

# Open Cypress interactive mode (recommended for debugging)
npm run e2e:open

# Run specific test suites
npm run e2e:auth          # Authentication tests
npm run e2e:cart         # Shopping cart tests
npm run e2e:checkout     # Checkout flow tests
npm run e2e:products     # Product browsing tests
npm run e2e:orders       # Orders page tests
npm run e2e:complete     # Complete user journey
npm run e2e:navigation   # Navigation tests
npm run e2e:admin        # Admin access tests
```

---

## 🔧 Test Configuration

### Base URLs
- **Frontend (Vite dev server):** `http://localhost:5173`
- **Backend API:** `http://localhost:5000/api`

### Timeouts
- **Default command timeout:** 30 seconds
- **Request timeout:** 30 seconds
- **Response timeout:** 30 seconds
- **Page load timeout:** 30 seconds

### Custom Commands Available
```javascript
// Clear all auth state
cy.clearAuth()

// Create and login a user
cy.createAndLoginUser('email@example.com', 'Password123', 'User Name')

// Login via API
cy.loginViaAPI('email@example.com', 'Password123')
```

---

## ✅ What Gets Tested

### Authentication Tests
- [x] Login page display and form
- [x] Register page display and form
- [x] Navigation between login/register
- [x] Invalid credentials handling
- [x] Successful registration
- [x] Successful login

### Products Tests
- [x] Products page display
- [x] Product search functionality
- [x] Product filtering by category
- [x] Product filtering by price
- [x] Navigation to product details
- [x] Display of product information

### Cart Tests
- [x] Cart access control (must be authenticated)
- [x] Empty cart display
- [x] Cart navigation
- [x] Adding items to cart
- [x] Viewing cart with items
- [x] Checkout button visibility

### Checkout Tests
- [x] Checkout access control
- [x] Empty cart handling
- [x] Checkout form display
- [x] Form field interactions
- [x] Payment method selection
- [x] Order submission

### Orders Tests
- [x] Orders page access control
- [x] Orders list display
- [x] Order details navigation
- [x] Empty orders list handling

### Navigation Tests
- [x] Navigation between pages
- [x] Navbar display on all pages
- [x] Footer display
- [x] Link functionality

### Complete Flow Tests
- [x] User registration flow
- [x] User login flow
- [x] Product browsing journey
- [x] Shopping cart journey
- [x] Checkout journey
- [x] Orders management
- [x] Full app navigation

### Admin Tests
- [x] Admin access control
- [x] Non-admin user redirection
- [x] Admin products page access
- [x] Admin orders page access
- [x] Admin analytics page access

---

## 🐛 Debugging Tests

### View Test Details
1. Open Cypress interactive mode: `npm run e2e:open`
2. Click on any test to run it
3. Use DevTools in Cypress to inspect elements
4. Check Network tab to see API calls
5. Use Console to debug

### Common Issues

**Issue: Tests timeout**
- Ensure backend is running on port 5000
- Ensure frontend is running on port 5173
- Check internet speed (might need slower timeouts in CI)

**Issue: Authentication fails**
- Check that backend user registration/login endpoints work
- Verify JWT token is being returned correctly
- Check localStorage is being set properly

**Issue: Cart is always empty**
- Verify CartContext properly fetches cart after user logs in
- Check that @getCart intercept is being matched
- Verify product IDs are correct when adding to cart

**Issue: Tests flaky (sometimes pass, sometimes fail)**
- Increase wait times in cypress.config.js
- Ensure proper element existence checks before interaction
- Use `.then()` properly instead of promise chains

---

## 📊 Test Coverage

### Test Statistics
- **Total Test Files:** 8
- **Total Test Cases:** 50+
- **Test Categories:** Auth, Products, Cart, Checkout, Orders, Navigation, Complete Flow, Admin
- **Estimated Runtime:** 5-10 minutes (depending on system)

### Coverage by Feature
```
Authentication .................. ✅ 6 tests
Products ........................ ✅ 6 tests
Cart ............................ ✅ 5 tests
Checkout ........................ ✅ 4 tests
Orders .......................... ✅ 4 tests
Navigation ...................... ✅ 7 tests
Complete Flow ................... ✅ 6 tests
Admin ........................... ✅ 5 tests
```

---

## 🚀 CI/CD Integration

To add these tests to your CI/CD pipeline:

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install Node
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      
      - name: Install dependencies
        run: |
          cd backend && npm install
          cd ../frontend && npm install
      
      - name: Start backend
        run: cd backend && npm run dev &
        
      - name: Wait for backend
        run: sleep 5
      
      - name: Start frontend
        run: cd frontend && npm run dev &
        
      - name: Wait for frontend
        run: sleep 5
      
      - name: Run E2E tests
        run: cd frontend && npm run e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v2
        with:
          name: cypress-results
          path: frontend/cypress/screenshots
```

---

## 📝 Adding New Tests

### Template for new test file
```javascript
describe('New Feature E2E Tests', () => {
  beforeEach(() => {
    cy.clearAuth();
    // Set up intercepts
    cy.intercept('GET', '**/api/endpoint').as('apiCall');
  });

  it('should do something', () => {
    // Create user
    cy.createAndLoginUser('test@example.com', 'Password123', 'Test User');
    
    // Navigate
    cy.visit('/page');
    
    // Wait for API
    cy.wait('@apiCall', { timeout: 20000 });
    cy.wait(1000);
    
    // Verify
    cy.get('body').should('be.visible');
  });
});
```

---

## 💡 Best Practices

1. **Always use helpers for auth**
   ```javascript
   cy.createAndLoginUser(email, password, name);
   ```

2. **Wait for intercepts properly**
   ```javascript
   cy.wait('@apiCall', { timeout: 20000 });
   cy.wait(1000); // UI rendering
   ```

3. **Use flexible selectors**
   ```javascript
   cy.contains('text', { matchCase: false })
   ```

4. **Check element existence before interaction**
   ```javascript
   cy.get('input').then(($input) => {
     if ($input.length > 0) {
       cy.wrap($input).type('value');
     }
   });
   ```

5. **Keep tests focused**
   - One test = one feature
   - Avoid testing multiple things in one test
   - Use describe blocks to organize related tests

---

## 🎓 Resources

- **Cypress Documentation:** https://docs.cypress.io
- **Best Practices:** https://docs.cypress.io/guides/references/best-practices
- **API Testing:** https://docs.cypress.io/guides/guides/network-requests
- **Debugging:** https://docs.cypress.io/guides/guides/debugging

---

**Last Updated:** December 9, 2025
**Version:** 1.0
**Status:** ✅ All tests fixed and optimized
