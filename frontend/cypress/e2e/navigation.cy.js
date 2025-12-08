describe('Navigation E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should navigate to home page', () => {
    cy.visit('/');
    cy.contains(/home/i).or('h1').should('be.visible');
  });

  it('should navigate to products page', () => {
    cy.get('a[href*="/products"]').first().click({ force: true });
    cy.url().should('include', '/products');
    cy.contains(/products/i).should('be.visible');
  });

  it('should navigate to login page', () => {
    cy.get('a[href*="/login"]').or('button').contains(/login/i).first().click({ force: true });
    cy.url().should('include', '/login');
  });

  it('should navigate to register page', () => {
    cy.visit('/register');
    cy.url().should('include', '/register');
  });

  it('should display navbar on all pages', () => {
    const pages = ['/', '/products', '/login', '/register'];
    pages.forEach((page) => {
      cy.visit(page);
      // Navbar should be visible (usually contains logo or nav links)
      cy.get('nav').or('header').should('be.visible');
    });
  });

  it('should display footer on pages', () => {
    cy.visit('/');
    // Footer might be at bottom, scroll to see it
    cy.scrollTo('bottom');
    cy.get('footer').should('exist');
  });
});

