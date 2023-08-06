// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('setVendorToken', (token) => {
    cy.wrap(token).as('vendorToken');
});
  

Cypress.Commands.add('myModuleCreateVendorToken', () => {
    // Implement the logic to create the vendor token specifically for "pickGigForVendor"
    // For example, you can use a test user account, or generate a token specifically for the vendor role in your application
    // Replace the following line with the actual logic to create a vendor token
    const vendorToken = 'your_generated_vendor_token';
  
    // Set the vendor token as an alias to be used in other tests
    cy.wrap(vendorToken).as('vendorToken');
  });