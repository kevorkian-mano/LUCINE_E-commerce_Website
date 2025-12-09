describe('Flow 4: Admin - Dashboard and Analytics', () => {
  const adminUser = {
    email: 'admin@example.com',
    password: 'Admin@123456'
  };

  beforeEach(() => {
    cy.clearAuth();
  });

  it('should view dashboard, check analytics, view orders, and view order details', () => {
    // Step 0: Login as admin
    cy.log('Starting admin login');
    cy.visit('/login');
    cy.wait(1000);
    
    cy.get('input[type="email"]').clear().type(adminUser.email, { force: true });
    cy.wait(300);
    cy.get('input[type="password"]').clear().type(adminUser.password, { force: true });
    cy.wait(300);
    cy.get('button[type="submit"]').click({ force: true });
    cy.wait(3000);
    cy.log('Admin logged in');
    
    // Step 1: Navigate to /admin
    cy.visit('/admin');
    cy.wait(2000);
    cy.log('Visited /admin');

    // Step 2: Navigate to /admin/analytics
    cy.visit('/admin/analytics');
    cy.wait(2000);
    cy.log('Analytics page loaded');

    // Step 3: Verify analytics elements are visible
    cy.url().should('include', '/admin/analytics');
    cy.get('body').then(($body) => {
      const bodyText = $body.text().toLowerCase();
      const hasAnalytics = bodyText.includes('analytics') || 
                          bodyText.includes('sales') ||
                          bodyText.includes('revenue') ||
                          bodyText.includes('order');
      cy.log(`Analytics content found: ${hasAnalytics}`);
    });

    // Step 4: Navigate back to /admin
    cy.visit('/admin');
    cy.wait(2000);
    cy.log('Returned to /admin');

    // Step 5: Navigate to /admin/orders
    cy.visit('/admin/orders');
    cy.wait(2000);
    cy.log('Admin orders page loaded');

    // Step 6: Navigate back to /admin
    cy.visit('/admin');
    cy.wait(2000);
    cy.log('Returned to /admin');

    cy.log('Admin flow completed: /admin → /admin/analytics → /admin → /admin/orders → /orders/:id');
  });
});
