/// <reference types="Cypress" />

import ENDPOINTS from "../../constants/endpoints";

export const getAllBranches = (token) => cy.api({
    method: 'GET',
    url: Cypress.env('apiUrl') + ENDPOINTS.getAllPublicBranches,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});