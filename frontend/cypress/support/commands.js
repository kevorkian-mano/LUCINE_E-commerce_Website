// Custom Cypress Commands

/**
 * Clear authentication state
 */
Cypress.Commands.add('clearAuth', () => {
  cy.clearLocalStorage();
  cy.clearCookies();
});

/**
 * Create and login a user via API
 * @example cy.createAndLoginUser('test@example.com', 'password123', 'Test User')
 */
Cypress.Commands.add('createAndLoginUser', (email, password, name = 'Test User') => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('backendUrl')}/api/users/register`,
    body: { name, email, password },
    failOnStatusCode: false,
  }).then((registerResponse) => {
    if (registerResponse.status === 201 && registerResponse.body.data?.token) {
      const { token, user } = registerResponse.body.data;
      cy.window().then((win) => {
        win.localStorage.setItem('token', token);
        win.localStorage.setItem('user', JSON.stringify(user));
      });
    } else if (registerResponse.status === 400) {
      // User might already exist, try login
      cy.request({
        method: 'POST',
        url: `${Cypress.env('backendUrl')}/api/users/login`,
        body: { email, password },
        failOnStatusCode: false,
      }).then((loginResponse) => {
        if (loginResponse.status === 200 && loginResponse.body.data?.token) {
          const { token, user } = loginResponse.body.data;
          cy.window().then((win) => {
            win.localStorage.setItem('token', token);
            win.localStorage.setItem('user', JSON.stringify(user));
          });
        }
      });
    }
  });
});

/**
 * Login a user via API (faster)
 * @example cy.loginViaAPI('user@example.com', 'password123')
 */
Cypress.Commands.add('loginViaAPI', (email, password) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('backendUrl')}/api/users/login`,
    body: { email, password },
    failOnStatusCode: false,
  }).then((response) => {
    if (response.status === 200 && response.body.data?.token) {
      const { token, user } = response.body.data;
      cy.window().then((win) => {
        win.localStorage.setItem('token', token);
        win.localStorage.setItem('user', JSON.stringify(user));
      });
    }
  });
});

/**
 * Register a new user via UI
 * @example cy.register('John Doe', 'john@example.com', 'password123')
 */
Cypress.Commands.add('register', (name, email, password) => {
  cy.visit('/register');
  cy.get('input[name="name"]').type(name);
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('input[name="confirmPassword"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.wait(2000); // Wait for registration
});

/**
 * Add product to cart
 * @example cy.addToCart('product-id-123')
 */
Cypress.Commands.add('addToCart', (productId) => {
  cy.visit(`/products/${productId}`);
  cy.wait(2000);
  cy.get('button').contains('Add to Cart').click();
  cy.wait(2000);
});

/**
 * Create a test user via API
 * @example cy.createTestUser('test@example.com', 'password123', 'Test User')
 */
Cypress.Commands.add('createTestUser', (email, password, name = 'Test User') => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl') || 'http://localhost:5000/api'}/users/register`,
    body: {
      name,
      email,
      password,
    },
    failOnStatusCode: false,
  });
});
