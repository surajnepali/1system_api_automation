/// <reference types="cypress" />

import ENDPOINTS from "../constants/endpoints";

const getVehicleTypes = () => cy.api({
    method: 'GET',
    url: Cypress.env('apiUrl') + ENDPOINTS.getVehicleTypes,
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
    },
    failOnStatusCode: false,
});

export default {
    getVehicleTypes,
};