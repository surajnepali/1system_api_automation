/// <reference types="cypress" />

import ENDPOINTS from "../../constants/endpoints";

export const setOTP = (email, purpose) => cy.api({
    method: 'POST',
    url: Cypress.env('apiUrl') + ENDPOINTS.setOTP,
    body: {
        email,
        purpose,
    },
    failOnStatusCode: false,
});

export const verifyOTP = (email, purpose, otp) => cy.api({
    method: 'POST',
    url: Cypress.env('apiUrl') + ENDPOINTS.verifyOTP,
    body: {
        email,
        purpose,
        otp,
    },
    failOnStatusCode: false,
});

export const registerCustomer = (userData) => cy.api({
    method: 'POST',
    url: Cypress.env('apiUrl') + ENDPOINTS.registerCustomer,
    body: userData,
    failOnStatusCode: false,
});

export const registerCustomerWithImage = (formData) => cy.api({
    method: 'POST',
    url: Cypress.env('apiUrl') + ENDPOINTS.registerCustomer,
    body: formData,
    headers: {
        'content-type': 'multipart/form-data',
    },
    failOnStatusCode: false,
});

export const changePassword = (current_password, password, token) => cy.api({
    method: 'PATCH',
    url: Cypress.env('apiUrl') + ENDPOINTS.changePassword,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    body: {
        current_password,
        password,
    },
    failOnStatusCode: false,
});

export const getProfile = (token) => cy.api({
    method: 'GET',
    url: Cypress.env('apiUrl') + ENDPOINTS.getProfile,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});

export const editProfile = (editUserData, token) => cy.api({
    method: 'PATCH',
    url: Cypress.env('apiUrl') + ENDPOINTS.editProfile,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    body: editUserData,
    failOnStatusCode: false,
});

export const login = (email, password, loginAgent) => cy.api({
    method: 'POST',
    url: Cypress.env('apiUrl') + ENDPOINTS.login,
    body: {
        email,
        password,
        loginAgent,
    },
    failOnStatusCode: false,
});

export const switchRole = (role, token) => cy.api({
    method: 'POST',
    url: Cypress.env('apiUrl') + ENDPOINTS.switchRole,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    body: {
        role,
    },
    failOnStatusCode: false,
});

export const forgotPassword = (email, otp, password) => cy.api({
    method: 'POST',
    url: Cypress.env('apiUrl') + ENDPOINTS.forgotPassword,
    body: {
        email,
        otp,
        password,
    },
    failOnStatusCode: false,
});