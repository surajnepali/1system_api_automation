/// <reference types="Cypress" />

import { orderEndpoints } from "../../constants/endpoints";

export const createOrder = (orderData, token) => cy.api({
    method: 'POST',
    url: Cypress.env('apiUrl') + orderEndpoints.orderApi + orderEndpoints.createOrder,
    body: {...orderData},
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});

export const getOrderDetails = (orderId, token) => cy.api({
    method: 'GET',
    url: Cypress.env('apiUrl') + orderEndpoints.orderApi + '/' + orderId,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});

export const cancelOrderByUser = (orderId, token) => cy.api({
    method: 'PATCH',
    url: Cypress.env('apiUrl') + orderEndpoints.orderApi + '/' + orderId + orderEndpoints.cancelOrderByUser,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});

export const acceptOrderByVendor = (orderId, token) => cy.api({
    method: 'PATCH',
    url: Cypress.env('apiUrl') + orderEndpoints.orderApi + '/' + orderId + orderEndpoints.acceptOrderByVendor,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});

export const rejectOrderByVendor = (orderId, token) => cy.api({
    method: 'PATCH',
    url: Cypress.env('apiUrl') + orderEndpoints.orderApi + '/' + orderId + orderEndpoints.rejectOrderByVendor,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});

export const vendorStartServicing = (orderId, token) => cy.api({
    method: 'PATCH',
    url: Cypress.env('apiUrl') + orderEndpoints.orderApi + '/' + orderId + orderEndpoints.startServicing,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});

export const vendorFinishServicing = (orderId, token) => cy.api({
    method: 'PATCH',
    url: Cypress.env('apiUrl') + orderEndpoints.orderApi + '/' + orderId + orderEndpoints.readyToDeliver,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});

export const completeOrderProcess = (orderId, token) => cy.api({
    method: 'PATCH',
    url: Cypress.env('apiUrl') + orderEndpoints.orderApi + '/' + orderId + orderEndpoints.orderCompleted,
    headers: {
        'Authorization': 'Bearer ' + token,
    },
    failOnStatusCode: false,
});