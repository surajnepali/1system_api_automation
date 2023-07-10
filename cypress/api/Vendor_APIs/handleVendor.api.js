/// reference types = "cypress" />

import ENDPOINTS from '../../constants/endpoints';

export const applyForVendor = (formData) => cy.api({
    method: 'POST',
    url: Cypress.env('apiUrl') + ENDPOINTS.applyForVendor,
    headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
        'content-type': 'multipart/form-data',
    },
    body: formData,
    failOnStatusCode: false,
});

export const createBranchOffering = ({ price, estimated_hour, description, service_id }, token, branchId) => cy.api({
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

export const createBranch = (createBranchData, token) => cy.api({
    method: 'POST',
    url: Cypress.env('apiUrl') + ENDPOINTS.createBranch,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    body: {
        createBranchData,
    },
    failOnStatusCode: false,
});

export const editBranch = (editBranchData, token, branchId) => cy.api({
    method: 'PATCH',
    url: Cypress.env('apiUrl') + ENDPOINTS.editBranch + branchId,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    body: {
        editBranchData,
    },
    failOnStatusCode: false,
});

export const editVendorApplication = (editVendorApplicationData, token) => cy.api({
    method: 'PATCH',
    url: Cypress.env('apiUrl') + ENDPOINTS.editVendorApplication,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    body: {
        editVendorApplicationData,
    },
    failOnStatusCode: false,
});

export const editVendorApplication2 = (branch, editVendorApplicationData, token) => cy.api({
    method: 'PATCH',
    url: Cypress.env('apiUrl') + ENDPOINTS.editVendorApplication2 + branch,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    body: {
        editVendorApplicationData,
    },
    failOnStatusCode: false,
});

export const editVendorApplication3 = (formData, token) => cy.api({
    method: 'PATCH',
    url: Cypress.env('apiUrl') + ENDPOINTS.editVendorApplication3,
    headers: {
        'Authorization': 'Bearer ' + token,
        'content-type': 'multipart/form-data',
    },
    body: formData,
    failOnStatusCode: false,
});

export const getAllBranchesOfVendor = (token) => cy.api({
    method: 'GET',
    url: Cypress.env('apiUrl') + ENDPOINTS.getAllBranchesOfVendor,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});

export const getApplicationDetails = (token) => cy.api({
    method: 'GET',
    url: Cypress.env('apiUrl') + ENDPOINTS.getVendorApplicationDetails,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});

export const getOrders = (token, page, limit, orderTab, branchId) => cy.api({
    method: 'GET',
    url: Cypress.env('apiUrl') + ENDPOINTS.getOrders + '?page=' + page + '&limit=' + limit + '&order_tab=' + orderTab + '&branch_id=' + branchId,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});

export const getServiceTypes = (page, limit, token) => cy.api({
    method: 'GET',
    url: Cypress.env('apiUrl') + ENDPOINTS.getServiceTypes + '?page=' + page + '&limit=' + limit,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});