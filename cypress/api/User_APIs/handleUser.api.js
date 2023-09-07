/// <reference types="Cypress" />

import { userEndpoints } from "../../constants/endpoints";

export const getProfile = (token) => cy.api({
    method: 'GET',
    url: Cypress.env('apiUrl') + userEndpoints.getProfile,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});

export const editProfile = (editUserData, token) => cy.api({
    method: 'PATCH',
    url: Cypress.env('apiUrl') + userEndpoints.editProfile,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    body: editUserData,
    failOnStatusCode: false,
});

export const changePassword = (current_password, password, token) => cy.api({
    method: 'PATCH',
    url: Cypress.env('apiUrl') + userEndpoints.changePassword,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    body: {
        current_password,
        password,
    },
    failOnStatusCode: false,
});

export const getOrderByFilter = (filter, page, limit, token) => cy.api({
    method: 'GET',
    url: Cypress.env('apiUrl') + userEndpoints.getAllOrderDetails + '?order_tab=' + filter + '&page=' + page +'&limit=' + limit,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});

export const getOrderDetailsById = (orderId, token) => cy.api({
    method: 'GET',
    url: Cypress.env('apiUrl') + userEndpoints.getAllOrderDetails + '/' + orderId,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});

export const getOrderTrackingById = (orderId, token) => cy.api({
    method: 'GET',
    url: Cypress.env('apiUrl') + userEndpoints.getAllOrderDetails + '/' + orderId + '/track',
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});

export const viewBiddings = (orderId, gigType, page, limit, token) => cy.api({
    method: 'GET',
    url: Cypress.env('apiUrl') + userEndpoints.getAllOrderDetails + '/' + orderId + '/bidding?gig_type=' + gigType + '&page=' + page + '&limit=' + limit,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});

export const acceptBid = (orderId, bidId, gigType, token) => cy.api({
    method: 'PATCH',
    url: Cypress.env('apiUrl') + userEndpoints.getAllOrderDetails + '/' + orderId + '/bidding/' + bidId + '/accept?gig_type=' + gigType,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});

export const sofeDeleteUser = (password, token) => cy.api({
    method: 'DELETE',
    url: Cypress.env('apiUrl') + userEndpoints.sofeDeleteUser,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    body: {
        password,
    },
    failOnStatusCode: false,
});