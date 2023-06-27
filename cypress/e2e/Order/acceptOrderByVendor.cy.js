/// <reference types="Cypress" />

import { acceptOrderByVendor, createOrder } from "../../api/Order_APIs/handleOrder.api";
import { createOrderData } from "../../api/Order_APIs/order.data";
import { vendorCreateData } from "../../api/Vendor_APIs/vendor.data";
import loginApi from "../../api/login.api";
import switchRoleApi from "../../api/switchRole.api";
import { orderErrorMessages } from "../../message/Error/Order/orderErrorMessages";
import { orderSuccessMessages } from "../../message/Successful/Order/orderSuccessMessages";
import { userSuccessMessages } from "../../message/Successful/User/userSuccessMessages";

let userToken, vendorToken;

// Only for some time
let branchId = 61, serviceId = 50, offeringId = 11, orderId;

describe('Accept Order By Vendor', () => {

    describe('After Login', () => {
        
        describe('Order has initialized status in ready state', () => {
        
            describe('Order is accepted by the appropriate vendor', () => {

                before(() => {
                    loginApi.loginUser(Cypress.env('userWithNoRole'), Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', orderSuccessMessages.successfulLogin);
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;   
                    });
                });

                it('should create order successfully', () => {
                    const x = {...createOrderData, branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                    createOrder(x, userToken).then((response) => {
                        expect(response.status).to.eq(201);
                        expect(response.body).to.have.property('message', orderSuccessMessages.orderCreatedSuccessfully);
                        expect(response.body.data).to.have.property('order');
                        expect(response.body.data.order).to.have.property('id');
                        orderId = response.body.data.order.id;
                        expect(response.body.data.order).to.have.property('status', 'initialized');
                        cy.log('Order Status: ', response.body.data.order.status)
                    });
                });

                it('Vendor should be logged in', () => {
                    loginApi.loginUser(vendorCreateData.approvedVendor, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', orderSuccessMessages.successfulLogin);
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;   
                    });
                });

                it('should switch to vendor role', () => {
                    const var1 = 'vendor'
                    switchRoleApi.switchRole('vendor', userToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${userSuccessMessages.roleSwitched} ${var1}`);
                        vendorToken = response.body.data.token;
                    });
                });

                it('Vendor should accept the order', () => {
                    acceptOrderByVendor(orderId, vendorToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', orderSuccessMessages.orderAcceptedByVendor);
                        expect(response.body.data.order[0]).to.have.property('status', 'accepted');
                        cy.log('Order Status: ', response.body.data.order[0].status)
                    });
                });

            });

            describe('Unappropriate vendor is trying to accept the order', () => {
                    
                before(() => {
                    loginApi.loginUser(Cypress.env('userWithNoRole'), Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', orderSuccessMessages.successfulLogin);
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;   
                    });
                });
    
                it('should create order successfully', () => {
                    const x = {...createOrderData, branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                    createOrder(x, userToken).then((response) => {
                        expect(response.status).to.eq(201);
                        expect(response.body).to.have.property('message', orderSuccessMessages.orderCreatedSuccessfully);
                        expect(response.body.data).to.have.property('order');
                        expect(response.body.data.order).to.have.property('id');
                        orderId = response.body.data.order.id;
                        expect(response.body.data.order).to.have.property('status', 'initialized');
                        cy.log('Order Status: ', response.body.data.order.status)
                    });
                });
    
                it('Vendor should be logged in', () => {
                    loginApi.loginUser(Cypress.env('userWithVendorRoleApproved'), Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', orderSuccessMessages.successfulLogin);
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;   
                    });
                });
    
                it('should switch to vendor role', () => {
                    const var1 = 'vendor'
                    switchRoleApi.switchRole('vendor', userToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${userSuccessMessages.roleSwitched} ${var1}`);
                        vendorToken = response.body.data.token;
                    });
                });
    
                it('Vendor should not accept the order', () => {
                    acceptOrderByVendor(orderId, vendorToken).then((response) => {
                        expect(response.status).to.eq(400);
                        expect(response.body).to.have.property('message', orderErrorMessages.cantAccept);
                    });
                });
    
            });

        });

        describe('Order has ready status in ready state', () => {

            describe('Appropriate vendor is trying to accept the accepted order', () => {

                before(() => {
                    loginApi.loginUser(Cypress.env('userWithNoRole'), Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', orderSuccessMessages.successfulLogin);
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;   
                    });
                });

                it('should create order successfully', () => {
                    const x = {...createOrderData, branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                    createOrder(x, userToken).then((response) => {
                        expect(response.status).to.eq(201);
                        expect(response.body).to.have.property('message', orderSuccessMessages.orderCreatedSuccessfully);
                        expect(response.body.data).to.have.property('order');
                        expect(response.body.data.order).to.have.property('id');
                        orderId = response.body.data.order.id;
                        expect(response.body.data.order).to.have.property('status', 'initialized');
                        cy.log('Order Status: ', response.body.data.order.status)
                    });
                });

                it('Vendor should be logged in', () => {
                    loginApi.loginUser(vendorCreateData.approvedVendor, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', orderSuccessMessages.successfulLogin);
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;   
                    });
                });

                it('should switch to vendor role', () => {
                    const var1 = 'vendor'
                    switchRoleApi.switchRole('vendor', userToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${userSuccessMessages.roleSwitched} ${var1}`);
                        vendorToken = response.body.data.token;
                    });
                });

                it('Vendor should accept the order', () => {
                    acceptOrderByVendor(orderId, vendorToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', orderSuccessMessages.orderAcceptedByVendor);
                        expect(response.body.data.order[0]).to.have.property('status', 'accepted');
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
                    loginApi.loginUser(Cypress.env('userWithNoRole'), Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', orderSuccessMessages.successfulLogin);
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;   
                    });
                });

                it('should create order successfully', () => {
                    const x = {...createOrderData, branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                    createOrder(x, userToken).then((response) => {
                        expect(response.status).to.eq(201);
                        expect(response.body).to.have.property('message', orderSuccessMessages.orderCreatedSuccessfully);
                        expect(response.body.data).to.have.property('order');
                        expect(response.body.data.order).to.have.property('id');
                        orderId = response.body.data.order.id;
                        expect(response.body.data.order).to.have.property('status', 'initialized');
                        cy.log('Order Status: ', response.body.data.order.status)
                    });
                });

                it('Vendor should be logged in', () => {
                    loginApi.loginUser(vendorCreateData.approvedVendor, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', orderSuccessMessages.successfulLogin);
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;   
                    });
                });

                it('should switch to vendor role', () => {
                    const var1 = 'vendor'
                    switchRoleApi.switchRole('vendor', userToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${userSuccessMessages.roleSwitched} ${var1}`);
                        vendorToken = response.body.data.token;
                    });
                });

                it('Vendor should accept the order', () => {
                    acceptOrderByVendor(orderId, vendorToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', orderSuccessMessages.orderAcceptedByVendor);
                        expect(response.body.data.order[0]).to.have.property('status', 'accepted');
                        cy.log('Order Status: ', response.body.data.order[0].status)
                    });
                });

                it('should login with another vendor account', () => {
                    loginApi.loginUser(Cypress.env('userWithVendorRoleApproved'), Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', orderSuccessMessages.successfulLogin);
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;   
                    });
                });

                it('should switch to vendor role', () => {
                    const var1 = 'vendor'
                    switchRoleApi.switchRole('vendor', userToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${userSuccessMessages.roleSwitched} ${var1}`);
                        vendorToken = response.body.data.token;
                    });
                });

                it('should throw error on trying to accept the already accepted order', () => {
                    acceptOrderByVendor(orderId, vendorToken).then((response) => {
                        expect(response.status).to.eq(400);
                        expect(response.body).to.have.property('message', orderErrorMessages.cantAccept);
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
                    expect(response.body).to.have.property('message', orderErrorMessages.unauthorized);
                });
            });
    
        });

    });

});