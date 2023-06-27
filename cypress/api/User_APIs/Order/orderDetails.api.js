/// <reference types="Cypress" />

import { userEndpoints } from "../../../constants/endpoints";

export const getOrderDetailsByFilter = (filter, token) => cy.api({
    method: 'GET',
    url: Cypress.env('apiUrl') + userEndpoints.getAllOrderDetails + '?order_tab=' + filter + '&page=1&limit=20',
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});