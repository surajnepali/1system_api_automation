/// <reference types="cypress" />

import ENDPOINTS from "../constants/endpoints";

const loginUser = (email, password) => cy.api({
    method: 'POST',
    url: Cypress.env('apiUrl') + ENDPOINTS.login,
    body: {
        email,
        password,
    },
    failOnStatusCode: false,
});

export default {
    loginUser,
};