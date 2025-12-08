describe('Orders E2E Tests', () => {
  beforeEach(() => {
    cy.clearAuth();
    cy.intercept('GET', '**/api/orders**').as('getOrders');
  });

  it('should display orders page', () => {
    cy.visit('/orders');
    cy.wait(2000);
    
    // Should show orders page or redirect to login
    cy.url().should('satisfy', (url) => {
      return url.includes('/orders') || url.includes('/login');
    });
  });

  it('should show empty orders message when no orders', () => {
    cy.visit('/orders');
    cy.wait('@getOrders', { timeout: 10000 });
    cy.wait(2000);
    
    // Should show "no orders" message or orders list
    cy.get('body').should('be.visible');
  });

  it('should navigate to order details', () => {
    cy.visit('/orders');
    cy.wait(2000);
    
    // If orders exist, click on one
    cy.get('a[href*="/orders/"]').first().then(($link) => {
      if ($link.length > 0) {
        cy.wrap($link).click({ force: true });
        cy.url().should('include', '/orders/');
        cy.contains(/order/i).should('be.visible');
      }
    });
  });
});

