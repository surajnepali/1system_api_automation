/// <reference types="Cypress" />

import ENDPOINTS from "../../constants/endpoints";

const createBranch = ({name, longitude, latitude, landmark, place_id, contact}, token) => cy.api({
    method: 'POST',
    url: Cypress.env('apiUrl') + ENDPOINTS.createBranch,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    body: {
        name,
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