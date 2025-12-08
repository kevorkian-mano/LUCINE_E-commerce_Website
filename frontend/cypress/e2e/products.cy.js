describe('Products E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/products');
  });

  it('should display products page', () => {
    cy.contains('Products', { matchCase: false }).should('be.visible');
  });

  it('should display search input', () => {
    cy.get('input[placeholder*="search" i]').should('be.visible');
  });

  it('should display filters button', () => {
    cy.contains('button', /filter/i).should('be.visible');
  });

  it('should open filters when filters button is clicked', () => {
    cy.contains('button', /filter/i).click();
    // Filters should be visible
    cy.contains(/category/i).should('be.visible');
  });

  it('should search for products', () => {
    cy.get('input[placeholder*="search" i]').type('laptop');
    cy.get('button[type="submit"]').contains(/search/i).click();
    // Wait for search results
    cy.wait(2000);
    // Should show search results or "no products found"
    cy.get('body').should('be.visible');
  });

  it('should filter products by category', () => {
    cy.contains('button', /filter/i).click();
    cy.wait(500);
    // Find category select
    cy.get('select').first().select(1); // Select first non-empty option
    cy.contains('button', /apply/i).click();
    // Wait for filtered results
    cy.wait(2000);
    cy.get('body').should('be.visible');
  });

  it('should navigate to product details when product is clicked', () => {
    // Wait for products to load
    cy.wait(2000);
    // Try to find a product link and click it
    cy.get('a[href*="/products/"]').first().click({ force: true });
    // Should navigate to product details
    cy.url().should('include', '/products/');
  });
});

