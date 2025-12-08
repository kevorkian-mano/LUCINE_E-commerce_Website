// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/**
 * Custom command to login a user
 * @example cy.login('user@example.com', 'password123')
 */
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[type="email"], input[name="email"]').type(email);
  cy.get('input[type="password"][name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  // Wait for navigation or success message
  cy.url().should('not.include', '/login');
  cy.wait(2000); // Wait for auth state to update
});

/**
 * Custom command to register a new user
 * @example cy.register('John Doe', 'john@example.com', 'password123')
 */
Cypress.Commands.add('register', (name, email, password) => {
  cy.visit('/register');
  cy.get('input[name="name"]').type(name);
  cy.get('input[type="email"], input[name="email"]').type(email);
  cy.get('input[type="password"][name="password"]').type(password);
  cy.get('input[type="password"][name="confirmPassword"]').type(password);
  cy.get('button[type="submit"]').click();
  // Wait for navigation or success message
  cy.url().should('not.include', '/register');
  cy.wait(2000); // Wait for registration to complete
});

/**
 * Custom command to add product to cart
 * @example cy.addToCart('product-id-123')
 */
Cypress.Commands.add('addToCart', (productId) => {
  cy.visit(`/products/${productId}`);
  cy.wait(2000); // Wait for product to load
  cy.get('button').contains(/add to cart/i).click();
  // Wait for cart update
  cy.wait(2000);
});

/**
 * Custom command to clear localStorage and cookies
 */
Cypress.Commands.add('clearAuth', () => {
  cy.clearLocalStorage();
  cy.clearCookies();
});

/**
 * Custom command to wait for API response
 * @example cy.waitForAPI('GET', '/api/products')
 */
Cypress.Commands.add('waitForAPI', (method, url) => {
  cy.intercept(method, url).as('apiCall');
  cy.wait('@apiCall');
});

/**
 * Custom command to create a test user via API
 * @example cy.createTestUser('test@example.com', 'password123')
 */
Cypress.Commands.add('createTestUser', (email, password, name = 'Test User') => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/users/register`,
    body: {
      name,
      email,
      password,
    },
    failOnStatusCode: false,
  });
});

/**
 * Custom command to login via API (faster than UI)
 * @example cy.loginViaAPI('user@example.com', 'password123')
 */
Cypress.Commands.add('loginViaAPI', (email, password) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/users/login`,
    body: { email, password },
  }).then((response) => {
    if (response.body.token) {
      window.localStorage.setItem('token', response.body.token);
      window.localStorage.setItem('user', JSON.stringify(response.body.user));
    }
  });
});
