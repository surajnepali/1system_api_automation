/// <reference types="Cypress" />

import { login, switchRole } from "../../api/Auth_APIs/handleAuth.api";
import { acceptOrderByVendor, createOrder, rejectOrderByVendor } from "../../api/Order_APIs/handleOrder.api";
import { createOrderData } from "../../api/Order_APIs/order.data";
import { vendorCreateData } from "../../api/Vendor_APIs/vendor.data";
import { orderErrorMessages } from "../../message/Error/Order/orderErrorMessages";
import { orderSuccessMessages } from "../../message/Successful/Order/orderSuccessMessages";
import { userSuccessMessages } from "../../message/Successful/User/userSuccessMessages";

let userToken, vendorToken;

// only for this time
let branchId = 61, serviceId = 50, offeringId = 11, orderId;

describe('Reject Order By Vendor', () => {

    describe('After Login', () => {
                
        describe('Order has initialized status in ready state', () => {
                    
            before(() => {
                login(Cypress.env('userWithNoRole'), Cypress.env('password'), 'email').then((response) => {
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
                });
            });
    
            it('Vendor should be logged in', () => {
                login(vendorCreateData.approvedVendor, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', orderSuccessMessages.successfulLogin);
                    expect(response.body.data).to.have.property('token');
                    vendorToken = response.body.data.token;
                });
            });

            it('should switch to vendor role', () => {
                const var1 = 'vendor'
                switchRole('vendor', vendorToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${userSuccessMessages.roleSwitched} ${var1}`);
                    vendorToken = response.body.data.token;
                });
            });
    
            it('Vendor should reject the order', () => {
                rejectOrderByVendor(orderId, vendorToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', orderSuccessMessages.orderRejectedByVendor);
                    expect(response.body.data.order[0]).to.have.property('status', 'rejected');
                });
            });

        });

        describe('Order has accepted status in ready state', () => {

            before(() => {
                login(Cypress.env('userWithNoRole'), Cypress.env('password'), 'email').then((response) => {
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
                });
            });

            it('Vendor should be logged in', () => {
                login(vendorCreateData.approvedVendor, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', orderSuccessMessages.successfulLogin);
                    expect(response.body.data).to.have.property('token');
                    vendorToken = response.body.data.token;
                });
            });

            it('should switch to vendor role', () => {
                switchRole('vendor', vendorToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${userSuccessMessages.roleSwitched} vendor`);
                    vendorToken = response.body.data.token;
                });
            });

            it('Vendor should accept the order', () => {
                acceptOrderByVendor(orderId, vendorToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', orderSuccessMessages.orderAcceptedByVendor);
                    expect(response.body.data.order[0]).to.have.property('status', 'accepted');
                });
            });

            it('should throw error on trying to reject the accepted order', () => {
                rejectOrderByVendor(orderId, vendorToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', orderErrorMessages.couldNotRejectOrder);
                });
            });

        });

    });

    describe('Without Login', () => {
            
        it('should throw error on trying to reject order without login', () => {
            rejectOrderByVendor(orderId, null).then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', orderErrorMessages.unauthorized);
            });
        });
    
    });

});