/// <reference types="Cypress" />

import { login, switchRole } from "../../api/Auth_APIs/handleAuth.api";
import { acceptOrderByVendor, createOrder } from "../../api/Order_APIs/handleOrder.api";
import { createOrderData, orderAccessEmails } from "../../api/Order_APIs/order.data";
import { getAllBranchesOfVendor, getAllOfferingsOfBranch } from "../../api/Vendor_APIs/handleVendor.api";
import { orderApiOptions } from "../../constants/apiOptions.constants";
import { commonError, orderErrorMessages } from "../../message/errorMessage";
import { commonSuccessMessages, orderSuccessMessages, vendorSuccessMessages } from "../../message/successfulMessage";

let userToken, vendorToken;
let role;

// Only for some time
let branchId, serviceId, offeringId, orderId;

describe('Accept Order By Vendor', () => {

    describe('GET branchId, ServiceId, OfferingId', () => {
        
        before(() => {
            login(orderAccessEmails.approvedVendorEmail, Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                expect(response.body.data).to.have.property('token');
                userToken = response.body.data.token;
            });
        });

        it('should switch to vendor role', () => {
            role = 'vendor';
            switchRole(role, userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', `${commonSuccessMessages.switchedTo} ${role}`);
                expect(response.body.data).to.have.property('token');
                vendorToken = response.body.data.token;
            });
        });

        it('should get all the branches of the vendor', () => {
            getAllBranchesOfVendor(vendorToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', vendorSuccessMessages.retrievedAllBranches);
                const branches = response.body.data.branches;
                const randomIndex = Math.floor(Math.random() * branches.length);
                cy.log('Random Index: ' + randomIndex);
                const randomBranch = branches[randomIndex];
                branchId = randomBranch.id;
                cy.log('Branch ID: ' + branchId);
            });
        });

        it('should get all the offerings of the branch', () => {
            getAllOfferingsOfBranch(vendorToken, branchId).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', vendorSuccessMessages.allOfferingsOfBranch);
                const offerings = response.body.data.offerings;
                const randomIndex = Math.floor(Math.random() * offerings.length);
                serviceId = offerings[randomIndex].service_id;
                cy.log(serviceId);
                const randomOffering = offerings[randomIndex];
                offeringId = randomOffering.id;
                cy.log('Offering ID: ' + offeringId);
            });
        });
    });

    describe('After Login', () => {
        
        describe('Order has initialized status in ready state', () => {
        
            describe('Order is accepted by the appropriate vendor', () => {

                before(() => {
                    login(orderAccessEmails.onlyCustomerEmail, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;   
                    });
                });

                it('should create order successfully', () => {
                    const x = {...createOrderData, branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                    createOrder(x, userToken).then((response) => {
                        expect(response.status).to.eq(201);
                        expect(response.body).to.have.property('message', `${orderSuccessMessages.successful}created`);
                        expect(response.body.data).to.have.property('order');
                        expect(response.body.data.order).to.have.property('id');
                        orderId = response.body.data.order.id;
                        expect(response.body.data.order).to.have.property('status', orderApiOptions.INITIALIZED);
                        cy.log('Order Status: ', response.body.data.order.status)
                    });
                });

                it('Vendor should accept the order', () => {
                    acceptOrderByVendor(orderId, vendorToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${orderSuccessMessages.successful}accepted`);
                        expect(response.body.data.order[0]).to.have.property('status', orderApiOptions.ACCEPTED);
                        cy.log('Order Status: ', response.body.data.order[0].status)
                    });
                });

            });

            describe('Unappropriate vendor is trying to accept the order', () => {
                    
                before(() => {
                    login(orderAccessEmails.onlyCustomerEmail, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;   
                    });
                });
    
                it('should create order successfully', () => {
                    const x = {...createOrderData, branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                    createOrder(x, userToken).then((response) => {
                        expect(response.status).to.eq(201);
                        expect(response.body).to.have.property('message', `${orderSuccessMessages.successful}created`);
                        expect(response.body.data).to.have.property('order');
                        expect(response.body.data.order).to.have.property('id');
                        orderId = response.body.data.order.id;
                        expect(response.body.data.order).to.have.property('status', 'initialized');
                        cy.log('Order Status: ', response.body.data.order.status)
                    });
                });
    
                it('should login with vendor Email', () => {
                    login(orderAccessEmails.approvedVendorEmail2, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;   
                    });
                });

                it('should switch to vendor role', () => {
                    role = 'vendor'
                    switchRole(role, userToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.switchedTo} ${role}`);
                        vendorToken = response.body.data.token;
                    });
                });
    
                it('Vendor should not accept the order', () => {
                    acceptOrderByVendor(orderId, vendorToken).then((response) => {
                        expect(response.status).to.eq(400);
                        expect(response.body).to.have.property('message', orderErrorMessages.cantPerformAction);
                    });
                });
    
            });

        });

        describe('Order has ready status in ready state', () => {

            describe('Appropriate vendor is trying to accept the accepted order', () => {

                before(() => {
                    login(orderAccessEmails.onlyCustomerEmail, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;   
                    });
                });

                it('should create order successfully', () => {
                    const x = {...createOrderData, branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                    createOrder(x, userToken).then((response) => {
                        expect(response.status).to.eq(201);
                        expect(response.body).to.have.property('message', `${orderSuccessMessages.successful}created`);
                        expect(response.body.data).to.have.property('order');
                        expect(response.body.data.order).to.have.property('id');
                        orderId = response.body.data.order.id;
                        expect(response.body.data.order).to.have.property('status', 'initialized');
                        cy.log('Order Status: ', response.body.data.order.status)
                    });
                });

                it('Vendor should be logged in', () => {
                    login(orderAccessEmails.approvedVendorEmail, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;   
                    });
                });

                it('should switch to vendor role', () => {
                    role = 'vendor'
                    switchRole(role, userToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.switchedTo} ${role}`);
                        vendorToken = response.body.data.token;
                    });
                });

                it('Vendor should accept the order', () => {
                    acceptOrderByVendor(orderId, vendorToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${orderSuccessMessages.successful}accepted`);
                        expect(response.body.data.order[0]).to.have.property('status', orderApiOptions.ACCEPTED);
                        cy.log('Order Status: ', response.body.data.order[0].status)
                    });
                });

                it('should throw error on trying to accept the already accepted order', () => {
                    acceptOrderByVendor(orderId, vendorToken).then((response) => {
                        expect(response.status).to.eq(400);
                        expect(response.body).to.have.property('message', orderErrorMessages.cantReAccept);
                    });
                });

            });

            describe('Unappropriate vendor is trying to accept the accepted order', () => {

                before(() => {
                    login(orderAccessEmails.onlyCustomerEmail, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;   
                    });
                });

                it('should create order successfully', () => {
                    const x = {...createOrderData, branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                    createOrder(x, userToken).then((response) => {
                        expect(response.status).to.eq(201);
                        expect(response.body).to.have.property('message', `${orderSuccessMessages.successful}created`);
                        expect(response.body.data).to.have.property('order');
                        expect(response.body.data.order).to.have.property('id');
                        orderId = response.body.data.order.id;
                        expect(response.body.data.order).to.have.property('status', orderApiOptions.INITIALIZED);
                        cy.log('Order Status: ', response.body.data.order.status)
                    });
                });

                it('Vendor should be logged in', () => {
                    login(orderAccessEmails.approvedVendorEmail, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;   
                    });
                });

                it('should switch to vendor role', () => {
                    role = 'vendor'
                    switchRole(role, userToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.switchedTo} ${role}`);
                        vendorToken = response.body.data.token;
                    });
                });

                it('Vendor should accept the order', () => {
                    acceptOrderByVendor(orderId, vendorToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${orderSuccessMessages.successful}accepted`);
                        expect(response.body.data.order[0]).to.have.property('status', orderApiOptions.ACCEPTED);
                        cy.log('Order Status: ', response.body.data.order[0].status)
                    });
                });

                it('should login with another vendor account', () => {
                    login(orderAccessEmails.approvedVendorEmail2, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;   
                    });
                });

                it('should switch to vendor role', () => {
                    role = 'vendor'
                    switchRole(role, userToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.switchedTo} ${role}`);
                        vendorToken = response.body.data.token;
                    });
                });

                it('should throw error on trying to accept the already accepted order', () => {
                    acceptOrderByVendor(orderId, vendorToken).then((response) => {
                        expect(response.status).to.eq(400);
                        expect(response.body).to.have.property('message', orderErrorMessages.cantPerformAction);
                    });
                });

            });

        });

    });

    describe('Without Login', () => {

        describe('should throw error on trying to accept order without login', () => {
                
            it('should throw error on trying to accept order without login', () => {
                acceptOrderByVendor(orderId, '').then((response) => {
                    expect(response.status).to.eq(401);
                    expect(response.body).to.have.property('message', `${commonError.unauthorized}`);
                });
            });
    
        });

    });

});