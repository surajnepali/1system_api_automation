/// <reference types="cypress" />

import ENDPOINTS from "../constants/endpoints";

const forgotPassword = (email, otp, password) => cy.api({
    method: 'POST',
    url: Cypress.env('apiUrl') + ENDPOINTS.forgotPassword,
    body: {
        email,
        otp,
        password,
    },
    failOnStatusCode: false,
});

export default{
    forgotPassword,
}