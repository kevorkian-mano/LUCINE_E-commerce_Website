describe('Authentication E2E Tests', () => {
  beforeEach(() => {
    cy.clearAuth();
    cy.visit('/');
  });

  it('should display login page', () => {
    cy.visit('/login');
    cy.contains('Login', { matchCase: false }).should('be.visible');
    cy.get('input[type="email"], input[name="email"]').should('be.visible');
    cy.get('input[type="password"][name="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('should display register page', () => {
    cy.visit('/register');
    cy.contains('Register', { matchCase: false }).should('be.visible');
    cy.get('input[name="name"]').should('be.visible');
    cy.get('input[type="email"], input[name="email"]').should('be.visible');
    cy.get('input[type="password"][name="password"]').should('be.visible');
  });

  it('should navigate to register from login', () => {
    cy.visit('/login');
    cy.contains('register', { matchCase: false }).click();
    cy.url().should('include', '/register');
  });

  it('should navigate to login from register', () => {
    cy.visit('/register');
    cy.contains('login', { matchCase: false }).click();
    cy.url().should('include', '/login');
  });

  it('should show validation errors on empty form submission', () => {
    cy.visit('/login');
    cy.get('button[type="submit"]').click();
    // HTML5 validation should prevent submission
    cy.get('input[type="email"], input[name="email"]').should('be.invalid');
  });

  it('should handle login with invalid credentials', () => {
    cy.visit('/login');
    cy.get('input[type="email"], input[name="email"]').type('invalid@example.com');
    cy.get('input[type="password"][name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    // Should show error message (wait for API response)
    cy.wait(2000);
    // Error message should appear (either toast or inline)
    cy.get('body').should('contain.text', 'error').or('contain.text', 'invalid').or('contain.text', 'incorrect');
  });
});

