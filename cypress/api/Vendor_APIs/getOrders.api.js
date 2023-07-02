/// <reference types="Cypress" />

import { vendorEndpoints } from "../../constants/endpoints";

export const getOrders = (token, page, limit, orderTab, branchId) => cy.api({
    method: 'GET',
    url: Cypress.env('apiUrl') + vendorEndpoints.getOrders + '?page=' + page + '&limit=' + limit + '&order_tab=' + orderTab + '&branch_id=' + branchId,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});