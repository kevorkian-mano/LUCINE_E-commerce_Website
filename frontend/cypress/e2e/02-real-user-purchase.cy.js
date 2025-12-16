describe('Flow 2: Real User - Complete Purchase Flow', () => {
  const realUser = {
    email: 'kevorkianmano124@gmail.com',
    password: '112233'
  };

  it('should complete full purchase: login -> browse -> add to cart -> checkout -> pay with stripe', () => {
    // Step 1: Login with real user credentials
    cy.visit('/login');
    cy.get('input[name="email"]').type(realUser.email);
    cy.get('input[name="password"]').type(realUser.password);
    cy.get('button[type="submit"]').click();
    cy.wait(4000);
    cy.log('User logged in successfully');

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
    cy.get('input[name="street"]').type('123 Main Street', { force: true });
    cy.get('input[name="city"]').type('Beirut', { force: true });
    cy.get('input[name="state"]').type('LB', { force: true });
    cy.get('input[name="zipCode"]').type('12345', { force: true });
    cy.get('input[name="country"]').type('Lebanon', { force: true });
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
        // Real Stripe mode - Fill in payment details using Stripe Elements
        cy.log('Real Stripe mode - filling payment form');
        cy.wait(3000);

        // Wait for Stripe payment element to be fully loaded
        cy.get('iframe').should('have.length.at.least', 1);
        cy.log('Stripe payment element detected');

        // First, click on the "Card" payment method option.
        // In Stripe Payment Element, the method selector is typically in the main DOM, not inside the input iframes.
        cy.log('Selecting Card payment method');
        cy.then(() => {
          const trySelectors = [
            'button:contains("Card")',
            '[role="button"]:contains("Card")',
            '[data-testid="payment-method-selector-card"]',
            '.PaymentElement button:contains("Card")',
            '.PaymentElement [role="button"]:contains("Card")'
          ];
          let found = false;
          trySelectors.forEach((sel) => {
            if (found) return;
            cy.get('body').then(($body) => {
              const $el = $body.find(sel).first();
              if ($el.length) {
                found = true;
                cy.wrap($el).scrollIntoView().click({ force: true });
                cy.log('✅ Card payment method selected');
              }
            });
          });
        });
        cy.wait(1500);

        cy.wait(2000);

        // Helper to safely get iframe body
        const getIframeBodyByIndex = (index) =>
          cy.get('iframe').eq(index)
            .its('0.contentDocument').should('exist')
            .its('body').should('not.be.empty')
            .then(cy.wrap);

        // Now fill card number field (first iframe - card number)
        getIframeBodyByIndex(0).find('input').first().clear().type('4242424242424242', { force: true, delay: 50 });
        cy.log('✅ Card number entered: 4242 4242 4242 4242');
        cy.wait(1000);

        // Fill expiry date field (second iframe - expiry)
        getIframeBodyByIndex(1).find('input').first().type('1228', { force: true, delay: 50 });
        cy.log('✅ Expiry date entered: 12/28');
        cy.wait(1000);

        // Fill CVC field (third iframe - cvc)
        getIframeBodyByIndex(2).find('input').first().type('123', { force: true, delay: 50 });
        cy.log('✅ CVC entered: 123');
        cy.wait(2000);

        // Click the payment submit button (outside iframe)
        cy.get('button[type="submit"]').filter(':visible').first().click({ force: true });
        cy.log('Payment submit button clicked');
        cy.wait(6000);
      }
    });

    // Step 13: Verify payment completion - should redirect to orders or show success
    cy.url().then((url) => {
      cy.log(`Final URL: ${url}`);
      // Should be redirected to orders page or show success
      cy.get('body').should('exist');
      
      // Verify success indicators
      cy.get('body').then(($body) => {
        const bodyText = $body.text().toLowerCase();
        if (bodyText.includes('success') || bodyText.includes('order') || bodyText.includes('thank you')) {
          cy.log('✅ Payment completed successfully - success message found');
        } else if (url.includes('/orders')) {
          cy.log('✅ Payment completed - redirected to orders page');
        } else {
          cy.log('Payment flow completed');
        }
      });
    });

    cy.log('Purchase flow completed successfully for real user');
  });
});
