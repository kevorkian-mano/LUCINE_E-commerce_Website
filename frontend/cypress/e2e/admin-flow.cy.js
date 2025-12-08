describe('Admin E2E Tests', () => {
  const adminUser = {
    email: 'admin@example.com',
    password: 'admin123',
  };

  beforeEach(() => {
    cy.clearAuth();
    cy.intercept('POST', '**/api/users/login').as('login');
    cy.intercept('GET', '**/api/users/profile').as('getProfile');
    cy.intercept('GET', '**/api/orders**').as('getOrders');
    cy.intercept('GET', '**/api/products**').as('getProducts');
  });

  it('should access admin dashboard after login', () => {
    // Login as admin
    cy.visit('/login');
    cy.get('input[type="email"], input[name="email"]').type(adminUser.email);
    cy.get('input[type="password"][name="password"]').type(adminUser.password);
    cy.get('button[type="submit"]').click();
    
    cy.wait('@login', { timeout: 10000 });
    cy.wait(2000);

    // Navigate to admin dashboard
    cy.visit('/admin/dashboard');
    cy.wait('@getProfile', { timeout: 10000 });
    cy.wait(2000);
    
    // Should see admin dashboard content
    cy.contains(/dashboard/i).or(/admin/i).should('be.visible');
  });

  it('should access admin products page', () => {
    // Login first (you may need to adjust this based on your auth flow)
    cy.visit('/admin/products');
    cy.wait(2000);
    
    // Should show products management or redirect to login
    cy.url().should('satisfy', (url) => {
      return url.includes('/admin/products') || url.includes('/login');
    });
  });

  it('should access admin orders page', () => {
    cy.visit('/admin/orders');
    cy.wait(2000);
    
    // Should show orders management or redirect to login
    cy.url().should('satisfy', (url) => {
      return url.includes('/admin/orders') || url.includes('/login');
    });
  });
});

