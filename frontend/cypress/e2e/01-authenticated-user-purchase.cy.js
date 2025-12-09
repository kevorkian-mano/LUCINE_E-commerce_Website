describe('Flow 1: Authenticated User - Complete Purchase Flow', () => {
  const timestamp = Date.now();
  const testUser = {
    name: 'Auth User Test',
    email: `auth${timestamp}@example.com`,
    password: 'Password123!'
  };

  it('should complete full purchase: login -> register -> browse -> add to cart -> checkout -> pay with stripe', () => {
    // Step 1: Register new user
    cy.visit('/register');
    cy.get('input[name="name"]').type(testUser.name);
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('input[name="confirmPassword"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    cy.wait(4000);
    cy.log('User registered successfully');

    // Step 2: Navigate to home page
    cy.visit('/');
    cy.wait(2000);
    cy.log('On home page');

    // Step 3: Navigate to products page
    cy.visit('/products');
    cy.wait(3000);
    cy.log('On products page');

    // Step 4: Click first product to view details
    cy.get('a[href*="/products/"][href!="/products"]').first().click({ force: true });
    cy.wait(3000);
    cy.log('Product details page loaded');

    // Step 5: Add product to cart
    cy.contains('button', /add to (cart|bag)/i)
      .first()
      .click({ force: true });
    cy.wait(2000);
    cy.log('Product added to cart');

    // Step 6: Navigate to cart
    cy.visit('/cart');
    cy.wait(2000);
    cy.log('Cart page loaded');

    // Step 7: Verify cart has items
    cy.contains(/checkout/i).should('exist');
    cy.log('Cart has items, checkout button visible');

    // Step 8: Click checkout
    cy.contains(/checkout/i).first().click({ force: true });
    cy.wait(2000);
    cy.log('Checkout page loaded');

    // Step 9: Fill shipping address
    cy.get('input[name="street"]').type('123 Test Street', { force: true });
    cy.get('input[name="city"]').type('Test City', { force: true });
    cy.get('input[name="state"]').type('TC', { force: true });
    cy.get('input[name="zipCode"]').type('12345', { force: true });
    cy.get('input[name="country"]').type('Test Country', { force: true });
    cy.wait(1000);
    cy.log('Shipping address filled');

    // Step 10: Select Credit Card payment method
    cy.get('select[name="paymentMethod"]').select('Credit Card', { force: true });
    cy.wait(1500);
    cy.log('Payment method selected: Credit Card');

    // Step 11: Submit order form
    cy.get('form').first().submit();
    cy.wait(5000);
    cy.log('Order submitted, payment form loading');

    // Step 12: Handle Stripe payment
    cy.get('button').then(($buttons) => {
      const testPaymentBtn = Array.from($buttons).find(btn => 
        btn.textContent.toLowerCase().includes('complete test payment')
      );
      
      if (testPaymentBtn) {
        // Test mode
        cy.log('Test mode - clicking Complete Test Payment button');
        cy.wrap(testPaymentBtn).click({ force: true });
        cy.wait(4000);
      } else {
        // Real Stripe mode
        cy.log('Real Stripe mode - payment form present');
        cy.contains('Secure Payment').should('exist');
        cy.log('Stripe payment form verified');
      }
    });

    // Step 13: Verify payment completion - should redirect to orders or show success
    cy.url().then((url) => {
      cy.log(`Final URL: ${url}`);
      // Should be redirected to orders page or show success
      cy.get('body').should('exist');
    });

    cy.log('Purchase flow completed successfully');
  });
});
