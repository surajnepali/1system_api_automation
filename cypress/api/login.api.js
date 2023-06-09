/// <reference types="cypress" />

import ENDPOINTS from "../constants/endpoints";

const loginUser = (email, password, loginAgent) => cy.api({
    method: 'POST',
    url: Cypress.env('apiUrl') + ENDPOINTS.login,
    body: {
        email,
        password,
        loginAgent,
    },
    failOnStatusCode: false,
});

export default {
    loginUser,
};