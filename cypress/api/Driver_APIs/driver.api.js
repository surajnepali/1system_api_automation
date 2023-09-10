import { driverEndpoints, paymentEndpoints } from "../../constants/endpoints";

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
    body: editDriverApplication,
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

export const getAllGigs = (token, page, limit, longitude, latitude) => cy.api({
    method: 'GET',
    url: Cypress.env('apiUrl') + driverEndpoints.gig + '?page=' + page + '&limit=' + limit + '&longitude=' + longitude + '&latitude=' + latitude,
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
    url: Cypress.env('apiUrl') + driverEndpoints.getVehicleTypes,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});

export const createBidding = (token, gigId, bidOption) => cy.api({
    method: 'PUT',
    url: Cypress.env('apiUrl') + driverEndpoints.gig + '/' + gigId + driverEndpoints.bidding,
    headers:{
        'Authorization': 'Bearer ' + token,
    },
    body: {
        ask_price: bidOption,
    },
    failOnStatusCode: false,
});

export const getBiddingDetails = (token, gigId) => cy.api({
    method: 'GET',
    url: Cypress.env('apiUrl') + driverEndpoints.gig + '/' + gigId + driverEndpoints.bidding,
    headers:{
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});

export const orderDroppedbyDriver = (gigId, formData, token) => cy.api({
    method: 'PATCH',
    url: Cypress.env('apiUrl') + driverEndpoints.gig + '/' + gigId + driverEndpoints.dropped,
    headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': 'Bearer ' + token,
    },
    body: formData,
    failOnStatusCode: false,
});

export const activeGigs = (page, limit, token) => cy.api({
    method: 'GET',
    url: Cypress.env('apiUrl') + driverEndpoints.gig + '?page=' + page + '&limit=' + limit + '&is_active=true',
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});

export const completedGigs = (page, limit, token) => cy.api({
    method: 'GET',
    url: Cypress.env('apiUrl') + driverEndpoints.gig + '?page=' + page + '&limit=' + limit + '&is_completed=true',
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});

export const getBiddings = (page, limit, token) => cy.api({
    method: 'GET',
    url: Cypress.env('apiUrl') + driverEndpoints.gig + driverEndpoints.bidding + '?status[]=placed&page=' + page + '&limit=' + limit + '&is_applied=true',
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});