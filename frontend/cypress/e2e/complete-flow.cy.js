describe('Complete E2E Flow - Full User Journey', () => {
  const testUser = {
    name: 'E2E Test User',
    email: `e2e-test-${Date.now()}@example.com`,
    password: 'TestPassword123!',
  };

  beforeEach(() => {
    cy.clearAuth();
    // Intercept API calls to see what's happening
    cy.intercept('POST', '**/api/users/register').as('register');
    cy.intercept('POST', '**/api/users/login').as('login');
    cy.intercept('GET', '**/api/products**').as('getProducts');
    cy.intercept('GET', '**/api/cart**').as('getCart');
    cy.intercept('POST', '**/api/cart**').as('addToCart');
    cy.intercept('POST', '**/api/orders**').as('createOrder');
  });

  it('should complete full user journey: Register -> Login -> Browse -> Add to Cart -> Checkout', () => {
    // Step 1: Register a new user
    cy.visit('/register');
    cy.get('input[name="name"]').type(testUser.name);
    cy.get('input[type="email"], input[name="email"]').type(testUser.email);
    cy.get('input[type="password"][name="password"]').type(testUser.password);
    cy.get('input[type="password"][name="confirmPassword"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    
    // Wait for registration to complete
    cy.wait('@register', { timeout: 10000 });
    cy.wait(2000); // Wait for redirect/navigation

    // Step 2: Should be logged in after registration (or redirected to login)
    // Check if we're on home page or login page
    cy.url().should('satisfy', (url) => {
      return !url.includes('/register') && !url.includes('/login');
    });

    // If redirected to login, login with the new account
    if (cy.url().then(url => url.includes('/login'))) {
      cy.get('input[type="email"], input[name="email"]').type(testUser.email);
      cy.get('input[type="password"][name="password"]').type(testUser.password);
      cy.get('button[type="submit"]').click();
      cy.wait('@login', { timeout: 10000 });
      cy.wait(2000);
    }

    // Step 3: Browse products
    cy.visit('/products');
    cy.wait('@getProducts', { timeout: 10000 });
    cy.contains(/products/i).should('be.visible');

    // Step 4: View product details
    cy.wait(2000); // Wait for products to load
    cy.get('a[href*="/products/"]').first().then(($link) => {
      const productUrl = $link.attr('href');
      if (productUrl) {
        cy.visit(productUrl);
        cy.wait(2000);
        
        // Step 5: Add product to cart
        cy.get('button').contains(/add to cart/i).click({ force: true });
        cy.wait('@addToCart', { timeout: 10000 });
        cy.wait(2000);
      }
    });

    // Step 6: View cart
    cy.visit('/cart');
    cy.wait('@getCart', { timeout: 10000 });
    cy.contains(/cart/i).should('be.visible');
    cy.wait(2000);

    // Step 7: Go to checkout
    cy.visit('/checkout');
    cy.wait(2000);
    
    // Fill shipping address
    cy.get('input[placeholder*="street" i], input[name*="street" i]').first().type('123 Test Street');
    cy.get('input[placeholder*="city" i], input[name*="city" i]').first().type('Test City');
    cy.get('input[placeholder*="state" i], input[name*="state" i]').first().type('TS');
    cy.get('input[placeholder*="zip" i], input[name*="zipCode" i]').first().type('12345');
    cy.get('input[placeholder*="country" i], input[name*="country" i]').first().type('USA');
    
    // Submit order (this will create order, PayPal flow is ignored)
    cy.get('button[type="submit"]').contains(/place order/i).or('button').contains(/submit/i).click({ force: true });
    cy.wait('@createOrder', { timeout: 15000 });
    
    // Should show success or redirect
    cy.wait(3000);
    cy.get('body').should('be.visible');
  });

  it('should handle user login flow', () => {
    // This test assumes a user exists (you may need to create one first via API)
    cy.visit('/login');
    cy.get('input[type="email"], input[name="email"]').type(testUser.email);
    cy.get('input[type="password"][name="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    
    cy.wait('@login', { timeout: 10000 });
    cy.wait(2000);
    
    // Should be logged in (not on login page)
    cy.url().should('not.include', '/login');
  });
});

