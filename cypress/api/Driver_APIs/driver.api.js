import { driverEndpoints } from "../../constants/endpoints";

export const applyDriver = (formData, token) => cy.api({
    method: 'POST',
    url: Cypress.env('apiUrl') + driverEndpoints.submitApplication,
    headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': 'Bearer ' + token,
    },
    body: formData,
    failOnStatusCode: false,
});

export const editDriverApplication = (editDriverApplication, token) => cy.api({
    method: 'PATCH',
    url: Cypress.env('apiUrl') + driverEndpoints.editApplicationDetails,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    body: {...editDriverApplication},
    failOnStatusCode: false,
});