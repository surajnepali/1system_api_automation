/// <reference types="cypress" />

import ENDPOINTS from "../constants/endpoints";

const switchRole = (role) => cy.api({
    method: 'POST',
    url: Cypress.env('apiUrl') + ENDPOINTS.switchRole,
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
    },
    body: {
        role,
    },
    failOnStatusCode: false,
});

export default {
    switchRole,
};