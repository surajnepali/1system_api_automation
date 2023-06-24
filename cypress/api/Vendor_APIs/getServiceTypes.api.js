/// <reference types="cypress" />

import ENDPOINTS from "../../constants/endpoints";

const getServiceTypes = (page, limit, token) => cy.api({
    method: 'GET',
    url: Cypress.env('apiUrl') + ENDPOINTS.getServiceTypes + '?page=' + page + '&limit=' + limit,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});

export default {
    getServiceTypes,
};