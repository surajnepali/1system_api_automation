import { paymentEndpoints } from "../../constants/endpoints";

export const onboardPayment = (token, role) => cy.api({
    method: 'GET',
    url: Cypress.env('apiUrl') + paymentEndpoints.payment + '/' + role + paymentEndpoints.connectPayment,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});