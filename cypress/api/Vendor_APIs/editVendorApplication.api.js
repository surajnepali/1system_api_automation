/// <reference types="Cypress" />

import ENDPOINTS from "../../constants/endpoints";

const editVendorApplication = ({company_name, state_id, company_email}) => cy.api ({
    method: 'PATCH',
    url: Cypress.env('apiUrl') + ENDPOINTS.editVendorApplication,
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
    },
    body: {
        company_name,
        state_id,
        company_email,
    },
    failOnStatusCode: false,
});

const editVendorApplication2 = (branch, {landmark, contact, longitude, latitude}) => cy.api ({
    method: 'PATCH',
    url: Cypress.env('apiUrl') + ENDPOINTS.editVendorApplication2 + branch,
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
    },
    body: {
        landmark,
        contact,
        longitude,
        latitude,
    },
    failOnStatusCode: false,
});

const editVendorApplication3 = (formData) => cy.api ({
    method: 'PATCH',
    url: Cypress.env('apiUrl') + ENDPOINTS.editVendorApplicationDocument,
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
    },
    body: formData,
    failOnStatusCode: false,
});

export default {
    editVendorApplication,
    editVendorApplication2,
    editVendorApplication3,
};