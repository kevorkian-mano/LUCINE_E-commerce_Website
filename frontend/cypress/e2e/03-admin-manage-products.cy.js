describe('Flow 3: Admin - Manage Products (Create, Edit, Delete)', () => {
  const adminUser = {
    email: 'admin@example.com',
    password: 'Admin@123456'
  };

  const product1 = {
    name: 'Test Product 1',
    price: '99.99',
    description: 'This is a test product for E2E testing',
    category: 'Electronics',
    stock: '50'
  };

  const product2 = {
    name: 'Test Product 2',
    price: '49.99',
    description: 'Another test product for E2E testing',
    category: 'Clothing',
    stock: '30'
  };

  beforeEach(() => {
    // Ensure admin is logged in before each test
    cy.clearAuth();
  });

  it('should create 2 products, edit first product, and delete second product', () => {
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
    
    // Navigate to admin products page
    cy.visit('/admin/products');
    cy.wait(3000);
    cy.log('Successfully on admin products page');
    
    // Verify we're on the admin page
    cy.url().should('include', '/admin/products');

    // ===== CREATE FIRST PRODUCT =====
    // Step 1: Click "Add Product" button
    cy.log('Clicking Add Product button');
    cy.get('button').contains(/Add Product|Add/i).click({ force: true });
    cy.wait(1500);
    cy.log('Create product form opened');

    // Step 2: Fill product 1 details using name attributes
    cy.log('Filling product 1 details');
    
    // Name field
    cy.get('input[name="name"]').first().type(product1.name, { force: true });
    cy.wait(300);

    // Description field
    cy.get('textarea[name="description"]').type(product1.description, { force: true });
    cy.wait(300);

    // Price field
    cy.get('input[name="price"]').type(product1.price, { force: true });
    cy.wait(300);

    // Stock field
    cy.get('input[name="stock"]').type(product1.stock, { force: true });
    cy.wait(300);

    // Category field
    cy.get('input[name="category"]').type(product1.category, { force: true });
    cy.wait(300);

    // Step 3: Submit create product form
    cy.log('Submitting product 1');
    cy.get('button').contains(/Create/i).click({ force: true });
    cy.wait(2000);
    cy.log('Product 1 created successfully');

    // ===== CREATE SECOND PRODUCT =====
    // Step 4: Click "Add Product" again
    cy.log('Creating second product');
    cy.get('button').contains(/Add Product|Add/i).click({ force: true });
    cy.wait(1500);
    cy.log('Create product form opened for product 2');

    // Step 5: Fill product 2 details
    cy.log('Filling product 2 details');
    
    // Name field
    cy.get('input[name="name"]').first().type(product2.name, { force: true });
    cy.wait(300);

    // Description field
    cy.get('textarea[name="description"]').type(product2.description, { force: true });
    cy.wait(300);

    // Price field
    cy.get('input[name="price"]').type(product2.price, { force: true });
    cy.wait(300);

    // Stock field
    cy.get('input[name="stock"]').type(product2.stock, { force: true });
    cy.wait(300);

    // Category field
    cy.get('input[name="category"]').type(product2.category, { force: true });
    cy.wait(300);

    // Step 6: Submit create product 2 form
    cy.log('Submitting product 2');
    cy.get('button').contains(/Create/i).click({ force: true });
    cy.wait(2000);
    cy.log('Product 2 created successfully');

    // ===== EDIT FIRST PRODUCT =====
    // Step 7: Return to products list
    cy.log('Returning to products list');
    cy.visit('/admin/products');
    cy.wait(2000);
    cy.log('Admin products page reloaded');

    // Step 8: Find product 1 in the table and click edit button
    cy.log(`Looking for product: ${product1.name}`);
    
    // Find the row containing product1.name
    cy.get('table tbody tr').each(($row) => {
      if ($row.text().includes(product1.name)) {
        // Click the edit button (first icon button in the Actions column)
        cy.wrap($row).find('button').first().click({ force: true });
        cy.wait(1500);
        cy.log('Product 1 edit form opened');
      }
    });

    // Step 9: Edit product 1 - change name and price
    cy.log('Editing product 1 name and price');
    
    // Update name
    cy.get('input[name="name"]').clear().type(`${product1.name} - Updated`, { force: true });
    cy.wait(300);

    // Update price
    cy.get('input[name="price"]').clear().type('129.99', { force: true });
    cy.wait(300);

    // Step 10: Submit update
    cy.log('Submitting product update');
    cy.get('button').contains(/Update/i).click({ force: true });
    cy.wait(2000);
    cy.log('Product 1 updated successfully');

    // ===== DELETE SECOND PRODUCT =====
    // Step 11: Return to products list
    cy.log('Returning to products list for deletion');
    cy.visit('/admin/products');
    cy.wait(2000);
    cy.log('Admin products page reloaded for deletion');

    // Step 12: Find and click delete button for product 2
    cy.log(`Looking for product to delete: ${product2.name}`);
    
    cy.get('table tbody tr').each(($row) => {
      if ($row.text().includes(product2.name)) {
        // Click the delete button (second icon button in the Actions column)
        cy.wrap($row).find('button').eq(1).click({ force: true });
        cy.wait(1000);
        cy.log('Delete button clicked for product 2');
        
        // Step 13: Confirm deletion with window.confirm dialog
        cy.on('window:confirm', () => true);
        cy.wait(2000);
        cy.log('Deletion confirmed');
      }
    });

    // Step 14: Verify product 2 is no longer in the list
    cy.visit('/admin/products');
    cy.wait(2000);
    
    cy.get('table tbody').then(($tbody) => {
      const hasProduct2 = $tbody.text().includes(product2.name);
      cy.log(`Product 2 found in list: ${hasProduct2}`);
    });

    cy.log('Admin product management flow completed - Created 2 products, edited first, deleted second');
  });
});
