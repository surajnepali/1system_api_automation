/// <reference types="cypress" />

import ENDPOINTS from "../constants/endpoints";

const switchRole = (role, token) => cy.api({
    method: 'POST',
    url: Cypress.env('apiUrl') + ENDPOINTS.switchRole,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    body: {
        role,
    },
    failOnStatusCode: false,
});

export default {
    switchRole,
};