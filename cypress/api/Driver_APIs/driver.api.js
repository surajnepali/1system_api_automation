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

export const editDriverApplicationDocs = (formData, token) => cy.api({
    method: 'PATCH',
    url: Cypress.env('apiUrl') + driverEndpoints.editApplicationDocs,
    headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': 'Bearer ' + token,
    },
    body: formData,
    failOnStatusCode: false,
});

export const getAllGigs = (token, page, limit) => cy.api({
    method: 'GET',
    url: Cypress.env('apiUrl') + driverEndpoints.gig + '?page=' + page + '&limit=' + limit,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});

export const getGigDetails = (token, gigId) => cy.api({
    method: 'GET',
    url: Cypress.env('apiUrl') + driverEndpoints.gig + '/' + gigId,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});

export const acceptGig = (token, gigId) => cy.api({
    method: 'PATCH',
    url: Cypress.env('apiUrl') + driverEndpoints.gig + '/' + gigId + '/accept',
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});

export const pickGig = (token, gigId) => cy.api({
    method: 'PATCH',
    url: Cypress.env('apiUrl') + driverEndpoints.gig + '/' + gigId + '/picked',
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,    
});

export const getVehicleTypes = (token) => cy.api({
    method: 'GET',
    url: Cypress.env('apiUrl') + driverEndpoints.vehicleTypes,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});