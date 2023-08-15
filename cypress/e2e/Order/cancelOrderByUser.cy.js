/// reference types="Cypress" />

import { acceptOrderByVendor, cancelOrderByUser, createOrder } from "../../api/Order_APIs/handleOrder.api";
import { createOrderData, orderAccessEmails } from "../../api/Order_APIs/order.data";
import { commonSuccessMessages, orderSuccessMessages, vendorSuccessMessages } from "../../message/successfulMessage";
import { login, switchRole } from "../../api/Auth_APIs/handleAuth.api";
import { getAllBranchesOfVendor, getAllOfferingsOfBranch } from "../../api/Vendor_APIs/handleVendor.api";
import { orderApiOptions } from "../../constants/apiOptions.constants";
import { orderErrorMessages } from "../../message/errorMessage";

let userToken, vendorToken, role;
let branchId, serviceId, offeringId, orderId;

describe('Cancel Order By User', () => {

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
            role = 'vendor'
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
                expect(response.body).to.have.property('message', `${vendorSuccessMessages.retrievedAllBranches}`);
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
                cy.log('Service ID: ' + serviceId);
                const randomOffering = offerings[randomIndex];
                offeringId = randomOffering.id;
                cy.log('Offering ID: ' + offeringId);
            });
        });

    });

    describe('After Login', () => {

        describe('Order is created by the same customer', () => {

            describe('Order has accepted status in ready state', () => {
                
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
                    });
                });

                it('Vendor should be logged in', () => {
                    login(orderAccessEmails.approvedVendorEmail, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                        expect(response.body.data).to.have.property('token');
                        vendorToken = response.body.data.token;
                    });
                });

                it('should switch to vendor role', () => {
                    const var1 = 'vendor'
                    switchRole('vendor', vendorToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.switchedTo} ${var1}`);
                        vendorToken = response.body.data.token;
                    });
                });

                it('Vendor should accept the order', () => {
                    acceptOrderByVendor(orderId, vendorToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${orderSuccessMessages.successful}accepted`);
                        expect(response.body.data.order[0]).to.have.property('status', orderApiOptions.ACCEPTED);
                    });
                });

                it('Should throw error on trying to cancel the accepted order', () => {
                    cancelOrderByUser(orderId, userToken).then((response) => {
                        expect(response.status).to.eq(400);
                        expect(response.body).to.have.property('message', orderErrorMessages.couldNotCancel);
                    });
                });

            });

            describe('Order has initialized status in ready state', () => {

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
                    });
                });

                it("should cancel the order successfully", () => {
                    cancelOrderByUser(orderId, userToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${orderSuccessMessages.successful}cancelled`);
                    });
                });                

            });
                
        });

        describe('Order is created by one customer and tries to cancel by another customer', () => {
                
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
                });
            });
    
            it('Another user should be logged in', () => {
                login(orderAccessEmails.approvedVendorEmail2, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;   
                });
            });
    
            it('should throw error on trying to cancel the order', () => {
                cancelOrderByUser(orderId, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', orderErrorMessages.nothingToReject);
                });
            });
    
        });

    });

});