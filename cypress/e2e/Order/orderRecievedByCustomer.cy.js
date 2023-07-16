/// <reference types="Cypress" />

import { login, switchRole } from "../../api/Auth_APIs/handleAuth.api";
import { acceptGig, getAllGigs, pickGig } from "../../api/Driver_APIs/driver.api";
import { acceptOrderByVendor, completeOrderProcess, createOrder, vendorFinishServicing, vendorStartServicing } from "../../api/Order_APIs/handleOrder.api";
import { createOrderData, orderAccessEmails } from "../../api/Order_APIs/order.data";
import { getAllBranchesOfVendor, getAllOfferingsOfBranch, getOrders } from "../../api/Vendor_APIs/handleVendor.api";
import { orderApiOptions, orderDataAndTime, pageOptions } from "../../constants/apiOptions.constants";
import { commonError, orderErrorMessages } from "../../message/errorMessage";
import { commonSuccessMessages, driverSuccessMessages, orderSuccessMessages, vendorSuccessMessages } from "../../message/successfulMessage";

let userToken, vendorToken, driverToken, branchId, serviceId, offeringId, orderId, pickupGigId, deliveryGigId;
let selfPickup, selfDelivery;

describe('Order Recieved By Customer API Testing', () => {

    describe('GET branchId, OfferingId, serviceId', () => {

        before(() => {
            login(orderAccessEmails.approvedVendorEmail, Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                expect(response.body.data).to.have.property('token');
                userToken = response.body.data.token;
            });
        });

        it('should switch to vendor role', () => {
            const role = 'vendor';
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
                expect(response.body).to.have.property('message', `${vendorSuccessMessages.allOfferingsOfBranch}`);
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

        describe('User is genuine customer and tries to complete the order by receiving the order from vendor', () => {

            describe('User receives the order from the driver', () => {

                before(() => {
                    login(orderAccessEmails.onlyCustomerEmail, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;
                    });
                });

                it('should create order successfully', () => {
                    const x = {...createOrderData, branch_id: branchId, service_id: serviceId, offering_id: offeringId, 
                        pickup_time: "2023-06-30 01:05:00.099",
                        dropoff_time: orderDataAndTime.YESTERDAY};
                    createOrder(x, userToken).then((response) => {
                        expect(response.status).to.eq(201);
                        expect(response.body).to.have.property('message', `${orderSuccessMessages.successful}created`);
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
                        expect(response.body).to.have.property('message', `${orderSuccessMessages.successful}accepted`);
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
                        login(orderAccessEmails.approvedDriverEmail, Cypress.env('password'), 'email').then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                            expect(response.body.data).to.have.property('token');
                            userToken = response.body.data.token;
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to login with driver email')
                    }
                });

                it('should switch to driver role', () => {
                    const role = 'driver';
                    if(selfPickup === false){
                        switchRole(role, userToken).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${commonSuccessMessages.switchedTo} ${role}`);
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
                            expect(response.body).to.have.property('message', `${driverSuccessMessages.gigsRetrieved}`);
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
                            expect(response.body).to.have.property('message', `${driverSuccessMessages.gigAccepted}`);
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to accept the gig')
                    }
                });

                it('should pick the gig', () => {
                    if(selfPickup === false){
                        pickGig(driverToken, pickupGigId).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${driverSuccessMessages.gigPicked}`);
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to pick the gig')
                    }
                });

                it('should get order from the gig', () => {

                    if(selfPickup === false){
                        getOrders(vendorToken, pageOptions.PAGE, pageOptions.LIMIT, orderApiOptions.PICKING, branchId).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${orderSuccessMessages.getOrdersByVendor}`);
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
                    const servicing = 'servicing';
                    vendorStartServicing(orderId, vendorToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${orderSuccessMessages.isNow} in ${servicing}.`);
                    });
                });

                it('should finish the servicing by the vendor', () => {
                    const ready = 'ready';
                    vendorFinishServicing(orderId, vendorToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${orderSuccessMessages.isNow} ${ready}..`);
                    });
                });

                it('should login with the driver email', () => {
                    
                    if(selfDelivery === false){
                        login(orderAccessEmails.approvedDriverEmail, Cypress.env('password'), 'email').then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                            expect(response.body.data).to.have.property('token');
                            userToken = response.body.data.token;
                        });
                    }else{
                        cy.log('Self Delivery is true, so no need to login with driver email')
                    }
                });

                it('should switch to driver role', () => {
                    const role = 'driver';
                    if(selfDelivery === false){
                        switchRole('driver', userToken).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${commonSuccessMessages.switchedTo} ${role}`);
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
                            expect(response.body).to.have.property('message', `${driverSuccessMessages.gigsRetrieved}`);
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
                            expect(response.body).to.have.property('message', `${driverSuccessMessages.gigAccepted}`);
                        });
                    }else{
                        cy.log('Self Delivery is true, so no need to accept the gig')
                    }
                });

                it('should pick the gig', () => {
                    if(selfDelivery === false){
                        pickGig(driverToken, deliveryGigId).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${driverSuccessMessages.gigPicked}`);
                        });
                    }else{
                        cy.log('Self Delivery is true, so no need to pick the gig')
                    }
                });

                it('should login with user email', () => {
                    login(orderAccessEmails.onlyCustomerEmail, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;
                    });
                });

                it('should complete the order succesfully', () => {
                    const complete = 'completed';
                    completeOrderProcess(orderId, userToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${orderSuccessMessages.isNow} ${complete}.`);
                    });
                });

            });

            describe('When user tries to complete the order which is already completed', () => {

                it('should throw error on trying to re-complete the order', () => {
                    completeOrderProcess(orderId, userToken).then((response) => {
                        expect(response.status).to.eq(400);
                        expect(response.body).to.have.property('message', `${orderErrorMessages.alreadyCompleted}`);
                    });
                });

            });

        });

        // describe('When user tries to complete the order with invalid order id', () => {

        //     it('should throw error on trying to complete the order', () => {
        //         completeOrderProcess(12345, userToken).then((response) => {
        //             expect(response.status).to.eq(400);
        //             expect(response.body).to.have.property('message', orderErrorMessages.invalidOrderId);
        //         });
        //     });


        // });

    });

    describe('Without Login', () => {
            
        describe('When user tries to complete the order', () => {
    
            it('should throw error on trying to complete the order', () => {
                completeOrderProcess(orderId, '').then((response) => {
                    expect(response.status).to.eq(401);
                    expect(response.body).to.have.property('message', `${commonError.unauthorized}`);
                });
            });
        
        });
    
    });

});