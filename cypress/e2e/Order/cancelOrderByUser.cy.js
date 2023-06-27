/// reference types="Cypress" />

import { acceptOrderByVendor, cancelOrderByUser, createOrder } from "../../api/Order_APIs/handleOrder.api";
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

describe('Cancel Order By User', () => {

    describe('After Login', () => {

        describe('Order is created by the same customer', () => {

            describe('Order has accepted status in initialized state', () => {
                
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
                    });
                });

                it('Vendor should be logged in', () => {
                    loginApi.loginUser(vendorCreateData.approvedVendor, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', orderSuccessMessages.successfulLogin);
                        expect(response.body.data).to.have.property('token');
                        vendorToken = response.body.data.token;
                    });
                });

                it('should switch to vendor role', () => {
                    const var1 = 'vendor'
                    switchRoleApi.switchRole('vendor', vendorToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${userSuccessMessages.roleSwitched} ${var1}`);
                        vendorToken = response.body.data.token;
                    });
                });

                it('Vendor should accept the order', () => {
                    acceptOrderByVendor(orderId, vendorToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', orderSuccessMessages.orderAcceptedByVendor);
                    });
                });

                it('Should throw error on trying to cancel the accepted order', () => {
                    cancelOrderByUser(orderId, userToken).then((response) => {
                        expect(response.status).to.eq(400);
                        expect(response.body).to.have.property('message', orderErrorMessages.couldNotCancel);
                    });
                });

            });
                
        });

    });

});