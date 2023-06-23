/// reference types="cypress" />

import ENDPOINTS from '../../constants/endpoints';

const applyForVendor = (formData) => cy.api({
    method: 'POST',
    url: Cypress.env('apiUrl') + ENDPOINTS.applyForVendor,
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
    },
    body: formData,
    failOnStatusCode: false,
});

export default {
    applyForVendor,
};