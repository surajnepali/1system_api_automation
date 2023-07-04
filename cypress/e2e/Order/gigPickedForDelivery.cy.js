/// <reference types="cypress" />

import { acceptGig, getAllGigs, pickGig } from "../../api/Driver_APIs/driver.api";
import { acceptOrderByVendor, createOrder, vendorFinishServicing, vendorStartServicing } from "../../api/Order_APIs/handleOrder.api";
import { createOrderData, orderAccessEmails } from "../../api/Order_APIs/order.data";
import { getAllOfferingsOfBranch } from "../../api/Vendor_APIs/branchOffering.api";
import getAllBranchesOfVendorApi from "../../api/Vendor_APIs/getAllBranchesOfVendor.api";
import { getOrders } from "../../api/Vendor_APIs/getOrders.api";
import loginApi from "../../api/login.api";
import switchRoleApi from "../../api/switchRole.api";
import { orderApiOptions, orderDataAndTime, pageOptions } from "../../constants/apiOptions.constants";
import { driverErrorMessages } from "../../message/Error/Driver/driverErrorMessages";
import { driverSuccessMessages } from "../../message/Successful/Driver/driverSuccessMessages";
import { orderSuccessMessages } from "../../message/Successful/Order/orderSuccessMessages";
import { vendorSuccessMessages } from "../../message/Successful/Vendor/vendorSuccessMessage";
import SUCCESSFUL from "../../message/successfulMessage";

let userToken, vendorToken, driverToken, branchId, serviceId, offeringId, orderId, pickupGigId, deliveryGigId;
let selfPickup, selfDelivery;

