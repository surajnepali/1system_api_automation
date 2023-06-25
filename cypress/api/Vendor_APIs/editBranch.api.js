/// <reference types="Cypress" />

import ENDPOINTS from "../../constants/endpoints";

const editBranch = ({longitude, latitude, landmark, place_id, contact}, token, branchId) => cy.api({
    method: 'PATCH',
    url: Cypress.env('apiUrl') + ENDPOINTS.editBranch + branchId,
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
    failOnStatusCode: false,
});

export default {
    editBranch
};