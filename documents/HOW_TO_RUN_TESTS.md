# How to Run Tests - Quick Guide

This guide shows you how to run all tests (Unit, Integration, and E2E) for the LUCINE e-commerce platform.

---

## 🧪 Backend Tests (Unit Tests)

### Run All Backend Unit Tests

```bash
cd backend
npm test
```

### Run Tests in Watch Mode

```bash
cd backend
npm test -- --watch
```

### Run Tests with Coverage Report

```bash
cd backend
npm test -- --coverage
```

**What's tested:**
- ✅ Controllers (29 tests)
- ✅ Services (55 tests)
- ✅ Repositories (34 tests)
- ✅ Models (33 tests)
- ✅ Middlewares (22 tests)
- ✅ Utils (27 tests)

**Total: 200+ unit tests (all passing)**

---

## 🧪 Frontend Tests (Unit Tests)

### Run All Frontend Unit Tests

```bash
cd frontend
npm test
```

### Run Tests in Watch Mode

```bash
cd frontend
npm test -- --watch
```

### Run Tests with Coverage

```bash
cd frontend
npm test -- --coverage
```

**What's tested:**
- ✅ Contexts (16 tests)
- ✅ Components (23 tests)
- ✅ Pages (70 tests)
- ✅ Utils (3 tests)

**Total: 112+ unit tests**

---

## 🔗 Integration Tests

### Backend Integration Tests

```bash
cd backend
npm run test:integration
```


---

## 🌐 E2E Tests (Cypress)

### Prerequisites

Before running E2E tests, **BOTH servers must be running**:

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev
```
Backend runs on `http://localhost:5000`

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:3001`

---

### Open Cypress Interactive Mode 

**Terminal 3:**
```bash
cd frontend
npm run e2e:open
```

This opens the Cypress Test Runner where you can:
- ✅ Select which tests to run
- ✅ Watch tests execute in real-time
- ✅ Debug failures
- ✅ See screenshots

---

### E2E Test Coverage

**8 Complete Test Suites:**
- ✅ `auth.cy.js` - Authentication flow
- ✅ `products.cy.js` - Product browsing & search
- ✅ `cart.cy.js` - Shopping cart operations
- ✅ `checkout.cy.js` - Checkout process
- ✅ `orders.cy.js` - Order management
- ✅ `complete-flow.cy.js` - Full user journey
- ✅ `admin-flow.cy.js` - Admin functionality
- ✅ `navigation.cy.js` - Navigation tests

---



---

## 📊 Test Results

### Expected Output

**Backend Unit Tests:**
```
Test Suites: 21 passed, 21 total
Tests:       200 passed, 200 total
```

**Frontend Unit Tests:**
```
Test Suites: 21 passed, 21 total
Tests:       112 passed, 112 total
```

**Cypress E2E Tests:**
```
✓ All specs passed!  (8 specs, 40+ tests)
```

---

## 🎯 Test-Driven Development (TDD)

All tests include TDD evidence in this format:

```javascript
// TDD Evidence:
// RED: This test failed because [functionality] did not exist
// GREEN: After implementing [functionality], test passed
// REFACTOR: [Improvements made], test still passes
it('should [expected behavior]', () => {
  // Test implementation
});
```

---
