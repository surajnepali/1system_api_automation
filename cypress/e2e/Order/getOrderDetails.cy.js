/// <reference types="cypress" />

import { login, switchRole } from "../../api/Auth_APIs/handleAuth.api";
import { driverRole } from "../../api/Driver_APIs/driver.data";
import { getOrderDetails } from "../../api/Order_APIs/handleOrder.api";
import { getOrderDetailsByFilter } from "../../api/User_APIs/handleUser.api";
import { vendorCreateData } from "../../api/Vendor_APIs/vendor.data";
// import { orderErrorMessages } from "../../message/Error/Order/orderErrorMessages";
// import { orderSuccessMessages } from "../../message/Successful/Order/orderSuccessMessages";
import { userSuccessMessages } from "../../message/Successful/User/userSuccessMessages";
import { commonError, orderErrorMessages } from "../../message/errorMessage";
import { commonSuccessMessages } from "../../message/successfulMessage";

let userToken, vendorToken, orderId, role;

describe('Get Order Details', () => {

    describe('Without Login', () => {
            
        it('Should return 401 Unauthorized', () => {
            getOrderDetails('54').then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', `${commonError.unauthorized}`);
            });
        });
    
    });

    describe('With Login', () => {

        describe('User is already switched to Vendor mode', () => {

            before(() => {
                login(vendorCreateData.approvedVendor, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;    
                });
            });

            it('should switch to Vendor mode', () => {
                role = 'vendor';
                switchRole(role, userToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.switchedTo} ${role}`);
                    expect(response.body.data).to.have.property('token');
                    vendorToken = response.body.data.token;
                });
            });

            it('Should not get the details and should throw error 403', () => {
                getOrderDetails('54', vendorToken).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.switchedTo} ${role} mode.`);
                });
            });

        });

        describe('User is already switched to Driver mode', () => {
                
            before(() => {
                login(driverRole.approvedDriverEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;   
                });
            });
    
            it('should switch to Driver mode', () => {
                role = 'driver';
                switchRole(role, userToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.switchedTo} ${role}`);
                    expect(response.body.data).to.have.property('token');
                    vendorToken = response.body.data.token;
                });
            });
    
            it('Should not get the details and should throw error 403', () => {
                getOrderDetails('54', vendorToken).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.switchedTo} ${role} mode.`);
                });
            });
    
        });

        describe('User is already a customer', () => {

            describe('Order is not created by the same customer', () => {

                before(() => {
                    login(vendorCreateData.approvedVendor, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;   
                    });
                });

                it('Should not get the details and should throw error 400', () => {
                    const var1 = 'customer';
                    getOrderDetails('54', userToken).then((response) => {
                        expect(response.status).to.eq(400);
                        expect(response.body).to.have.property('message', `${orderErrorMessages.detailsNotFound}`);
                    });
                });

            });

            describe('Order is created by the same customer', () => {

                before(() => {
                    login(Cypress.env('userWithNoRole'), Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;   
                    });
                });

                it('Should get all ready orders', () => {
                    getOrderDetailsByFilter('ready', userToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', userSuccessMessages.ordersRetrievedSuccessfully);
                        const orders = response.body.data.orders;
                        if(orders.length > 0) {
                            const randomIndex = Math.floor(Math.random() * orders.length);
                            orderId = orders[randomIndex].id;
                            cy.log(orderId);
                            for(let i = 0; i < orders.length; i++) {
                                expect(orders[i]).to.have.property('status', 'initialized');
                                cy.log(orders[i].id + " is Okay");
                            }
                        } else {
                            cy.log('No orders found');
                        }
                    });
                });

                it('Should get the details and should throw error 200', () => {
                    if(!orderId) {
                        cy.log('No orders found');
                        return;
                    }else{
                        getOrderDetails(orderId, userToken).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', orderSuccessMessages.orderMetaData);
                            expect(response.body.data).to.have.property('id', orderId);
                        });
                    }
                });

            });

        });

    });

});