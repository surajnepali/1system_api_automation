/// <reference types="cypress" />

import ENDPOINTS from "../constants/endpoints";

const setOTP = (eMail, purPose) => cy.api({
    method: 'POST',
    url: Cypress.env('apiUrl') + ENDPOINTS.setOTP,
    body: {
        email: eMail,
        purpose: purPose,
    },
    failOnStatusCode: false,
});

const verifyOTP = (eMail, purPose, oTp) => cy.api({
    method: 'POST',
    url: Cypress.env('apiUrl') + ENDPOINTS.verifyOTP,
    body: {
        email: eMail,
        purpose: purPose,
        otp: oTp,
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

export default{
    setOTP,
    verifyOTP,
    registerCustomer,
}