/// <reference types="Cypress" />

import ENDPOINTS from "../../constants/endpoints";

const createBranch = ({longitude, latitude, landmark, place_id, contact}, token) => cy.api({
    method: 'POST',
    url: Cypress.env('apiUrl') + ENDPOINTS.createBranch,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    body: {
        longitude,
        latitude,
        landmark,
        place_id,
        contact,
    },
    failOnStatusCode: false
});

export default {
    createBranch
};