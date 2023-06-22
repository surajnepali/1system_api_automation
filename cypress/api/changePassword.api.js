/// <reference types="cypress" />

import ENDPOINTS from '../constants/endpoints';

const changePassword = (current_password, password) => cy.api({
    method: 'PATCH',
    url: Cypress.env('apiUrl') + ENDPOINTS.changePassword,
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
    },
    body: {
        current_password,
        password,
    },
    failOnStatusCode: false,
});

export default{
    changePassword,
}