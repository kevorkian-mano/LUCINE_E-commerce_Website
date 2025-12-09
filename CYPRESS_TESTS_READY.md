# E2E Tests - Ready to Run

## Test Files Created

### 1. **01-home.cy.js** - Home Page Tests
- ✅ Load home page successfully
- ✅ Display navbar
- ✅ Link to products page exists
- ✅ Navigate to products page

### 2. **02-auth.cy.js** - Authentication Tests
- ✅ Display register page
- ✅ Display registration form fields
- ✅ Register a new user
- ✅ Display login page
- ✅ Display login form fields
- ✅ Navigate between login and register pages

### 3. **03-products.cy.js** - Products Page Tests
- ✅ Load products page
- ✅ Display products after loading
- ✅ Search functionality available
- ✅ Navigate to product details

### 4. **04-navigation.cy.js** - Navigation Tests
- ✅ Navigate to all main pages (home, products, login, register)
- ✅ Navbar displays on all pages
- ✅ Navigation links work correctly

### 5. **05-cart.cy.js** - Shopping Cart Tests
- ✅ Require authentication to access cart
- ✅ Show cart icon when logged in
- ✅ Allow access to cart page when authenticated

### 6. **06-complete-flow.cy.js** - Complete Purchase Flow ⭐
**Full end-to-end user journey:**
1. Register new user
2. Verify authentication
3. Navigate to products
4. Select and click on first product
5. Add product to cart
6. Go to cart
7. Proceed to checkout
8. Fill shipping address:
   - Street: 123 Test Street
   - City: Test City
   - State: TC
   - Zip: 12345
   - Country: Test Country
9. Select Credit Card payment method
10. **Stripe Payment Flow:**
    - Choose "Card" payment option
    - Enter card number: `4242424242424242`
    - Enter expiry: `12/25`
    - Enter CVC: `123`
    - Enter postal code: `12345`
    - Click "Pay" button
11. Verify redirect to orders page
12. Verify order appears in orders list

---

## Running the Tests

### Run all tests:
```bash
cd frontend
npm run e2e
```

### Run specific test file:
```bash
npm run e2e -- --spec "cypress/e2e/06-complete-flow.cy.js"
```

### Run in interactive mode:
```bash
npm run e2e:open
```

---

## Requirements

### Services Must Be Running:
1. **Backend**: `cd backend && npm start` (runs on port 5000)
2. **Frontend**: `cd frontend && npm start` (runs on port 3001)

### Environment:
- Node.js v14+
- Cypress 15.7.1
- All npm dependencies installed

---

## Test Configuration

**File**: `frontend/cypress.config.js`
- Base URL: `http://localhost:3001`
- Backend URL: `http://localhost:5000`
- Timeout: 30 seconds
- Video: Disabled
- Screenshots: Enabled on failure

---

## Key Test Features

✅ Proper async/await handling
✅ API endpoint mocking where needed
✅ Form validation testing
✅ Navigation flow verification
✅ Payment form handling (Stripe)
✅ Error handling
✅ Flexible element selectors (handles UI changes)
✅ Conditional logic (checks for test vs real mode)

---

## Stripe Test Card Details

For the complete flow payment test, use:
- **Card Number**: 4242 4242 4242 4242
- **Expiry**: 12/25 (any future date)
- **CVC**: 123 (any 3 digits)
- **Postal**: 12345 (any 5 digits)

This is Stripe's official test card for successful payments.

---

## Test Execution Summary

| Test File | Tests | Status | Purpose |
|-----------|-------|--------|---------|
| 01-home.cy.js | 4 | ✅ Ready | Home page functionality |
| 02-auth.cy.js | 6 | ✅ Ready | User authentication |
| 03-products.cy.js | 4 | ✅ Ready | Product browsing |
| 04-navigation.cy.js | 6 | ✅ Ready | App navigation |
| 05-cart.cy.js | 3 | ✅ Ready | Shopping cart |
| 06-complete-flow.cy.js | 1 | ✅ Ready | Complete purchase journey |

**Total**: 24 test cases covering:
- ✅ User registration & login
- ✅ Product browsing & search
- ✅ Shopping cart operations
- ✅ Checkout process
- ✅ Stripe payment integration
- ✅ Order management
- ✅ Full user journey

---

## Notes

- All tests are independent and can run in any order
- Tests use unique timestamps for user emails to avoid conflicts
- Tests include proper waits for API responses and UI rendering
- Payment test handles both test mode and real Stripe mode
- Tests are resilient to minor UI/selector changes

---

**Last Updated**: December 9, 2025
**Status**: All tests ready for execution ✅
