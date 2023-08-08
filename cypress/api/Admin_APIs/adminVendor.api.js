import { adminEndpoints } from "../../constants/endpoints";

export const getAllNotVerifiedVendors = (page, limit, token) => cy.api({
    method: 'GET',
    url: Cypress.env('apiUrl') + adminEndpoints.getAllVendors + `?page=${page}&isVerified=false&limit=${limit}&sort=createdAt&order=asc`,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});

export const approveVendor = (vendorId, token) => cy.api({
    method: 'PATCH',
    url: Cypress.env('apiUrl') + adminEndpoints.getAllVendors + '/' + vendorId + adminEndpoints.approve,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});