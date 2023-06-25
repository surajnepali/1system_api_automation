/// <reference types="Cypress" />

import ENDPOINTS from "../../constants/endpoints";

export const createBranchOffering = ({price, estimated_hour, description, service_id}, token, branchId) => cy.api({
    method: 'POST',
    url: Cypress.env('apiUrl') + ENDPOINTS.createBranchOffer + branchId + '/offering',
    headers: {
        Authorization: 'Bearer ' + token,
    },
    body: {
        price,
        estimated_hour,
        description,
        service_id
    },
    failOnStatusCode: false,
});

export const editBranchOffering = ({price, estimated_hour, description, service_id}, token, branchId, offeringId) => cy.api({
    method: 'PATCH',
    url: Cypress.env('apiUrl') + ENDPOINTS.createBranchOffer + branchId + '/offering/' + offeringId,
    headers: {
        Authorization: 'Bearer ' + token,
    },
    body: {
        price,
        estimated_hour,
        description,
        service_id
    },
    failOnStatusCode: false,
});

export const getAllOfferingsOfBranch = (token, branchId) => cy.api({
    method: 'GET',
    url: Cypress.env('apiUrl') + ENDPOINTS.createBranchOffer + branchId + '/offering',
    headers: {
        Authorization: 'Bearer ' + token,
    },
    failOnStatusCode: false,
});

export const getAOffering = (token, branchId, offeringId) => cy.api({
    method: 'GET',
    url: Cypress.env('apiUrl') + ENDPOINTS.createBranchOffer + branchId + '/offering/' + offeringId,
    headers: {
        Authorization: 'Bearer ' + token,
    },
    failOnStatusCode: false,
});