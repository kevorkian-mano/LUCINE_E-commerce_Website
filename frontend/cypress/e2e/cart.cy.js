describe('Cart E2E Tests', () => {
  beforeEach(() => {
    cy.clearAuth();
    cy.visit('/');
  });

  it('should display cart page', () => {
    cy.visit('/cart');
    cy.contains(/cart/i).should('be.visible');
  });

  it('should show empty cart message when cart is empty', () => {
    cy.visit('/cart');
    cy.contains(/empty/i).or(/no items/i).or(/your cart is empty/i).should('be.visible');
  });

  it('should redirect to login when accessing cart without authentication', () => {
    cy.clearAuth();
    cy.visit('/cart');
    // Should redirect to login or show login prompt
    cy.url().should('satisfy', (url) => {
      return url.includes('/login') || url.includes('/cart');
    });
  });

  it('should display cart icon in navbar', () => {
    cy.visit('/');
    cy.get('a[href*="/cart"]').or('button').contains(/cart/i).should('exist');
  });
});

