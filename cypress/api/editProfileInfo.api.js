/// <reference types="Cypress" />

import ENDPOINTS from "../constants/endpoints";

const getProfile = () => cy.api({
    method: 'GET',
    url: Cypress.env('apiUrl') + ENDPOINTS.getProfile,
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
    },
    failOnStatusCode: false,
});

const editProfile = (contact, username, address, longitude, latitude) => cy.api({
    method: 'PATCH',
    url: Cypress.env('apiUrl') + ENDPOINTS.editProfile,
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
    },
    body: {
        contact,
        username,
        address,
        longitude,
        latitude,
    },
    failOnStatusCode: false,
});

export default {
    getProfile,
    editProfile,
};