# Cypress E2E Testing

This directory contains end-to-end tests for the e-commerce application.

## Quick Start

1. **Start Backend Server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend Server:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Run E2E Tests:**
   ```bash
   # Headless mode (CI/CD)
   npm run e2e
   
   # Interactive mode (development)
   npm run e2e:open
   ```

## Test Files

- `auth.cy.js` - Authentication flows (login, register)
- `products.cy.js` - Product browsing and search
- `cart.cy.js` - Shopping cart functionality
- `checkout.cy.js` - Checkout process
- `orders.cy.js` - Order management
- `navigation.cy.js` - Navigation and routing
- `complete-flow.cy.js` - Full user journey
- `admin-flow.cy.js` - Admin functionality

## Custom Commands

See `support/commands.js` for available custom commands:
- `cy.login(email, password)`
- `cy.register(name, email, password)`
- `cy.addToCart(productId)`
- `cy.clearAuth()`
- `cy.loginViaAPI(email, password)`

## Configuration

Configuration is in `cypress.config.js`:
- Base URL: `http://localhost:3001`
- API URL: `http://localhost:5000/api`
- Timeouts: 15 seconds
- Video recording: Enabled

## Troubleshooting

If tests fail:
1. Ensure both servers are running
2. Check database connection
3. Verify test data exists
4. Check browser console for errors
5. Review screenshots in `cypress/screenshots/`

For more details, see `CYPRESS_E2E_GUIDE.md` in the frontend root.