describe('Gig Picked For Delivery API Testing', () => {

    describe('GET branchId, ServiceId, OfferingId', () => {

        before(() => {
            loginApi.loginUser(orderAccessEmails.approvedVendorEmail, Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                expect(response.body.data).to.have.property('token');
                userToken = response.body.data.token;
            });
        });

        it('should switch to vendor role', () => {
            switchRoleApi.switchRole('vendor', userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', vendorSuccessMessages.switchedToVendor);
                expect(response.body.data).to.have.property('token');
                vendorToken = response.body.data.token;
            });
        });

        it('should get all the branches of the vendor', () => {
            getAllBranchesOfVendorApi.getAllBranchesOfVendor(vendorToken).then((response) => {
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
                cy.log('Service ID: ' + serviceId);
                const randomOffering = offerings[randomIndex];
                offeringId = randomOffering.id;
                cy.log('Offering ID: ' + offeringId);
            });
        });

    });

    describe('After Login', () => {

        describe('User is an approved Driver and tries to make the order picked from the vendor', () => {

            describe('When user switches to driver role', () => {
                
                before(() => {
                    loginApi.loginUser(orderAccessEmails.onlyCustomerEmail, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;
                    });
                });

                it('should create order successfully', () => {
                    const x = {...createOrderData, branch_id: branchId, service_id: serviceId, offering_id: offeringId, 
                        pickup_time: "2023-06-30 01:05:00.099",
                        dropoff_time: orderDataAndTime.YESTERDAY};
                        const now = new Date();
                        const yesterday = new Date(now - 86400000);
                        const tomorrow = new Date(now + 86400000);
                        console.log('Yesterday: ', yesterday);
                    createOrder(x, userToken).then((response) => {
                        expect(response.status).to.eq(201);
                        expect(response.body).to.have.property('message', orderSuccessMessages.orderCreatedSuccessfully);
                        expect(response.body.data).to.have.property('order');
                        expect(response.body.data.order).to.have.property('id');
                        expect(response.body.data.order).to.have.property('branch_id', branchId);
                        expect(response.body.data.order).to.have.property('service_id', serviceId);
                        expect(response.body.data.order).to.have.property('offering_id', offeringId);
                        orderId = response.body.data.order.id;
                        expect(response.body.data.order).to.have.property('status', orderApiOptions.INITIALIZED);
                        cy.log('Order Status: ', response.body.data.order.status)
                    });
                });

                it('Vendor should accept the order', () => {
                    acceptOrderByVendor(orderId, vendorToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', orderSuccessMessages.orderAcceptedByVendor);
                        expect(response.body.data.order[0]).to.have.property('status', orderApiOptions.ACCEPTED);
                        cy.log('Order Status: ', response.body.data.order[0].status)
                        selfPickup = response.body.data.order[0].is_self_pickup;
                        selfDelivery = response.body.data.order[0].is_self_delivery;
                        cy.log('Self Pickup: ', selfPickup);
                        cy.log('Self Delivery: ', selfDelivery);
                    });
                });

                it('should login with the driver email', () => {
                    
                    if(selfPickup === false){
                        loginApi.loginUser(orderAccessEmails.approvedDriverEmail, Cypress.env('password'), 'email').then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                            expect(response.body.data).to.have.property('token');
                            userToken = response.body.data.token;
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to login with driver email')
                    }
                });

                it('should switch to driver role', () => {

                    if(selfPickup === false){
                        switchRoleApi.switchRole('driver', userToken).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', driverSuccessMessages.roleSwitched);
                            expect(response.body.data).to.have.property('token');
                            driverToken = response.body.data.token;
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to switch to driver role')
                    }
                });

                it('should get all the gigs', () => {

                    if(selfPickup === false){
                        getAllGigs(driverToken, pageOptions.PAGE, pageOptions.LIMIT).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', driverSuccessMessages.gigsRetrieved);
                            expect(response.body.data).to.have.property('gigs');
                            expect(response.body.data.gigs).to.be.an('array');
                            const gigs = response.body.data.gigs;
                            for(let i = 0; i < gigs.length; i++) {
                                if(gigs[i].order_id === orderId && gigs[i].gig_type === 'pickup') {
                                    pickupGigId = gigs[i].gig_id;
                                    cy.log('Gig ID: ' + pickupGigId);
                                    cy.log('Gig Status: ' + gigs[i].gig_type);
                                    break;
                                }
                            }
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to get all the gigs')
                    }
                });

                it('should accept the gig', () => {

                    if(selfPickup === false){
                        acceptGig(driverToken, pickupGigId).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', driverSuccessMessages.gigAccepted);
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to accept the gig')
                    }
                });

                it('should pick the gig', () => {
                    if(selfPickup === false){
                        pickGig(driverToken, pickupGigId).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', driverSuccessMessages.gigPicked);
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to pick the gig')
                    }
                });

                it('should get order from the gig', () => {

                    if(selfPickup === false){
                        getOrders(vendorToken, pageOptions.PAGE, pageOptions.LIMIT, orderApiOptions.PICKING, branchId).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', orderSuccessMessages.getOrdersByVendor);
                            expect(response.body.data).to.have.property('orders');
                            const orders = response.body.data.orders;
                            for(let i = 0; i < orders.length; i++) {
                                if(orders[i].id === orderId) {
                                    expect(orders[i]).to.have.property('status', orderApiOptions.PICKEDUP);
                                    cy.log('Order Status: ', orders[i].status);
                                    cy.log('Order ID: ', orders[i].id);
                                    break;
                                }
                            }
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to get order from the gig')
                    }
                });

                it('should start servicing by the vendor', () => {
                    vendorStartServicing(orderId, vendorToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', orderSuccessMessages.isNowServicing);
                    });
                });

                it('should finish the servicing by the vendor', () => {
                    vendorFinishServicing(orderId, vendorToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', orderSuccessMessages.isNowReadyToDeliver);
                    });
                });

                it('should login with the driver email', () => {
                    
                    if(selfDelivery === false){
                        loginApi.loginUser(orderAccessEmails.approvedDriverEmail, Cypress.env('password'), 'email').then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                            expect(response.body.data).to.have.property('token');
                            userToken = response.body.data.token;
                        });
                    }else{
                        cy.log('Self Delivery is true, so no need to login with driver email')
                    }
                });

                it('should switch to driver role', () => {

                    if(selfDelivery === false){
                        switchRoleApi.switchRole('driver', userToken).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', driverSuccessMessages.roleSwitched);
                            expect(response.body.data).to.have.property('token');
                            driverToken = response.body.data.token;
                        });
                    }else{
                        cy.log('Self Delivery is true, so no need to switch to driver role')
                    }
                });

                it('should get all the gigs', () => {

                    if(selfDelivery === false){
                        getAllGigs(driverToken, pageOptions.PAGE, pageOptions.LIMIT).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', driverSuccessMessages.gigsRetrieved);
                            expect(response.body.data).to.have.property('gigs');
                            expect(response.body.data.gigs).to.be.an('array');
                            const gigs = response.body.data.gigs;
                            for(let i = 0; i < gigs.length; i++) {
                                if(gigs[i].order_id === orderId && gigs[i].gig_type === 'delivery') {
                                    deliveryGigId = gigs[i].gig_id;
                                    cy.log('Gig ID: ' + deliveryGigId);
                                    cy.log('Gig Status: ' + gigs[i].gig_type);
                                    break;
                                }
                            }
                        });
                    }else{
                        cy.log('Self Delivery is true, so no need to get all the gigs')
                    }
                });

                it('should accept the gig', () => {

                    if(selfDelivery === false){
                        acceptGig(driverToken, deliveryGigId).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', driverSuccessMessages.gigAccepted);
                        });
                    }else{
                        cy.log('Self Delivery is true, so no need to accept the gig')
                    }
                });

                it('should pick the gig', () => {
                    if(selfDelivery === false){
                        pickGig(driverToken, deliveryGigId).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', driverSuccessMessages.gigPicked);
                        });
                    }else{
                        cy.log('Self Delivery is true, so no need to pick the gig')
                    }
                });

            });

            describe('When driver tries to make the gig accept which is already accepted', () => {

                it('should throw error on trying to pick the gig', () => {
                    if(selfDelivery === false){
                        pickGig(driverToken, deliveryGigId).then((response) => {
                            expect(response.status).to.eq(400);
                            expect(response.body).to.have.property('message', driverErrorMessages.noGigFound);
                        });
                    }else{
                        cy.log('Self Delivery is true, so no need to pick the gig')
                    }
                });

            });

            describe('When user doesnot switch to driver role', () => {

                it('should throw error on trying to pick the gig', () => {
                    if(selfDelivery === false){
                        pickGig(userToken, deliveryGigId).then((response) => {
                            expect(response.status).to.eq(403);
                            expect(response.body).to.have.property('message', driverErrorMessages.forbidden);
                        });
                    }else{
                        cy.log('Self Delivery is true, so no need to pick the gig')
                    }
                });

            });

            describe('When driver tries to pick the gig without accepting the gig', () => {
                before(() => {
                    loginApi.loginUser(orderAccessEmails.onlyCustomerEmail, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;
                    });
                });

                it('should create order successfully', () => {
                    const x = {...createOrderData, branch_id: branchId, service_id: serviceId, offering_id: offeringId, 
                        pickup_time: "2023-06-30 01:05:00.099",
                        dropoff_time: orderDataAndTime.YESTERDAY};
                        console.log('Yesterday: ', yesterday);
                    createOrder(x, userToken).then((response) => {
                        expect(response.status).to.eq(201);
                        expect(response.body).to.have.property('message', orderSuccessMessages.orderCreatedSuccessfully);
                        expect(response.body.data).to.have.property('order');
                        expect(response.body.data.order).to.have.property('id');
                        expect(response.body.data.order).to.have.property('branch_id', branchId);
                        expect(response.body.data.order).to.have.property('service_id', serviceId);
                        expect(response.body.data.order).to.have.property('offering_id', offeringId);
                        orderId = response.body.data.order.id;
                        expect(response.body.data.order).to.have.property('status', orderApiOptions.INITIALIZED);
                        cy.log('Order Status: ', response.body.data.order.status)
                    });
                });

                it('Vendor should accept the order', () => {
                    acceptOrderByVendor(orderId, vendorToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', orderSuccessMessages.orderAcceptedByVendor);
                        expect(response.body.data.order[0]).to.have.property('status', orderApiOptions.ACCEPTED);
                        cy.log('Order Status: ', response.body.data.order[0].status)
                        selfPickup = response.body.data.order[0].is_self_pickup;
                        selfDelivery = response.body.data.order[0].is_self_delivery;
                        cy.log('Self Pickup: ', selfPickup);
                        cy.log('Self Delivery: ', selfDelivery);
                    });
                });

                it('should login with the driver email', () => {
                    
                    if(selfPickup === false){
                        loginApi.loginUser(orderAccessEmails.approvedDriverEmail, Cypress.env('password'), 'email').then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                            expect(response.body.data).to.have.property('token');
                            userToken = response.body.data.token;
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to login with driver email')
                    }
                });

                it('should switch to driver role', () => {

                    if(selfPickup === false){
                        switchRoleApi.switchRole('driver', userToken).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', driverSuccessMessages.roleSwitched);
                            expect(response.body.data).to.have.property('token');
                            driverToken = response.body.data.token;
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to switch to driver role')
                    }
                });

                it('should get all the gigs', () => {

                    if(selfPickup === false){
                        getAllGigs(driverToken, pageOptions.PAGE, pageOptions.LIMIT).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', driverSuccessMessages.gigsRetrieved);
                            expect(response.body.data).to.have.property('gigs');
                            expect(response.body.data.gigs).to.be.an('array');
                            const gigs = response.body.data.gigs;
                            for(let i = 0; i < gigs.length; i++) {
                                if(gigs[i].order_id === orderId && gigs[i].gig_type === 'pickup') {
                                    pickupGigId = gigs[i].gig_id;
                                    cy.log('Gig ID: ' + pickupGigId);
                                    cy.log('Gig Status: ' + gigs[i].gig_type);
                                    break;
                                }
                            }
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to get all the gigs')
                    }
                });

                it('should accept the gig', () => {

                    if(selfPickup === false){
                        acceptGig(driverToken, pickupGigId).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', driverSuccessMessages.gigAccepted);
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to accept the gig')
                    }
                });

                it('should pick the gig', () => {
                    if(selfPickup === false){
                        pickGig(driverToken, pickupGigId).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', driverSuccessMessages.gigPicked);
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to pick the gig')
                    }
                });

                it('should get order from the gig', () => {

                    if(selfPickup === false){
                        getOrders(vendorToken, pageOptions.PAGE, pageOptions.LIMIT, orderApiOptions.PICKING, branchId).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', orderSuccessMessages.getOrdersByVendor);
                            expect(response.body.data).to.have.property('orders');
                            const orders = response.body.data.orders;
                            for(let i = 0; i < orders.length; i++) {
                                if(orders[i].id === orderId) {
                                    expect(orders[i]).to.have.property('status', orderApiOptions.PICKEDUP);
                                    cy.log('Order Status: ', orders[i].status);
                                    cy.log('Order ID: ', orders[i].id);
                                    break;
                                }
                            }
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to get order from the gig')
                    }
                });

                it('should start servicing by the vendor', () => {
                    vendorStartServicing(orderId, vendorToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', orderSuccessMessages.isNowServicing);
                    });
                });

                it('should finish the servicing by the vendor', () => {
                    vendorFinishServicing(orderId, vendorToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', orderSuccessMessages.isNowReadyToDeliver);
                    });
                });

                it('should login with the driver email', () => {
                    
                    if(selfDelivery === false){
                        loginApi.loginUser(orderAccessEmails.approvedDriverEmail, Cypress.env('password'), 'email').then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                            expect(response.body.data).to.have.property('token');
                            userToken = response.body.data.token;
                        });
                    }else{
                        cy.log('Self Delivery is true, so no need to login with driver email')
                    }
                });

                it('should switch to driver role', () => {

                    if(selfDelivery === false){
                        switchRoleApi.switchRole('driver', userToken).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', driverSuccessMessages.roleSwitched);
                            expect(response.body.data).to.have.property('token');
                            driverToken = response.body.data.token;
                        });
                    }else{
                        cy.log('Self Delivery is true, so no need to switch to driver role')
                    }
                });

                it('should get all the gigs', () => {

                    if(selfDelivery === false){
                        getAllGigs(driverToken, pageOptions.PAGE, pageOptions.LIMIT).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', driverSuccessMessages.gigsRetrieved);
                            expect(response.body.data).to.have.property('gigs');
                            expect(response.body.data.gigs).to.be.an('array');
                            const gigs = response.body.data.gigs;
                            for(let i = 0; i < gigs.length; i++) {
                                if(gigs[i].order_id === orderId && gigs[i].gig_type === 'delivery') {
                                    deliveryGigId = gigs[i].gig_id;
                                    cy.log('Gig ID: ' + deliveryGigId);
                                    cy.log('Gig Status: ' + gigs[i].gig_type);
                                    break;
                                }
                            }
                        });
                    }else{
                        cy.log('Self Delivery is true, so no need to get all the gigs')
                    }
                });

                it('should throw an error on trying to pick the gig without accepting', () => {
                    if(selfDelivery === false){
                        pickGig(driverToken, deliveryGigId).then((response) => {
                            expect(response.status).to.eq(403);
                            expect(response.body).to.have.property('message', driverErrorMessages.notAssignedGig);
                        });
                    }else{
                        cy.log('Self Delivery is true, so no need to pick the gig')
                    }
                });
            });

        });

    });

    describe('Without Login', () => {
            
        describe('When user tries to pick the gig', () => {
    
            it('should throw error on trying to pick the gig', () => {
                pickGig(userToken, deliveryGigId).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', driverErrorMessages.forbidden);
                });
            });
    
        });
    
    });

});