/// <reference types="Cypress" />

import ENDPOINTS from "../../constants/endpoints";

const getApplicationDetails = () => cy.api({
    method: 'GET',
    url: Cypress.env('apiUrl') + ENDPOINTS.getVendorApplicationDetails,
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
    },
    failOnStatusCode: false,
});

export default {
    getApplicationDetails,
};


