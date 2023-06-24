/// <reference types="Cypress" />

import ENDPOINTS from "../../constants/endpoints";

const getAllBranchesOfVendor = (token) => cy.api({
    method: 'GET',
    url: Cypress.env('apiUrl') + ENDPOINTS.getAllBranchesOfVendor,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});

export default {
    getAllBranchesOfVendor,
};