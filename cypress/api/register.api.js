/// <reference types="cypress" />

import ENDPOINTS from "../constants/endpoints";

const setOTP = (email, purpose) => cy.api({
    method: 'POST',
    url: Cypress.env('apiUrl') + ENDPOINTS.setOTP,
    body: {
        email,
        purpose,
    },
    failOnStatusCode: false,
});

const verifyOTP = (email, purpose, otp) => cy.api({
    method: 'POST',
    url: Cypress.env('apiUrl') + ENDPOINTS.verifyOTP,
    body: {
        email,
        purpose,
        otp,
    },
    failOnStatusCode: false,
});

const registerCustomer = (email, username, password, otp, estimated_service_usage) => cy.api({
    method: 'POST',
    url: Cypress.env('apiUrl') + ENDPOINTS.registerCustomer,
    body: {
        email,
        username,
        password,
        otp,
        estimated_service_usage,
    },
    failOnStatusCode: false,
});

const registerCustomerWithImage = (formData) => cy.api({
    method: 'POST',
    url: Cypress.env('apiUrl') + ENDPOINTS.registerCustomer,
    body: formData,
    headers: {
        'content-type': 'multipart/form-data',
    },
    failOnStatusCode: false,
});

export default{
    setOTP,
    verifyOTP,
    registerCustomer,
    registerCustomerWithImage,
}