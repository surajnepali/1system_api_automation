/// <reference types="Cypress" />

import { login, switchRole } from "../../../api/Auth_APIs/handleAuth.api";
import { orderAccessEmails } from "../../../api/Order_APIs/order.data";
import { getOrderByFilter } from "../../../api/User_APIs/handleUser.api";
import { orderApiOptions, pageOptions } from "../../../constants/apiOptions.constants";
import { commonError } from "../../../message/errorMessage";
import { commonSuccessMessages, userSuccessMessages } from "../../../message/successfulMessage";

let userToken, vendorToken, driverToken, role;

describe('Get Orders With Filter API Testing', () => {

    describe('Without Login', () => {

        it('should throw error message of unauthorized', () => {
            getOrderByFilter(orderApiOptions.READY, pageOptions.PAGE, pageOptions.LIMIT ,'').then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', `${commonError.unauthorized}`);
            });
        });
    });

    describe('After Login', () => {

        describe('When user is in customer mode', () => {

            before(() => {
                login(orderAccessEmails.onlyCustomerEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });

            it('should display all the orders of order tab ready', () => {
                let initializedCount = 0, acceptedCount = 0;
                getOrderByFilter(orderApiOptions.READY, pageOptions.PAGE, pageOptions.LIMIT , userToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${userSuccessMessages.orderRetrieved}`);
                    expect(response.body).to.have.property('data');
                    if(response.body.data.orders.length <= 0){
                        cy.log('No orders found');
                    }else{
                        for(let i=0; i<response.body.data.orders.length; i++){
                            if(response.body.data.orders[i].status == orderApiOptions.INITIALIZED){
                                initializedCount++;
                            }else if(response.body.data.orders[i].status == orderApiOptions.ACCEPTED){
                                acceptedCount++;
                            }
                        }
                        cy.log('Initialized Count: ' + initializedCount);
                        cy.log('Ready Count: ' + acceptedCount);
                    }
                });
            });

            it('should display all the orders of order tab picking', () => {
                let pickAssignedCount = 0, pickedUpCount = 0;
                getOrderByFilter(orderApiOptions.PICKING, pageOptions.PAGE, pageOptions.LIMIT , userToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${userSuccessMessages.orderRetrieved}`);
                    expect(response.body).to.have.property('data');
                    if(response.body.data.orders.length <= 0){
                        cy.log('No orders found');
                    }else{
                        for(let i=0; i<response.body.data.orders.length; i++){
                            if(response.body.data.orders[i].status == orderApiOptions.PICKUP_ASSIGNED){
                                pickAssignedCount++;
                            }else if(response.body.data.orders[i].status == orderApiOptions.PICKEDUP){
                                pickedUpCount++;
                            }
                        }
                        cy.log('Pick Assigned Count: ' + pickAssignedCount);
                        cy.log('Picked Up Count: ' + pickedUpCount);
                    }
                });
            });

            it('should display all the orders of order tab processing', () => {
                let servicingCount = 0, readyCount = 0;
                getOrderByFilter(orderApiOptions.PROCESSING, pageOptions.PAGE, pageOptions.LIMIT , userToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${userSuccessMessages.orderRetrieved}`);
                    expect(response.body).to.have.property('data');
                    if(response.body.data.orders.length <= 0){
                        cy.log('No orders found');
                    }else{
                        for(let i=0; i<response.body.data.orders.length; i++){
                            if(response.body.data.orders[i].status == orderApiOptions.SERVICING){
                                servicingCount++;
                            }else if(response.body.data.orders[i].status == orderApiOptions.READY){
                                readyCount++;
                            }
                        }
                        cy.log('Servicing Count: ' + servicingCount);
                        cy.log('Ready Count: ' + readyCount);
                    }
                });
            });

            it('should display all the orders of order tab dropping', () => {
                let deliveryAssignedCount = 0, droppingCount = 0;
                getOrderByFilter(orderApiOptions.DROPPING, pageOptions.PAGE, pageOptions.LIMIT , userToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${userSuccessMessages.orderRetrieved}`);
                    expect(response.body).to.have.property('data');
                    if(response.body.data.orders.length <= 0){
                        cy.log('No orders found');
                    }else{
                        for(let i=0; i<response.body.data.orders.length; i++){
                            if(response.body.data.orders[i].status == orderApiOptions.DELIVERY_ASSIGNED){
                                deliveryAssignedCount++;
                            }else if(response.body.data.orders[i].status == orderApiOptions.DROPPING){
                                droppingCount++;
                            }
                        }
                        cy.log('Delivery Assigned Count: ' + deliveryAssignedCount);
                        cy.log('Dropping Count: ' + droppingCount);
                    }
                });
            });

            it('should display all the orders of order tab completed', () => {
                let completedCount = 0;
                getOrderByFilter(orderApiOptions.COMPLETED, pageOptions.PAGE, pageOptions.LIMIT , userToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${userSuccessMessages.orderRetrieved}`);
                    expect(response.body).to.have.property('data');
                    if(response.body.data.orders.length <= 0){
                        cy.log('No orders found');
                    }else{
                        for(let i=0; i<response.body.data.orders.length; i++){
                            if(response.body.data.orders[i].status == orderApiOptions.COMPLETED){
                                completedCount++;
                            }
                        }
                        cy.log('Completed Count: ' + completedCount);
                    }
                });
            });

            it('should display all the orders of order tab declined', () => {
                let rejectedCount = 0, cancelledCount = 0;
                getOrderByFilter(orderApiOptions.DECLINED, pageOptions.PAGE, pageOptions.LIMIT , userToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${userSuccessMessages.orderRetrieved}`);
                    expect(response.body).to.have.property('data');
                    if(response.body.data.orders.length <= 0){
                        cy.log('No orders found');
                    }else{
                        for(let i=0; i<response.body.data.orders.length; i++){
                            if(response.body.data.orders[i].status == orderApiOptions.REJECTED){
                                rejectedCount++;
                            }else if(response.body.data.orders[i].status == orderApiOptions.CANCELLED){
                                cancelledCount++;
                            }
                        }
                        cy.log('Rejected Count: ' + rejectedCount);
                        cy.log('Cancelled Count: ' + cancelledCount);
                    }
                });
            });

        });

        describe('When user is in vendor mode', () => {

            before(() => {
                login(orderAccessEmails.approvedVendorEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    vendorToken = response.body.data.token;
                });
            });

            it('should switched to vendor', () => {
                role = 'vendor';
                switchRole(role, vendorToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.switchedTo} ${role}`);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    vendorToken = response.body.data.token;
                });
            });

            it('should throw error on trying to get all the orders of order tab ready', () => {
                getOrderByFilter(orderApiOptions.READY, pageOptions.PAGE, pageOptions.LIMIT , vendorToken).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', `${commonError.forbidden} ${role} mode.`);
                });
            });

            it('should throw error on trying to get all the orders of order tab picking', () => {
                getOrderByFilter(orderApiOptions.PICKING, pageOptions.PAGE, pageOptions.LIMIT , vendorToken).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', `${commonError.forbidden} ${role} mode.`);
                });
            });

            it('should throw error on trying to get all the orders of order tab processing', () => {
                getOrderByFilter(orderApiOptions.PROCESSING, pageOptions.PAGE, pageOptions.LIMIT , vendorToken).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', `${commonError.forbidden} ${role} mode.`);
                });
            });

            it('should throw error on trying to get all the orders of order tab dropping', () => {
                getOrderByFilter(orderApiOptions.DROPPING, pageOptions.PAGE, pageOptions.LIMIT , vendorToken).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', `${commonError.forbidden} ${role} mode.`);
                });
            });

            it('should throw error on trying to get all the orders of order tab completed', () => {
                getOrderByFilter(orderApiOptions.COMPLETED, pageOptions.PAGE, pageOptions.LIMIT , vendorToken).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', `${commonError.forbidden} ${role} mode.`);
                });
            });

            it('should throw error on trying to get all the orders of order tab declined', () => {
                getOrderByFilter(orderApiOptions.DECLINED, pageOptions.PAGE, pageOptions.LIMIT , vendorToken).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', `${commonError.forbidden} ${role} mode.`);
                });
            });

        });

        describe('When user is in driver mode', () => {

            before(() => {
                login(orderAccessEmails.approvedDriverEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });

            it('should switched to driver', () => {
                role = 'driver';
                switchRole(role, userToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.switchedTo} ${role}`);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    driverToken = response.body.data.token;
                });
            });

            it('should throw error on trying to get all the orders of order tab ready', () => {
                getOrderByFilter(orderApiOptions.READY, pageOptions.PAGE, pageOptions.LIMIT , driverToken).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', `${commonError.forbidden} ${role} mode.`);
                });
            });

            it('should throw error on trying to get all the orders of order tab picking', () => {
                getOrderByFilter(orderApiOptions.PICKING, pageOptions.PAGE, pageOptions.LIMIT , driverToken).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', `${commonError.forbidden} ${role} mode.`);
                });
            });

            it('should throw error on trying to get all the orders of order tab processing', () => {
                getOrderByFilter(orderApiOptions.PROCESSING, pageOptions.PAGE, pageOptions.LIMIT , driverToken).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', `${commonError.forbidden} ${role} mode.`);
                });
            });

            it('should throw error on trying to get all the orders of order tab dropping', () => {
                getOrderByFilter(orderApiOptions.DROPPING, pageOptions.PAGE, pageOptions.LIMIT , driverToken).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', `${commonError.forbidden} ${role} mode.`);
                });
            });

            it('should throw error on trying to get all the orders of order tab completed', () => {
                getOrderByFilter(orderApiOptions.COMPLETED, pageOptions.PAGE, pageOptions.LIMIT , driverToken).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', `${commonError.forbidden} ${role} mode.`);
                });
            });

            it('should throw error on trying to get all the orders of order tab declined', () => {
                getOrderByFilter(orderApiOptions.DECLINED, pageOptions.PAGE, pageOptions.LIMIT , driverToken).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', `${commonError.forbidden} ${role} mode.`);
                });
            });

        });

    });

});