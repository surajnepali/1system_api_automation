/// <reference types="Cypress" />

import { acceptGig, getAllGigs, pickGig } from "../../api/Driver_APIs/driver.api";
import { acceptOrderByVendor, createOrder, vendorFinishServicing, vendorStartServicing } from "../../api/Order_APIs/handleOrder.api";
import { createOrderData, orderAccessEmails } from "../../api/Order_APIs/order.data";
import { orderApiOptions, pageOptions } from "../../constants/apiOptions.constants";
import { orderErrorMessages } from "../../message/Error/Order/orderErrorMessages";
import { driverSuccessMessages } from "../../message/Successful/Driver/driverSuccessMessages";
import { orderSuccessMessages } from "../../message/Successful/Order/orderSuccessMessages";
import { vendorSuccessMessages } from "../../message/Successful/Vendor/vendorSuccessMessage";
import SUCCESSFUL from "../../message/successfulMessage";
import ERROR from "../../message/errorMessage";
import { login, switchRole } from "../../api/Auth_APIs/handleAuth.api";
import { getAllBranchesOfVendor, getAllOfferingsOfBranch, getOrders } from "../../api/Vendor_APIs/handleVendor.api";

let userToken, branchId, serviceId, offeringId, orderId, vendorToken, driverToken, gigId;
let selfPickup;

describe('Serviced Order By Vendor API Testing', () => {

    describe('GET branchId, ServiceId, OfferingId', () => {
        
        before(() => {
            login(orderAccessEmails.approvedVendorEmail, Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                expect(response.body.data).to.have.property('token');
                userToken = response.body.data.token;
            });
        });

        it('should switch to vendor role', () => {
            switchRole('vendor', userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', vendorSuccessMessages.switchedToVendor);
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

        describe('After Login', () => {

            describe('User is an approved Vendor and tries to make the order serviced', () => {

                describe('When user switches to vendor role', () => {
                    before(() => {
                        login(orderAccessEmails.onlyCustomerEmail, Cypress.env('password'), 'email').then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                            expect(response.body.data).to.have.property('token');
                            userToken = response.body.data.token;
                        });
                    });
    
                    it('should create order successfully', () => {
                        const x = {...createOrderData, branch_id: branchId, service_id: serviceId, offering_id: offeringId, 
                            pickup_time: "2022-06-30 01:05:00.099",
                            dropoff_time: "2022-07-01 01:05:00.099"};
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
                            cy.log('Self Pickup: ', selfPickup);
                        });
                    });
    
                    it('should login with the driver email', () => {
                        
                        if(selfPickup === false){
                            login(orderAccessEmails.approvedDriverEmail, Cypress.env('password'), 'email').then((response) => {
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
                            switchRole('driver', userToken).then((response) => {
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
                                    if(gigs[i].order_id === orderId) {
                                        gigId = gigs[i].gig_id;
                                        cy.log('Gig ID: ' + gigId);
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
                            acceptGig(driverToken, gigId).then((response) => {
                                expect(response.status).to.eq(200);
                                expect(response.body).to.have.property('message', driverSuccessMessages.gigAccepted);
                            });
                        }else{
                            cy.log('Self Pickup is true, so no need to accept the gig')
                        }
                    });

                    it('should pick the gig', () => {
                        if(selfPickup === false){
                            pickGig(driverToken, gigId).then((response) => {
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

                });

                describe('When vendor tries to make the order re-serviced after marked it as serviced', () => {

                    it('should re-finish the servicing by the vendor', () => {
                        vendorFinishServicing(orderId, vendorToken).then((response) => {
                            expect(response.status).to.eq(400);
                            expect(response.body).to.have.property('message', orderErrorMessages.cantServiceThisOrder);
                        });
                    });

                });

                describe('When vendor tries to make the order serviced without servicing it', () => {

                    before(() => {
                        login(orderAccessEmails.onlyCustomerEmail, Cypress.env('password'), 'email').then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                            expect(response.body.data).to.have.property('token');
                            userToken = response.body.data.token;
                        });
                    });
    
                    it('should create order successfully', () => {
                        const x = {...createOrderData, branch_id: branchId, service_id: serviceId, offering_id: offeringId, 
                            pickup_time: "2022-06-30 01:05:00.099",
                            dropoff_time: "2022-07-01 01:05:00.099"};
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
                            cy.log('Self Pickup: ', selfPickup);
                        });
                    });
    
                    it('should login with the driver email', () => {
                        
                        if(selfPickup === false){
                            login(orderAccessEmails.approvedDriverEmail, Cypress.env('password'), 'email').then((response) => {
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
                            switchRole('driver', userToken).then((response) => {
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
                                    if(gigs[i].order_id === orderId) {
                                        gigId = gigs[i].gig_id;
                                        cy.log('Gig ID: ' + gigId);
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
                            acceptGig(driverToken, gigId).then((response) => {
                                expect(response.status).to.eq(200);
                                expect(response.body).to.have.property('message', driverSuccessMessages.gigAccepted);
                            });
                        }else{
                            cy.log('Self Pickup is true, so no need to accept the gig')
                        }
                    });

                    it('should pick the gig', () => {
                        if(selfPickup === false){
                            pickGig(driverToken, gigId).then((response) => {
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

                    it('should finish the servicing by the vendor', () => {
                        vendorFinishServicing(orderId, vendorToken).then((response) => {
                            expect(response.status).to.eq(400);
                            expect(response.body).to.have.property('message', orderErrorMessages.cantServiceThisOrder);
                        });
                    });

                });

                describe('Vendor tries to service the order without accepting the order', () => {

                    before(() => {
                        login(orderAccessEmails.onlyCustomerEmail, Cypress.env('password'), 'email').then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                            expect(response.body.data).to.have.property('token');
                            userToken = response.body.data.token;
                        });
                    });
    
                    it('should create order successfully', () => {
                        const x = {...createOrderData, branch_id: branchId, service_id: serviceId, offering_id: offeringId, 
                            pickup_time: "2022-06-30 01:05:00.099",
                            dropoff_time: "2022-07-01 01:05:00.099"};
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

                    it('should finish the servicing by the vendor', () => {
                        vendorFinishServicing(orderId, vendorToken).then((response) => {
                            expect(response.status).to.eq(400);
                            expect(response.body).to.have.property('message', orderErrorMessages.cantServiceThisOrder);
                        });
                    });

                });

            });

        });

        describe('Without Login', () => {
                
                it('should not finish the servicing by the vendor', () => {
                    vendorFinishServicing(orderId, '').then((response) => {
                        expect(response.status).to.eq(401);
                        expect(response.body).to.have.property('message', ERROR.unauthorized);
                    });
                });
    
        });

    });
});