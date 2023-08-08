import { adminEndpoints } from "../../constants/endpoints";

export const getAllNotVerifiedDrivers = (page, limit, token) => cy.api({
    method: 'GET',
    url: Cypress.env('apiUrl') + adminEndpoints.getAllDrivers + `?page=${page}&isVerified=false&limit=${limit}&sort=createdAt&order=asc`,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});

export const adminLogin = (email, password) => cy.api({
    method: 'POST',
    url: Cypress.env('apiUrl') + adminEndpoints.adminLogin,
    body: {
        email,
        password,
    },
    failOnStatusCode: false,
});

export const approveDriver = (driverId, token) => cy.api({
    method: 'PATCH',
    url: Cypress.env('apiUrl') + adminEndpoints.getAllDrivers + '/' + driverId + adminEndpoints.approve,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});