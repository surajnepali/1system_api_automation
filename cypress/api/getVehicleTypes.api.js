/// <reference types="cypress" />

import ENDPOINTS from "../constants/endpoints";

const getVehicleTypes = (token) => cy.api({
    method: 'GET',
    url: Cypress.env('apiUrl') + ENDPOINTS.getVehicleTypes,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});

export default {
    getVehicleTypes,
};