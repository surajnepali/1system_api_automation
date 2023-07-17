/// <reference types="Cypress" />

import { acceptGig, getAllGigs } from "../../../api/Driver_APIs/driver.api";
import { createOrderData, orderAccessEmails } from "../../../api/Order_APIs/order.data";
import { commonSuccessMessages, driverSuccessMessages, orderSuccessMessages, vendorSuccessMessages } from "../../../message/successfulMessage";
import { commonError, driverErrorMessages } from "../../../message/errorMessage";
import { acceptOrderByVendor, createOrder } from "../../../api/Order_APIs/handleOrder.api";
import { pageOptions } from "../../../constants/apiOptions.constants";
import { login, switchRole } from "../../../api/Auth_APIs/handleAuth.api";
import { getAllBranchesOfVendor, getAllOfferingsOfBranch } from "../../../api/Vendor_APIs/handleVendor.api";

let userToken, driverToken, vendorToken;
let gigId, branchId, offeringId, serviceId, orderId, selfPickup, role;

describe('Driver Accepts GIG API Testing', () => {

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
                cy.log(serviceId);
                const randomOffering = offerings[randomIndex];
                offeringId = randomOffering.id;
                cy.log('Offering ID: ' + offeringId);
            });
        });
    });

    describe('With Login', () => {

        describe('User is an approved Driver and tries to accept a gig', () => {

            describe('When user switches to driver role', () => {

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
                        pickup_time: "2022-06-30 01:05:00.099",
                        dropoff_time: "2022-07-01 01:05:00.099"};
                    createOrder(x, userToken).then((response) => {
                        expect(response.status).to.eq(201);
                        expect(response.body).to.have.property('message', `${orderSuccessMessages.successful}created`);
                        expect(response.body.data).to.have.property('order');
                        expect(response.body.data.order).to.have.property('id');
                        expect(response.body.data.order).to.have.property('branch_id', branchId);
                        expect(response.body.data.order).to.have.property('service_id', serviceId);
                        expect(response.body.data.order).to.have.property('offering_id', offeringId);
                        orderId = response.body.data.order.id;
                        expect(response.body.data.order).to.have.property('status', 'initialized');
                        cy.log('Order Status: ', response.body.data.order.status)
                    });
                });

                it('Vendor should accept the order', () => {
                    acceptOrderByVendor(orderId, vendorToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${orderSuccessMessages.successful}accepted`);
                        expect(response.body.data.order[0]).to.have.property('status', 'accepted');
                        cy.log('Order Status: ', response.body.data.order[0].status);
                        selfPickup = response.body.data.order[0].is_self_pickup;
                        cy.log('Self Pickup: ', selfPickup);
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
                    role = 'driver';
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
                            expect(response.body).to.have.property('message', `${driverSuccessMessages.gigAccepted}`);
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to accept the gig')
                    }
                });

            });

            describe('When user does not switch to driver role', () => {

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
                        pickup_time: "2022-06-30 01:05:00.099",
                        dropoff_time: "2022-07-01 01:05:00.099"};
                    createOrder(x, userToken).then((response) => {
                        expect(response.status).to.eq(201);
                        expect(response.body).to.have.property('message', `${orderSuccessMessages.successful}created`);
                        expect(response.body.data).to.have.property('order');
                        expect(response.body.data.order).to.have.property('id');
                        expect(response.body.data.order).to.have.property('branch_id', branchId);
                        expect(response.body.data.order).to.have.property('service_id', serviceId);
                        expect(response.body.data.order).to.have.property('offering_id', offeringId);
                        orderId = response.body.data.order.id;
                        expect(response.body.data.order).to.have.property('status', 'initialized');
                        cy.log('Order Status: ', response.body.data.order.status)
                    });
                });

                it('should throw error on trying to accept the gig', () => {
                    if(selfPickup === false){
                        acceptGig(userToken, gigId).then((response) => {
                            expect(response.status).to.eq(403);
                            expect(response.body).to.have.property('message', `${commonError.forbidden} user mode.`);
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to accept the gig')
                    }
                });

            });

            describe('When driver tries to re-accept the accepted gig', () => {

                it('Vendor should accept the order', () => {
                    acceptOrderByVendor(orderId, vendorToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${orderSuccessMessages.successful}accepted`);
                        expect(response.body.data.order[0]).to.have.property('status', 'accepted');
                        cy.log('Order Status: ', response.body.data.order[0].status)
                        selfPickup = response.body.data.order[0].is_self_pickup;
                        cy.log('Self Pickup: ', selfPickup);
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
                    role = 'driver'
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
                            expect(response.body).to.have.property('message', `${driverSuccessMessages.gigAccepted}`);
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to accept the gig')
                    }
                });

                it('should throw error on trying to re-accept the accepted gig', () => {
                    if(selfPickup === false){
                        acceptGig(driverToken, gigId).then((response) => {
                            expect(response.status).to.eq(400);
                            expect(response.body).to.have.property('message', `${driverErrorMessages.noOrderFound}`);
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to accept the gig')
                    }
                });

            });

            describe('User tries to accept the gig that is already accepted by another driver', () => {

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
                        pickup_time: "2022-06-30 01:05:00.099",
                        dropoff_time: "2022-07-01 01:05:00.099"};
                    createOrder(x, userToken).then((response) => {
                        expect(response.status).to.eq(201);
                        expect(response.body).to.have.property('message', `${orderSuccessMessages.successful}created`);
                        expect(response.body.data).to.have.property('order');
                        expect(response.body.data.order).to.have.property('id');
                        expect(response.body.data.order).to.have.property('branch_id', branchId);
                        expect(response.body.data.order).to.have.property('service_id', serviceId);
                        expect(response.body.data.order).to.have.property('offering_id', offeringId);
                        orderId = response.body.data.order.id;
                        expect(response.body.data.order).to.have.property('status', 'initialized');
                        cy.log('Order Status: ', response.body.data.order.status)
                    });
                });

                it('Vendor should accept the order', () => {
                    acceptOrderByVendor(orderId, vendorToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${orderSuccessMessages.successful}accepted`);
                        expect(response.body.data.order[0]).to.have.property('status', 'accepted');
                        cy.log('Order Status: ', response.body.data.order[0].status)
                        selfPickup = response.body.data.order[0].is_self_pickup;
                        cy.log('Self Pickup: ', selfPickup);
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
                    role = 'driver';
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
                            expect(response.body).to.have.property('message', `${driverSuccessMessages.gigAccepted}`);
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to accept the gig')
                    }
                });

                it('should login with another driver email', () => {
                    if(selfPickup === false){
                        login(Cypress.env('userWithDriverRoleApproved'), Cypress.env('password'), 'email').then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                            expect(response.body.data).to.have.property('token');
                            userToken = response.body.data.token;
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to accept the gig')
                    }
                });

                it('should switch to driver role', () => {
                    role = 'driver';
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

                it('should throw on trying to accept the gig', () => {
                    if(selfPickup === false){
                    acceptGig(driverToken, gigId).then((response) => {
                        expect(response.status).to.eq(400);
                        expect(response.body).to.have.property('message', `${driverErrorMessages.noOrderFound}`);
                    });
                }else{
                    cy.log('Self Pickup is true, so no need to switch to driver role');
                }
                });
                
            });

        });

        describe('User has not applied for the Driver role and tries to accept a gig', () => {

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
                    pickup_time: "2022-06-30 01:05:00.099",
                    dropoff_time: "2022-07-01 01:05:00.099"};
                createOrder(x, userToken).then((response) => {
                    expect(response.status).to.eq(201);
                    expect(response.body).to.have.property('message', `${orderSuccessMessages.successful}created`);
                    expect(response.body.data).to.have.property('order');
                    expect(response.body.data.order).to.have.property('id');
                    expect(response.body.data.order).to.have.property('branch_id', branchId);
                    expect(response.body.data.order).to.have.property('service_id', serviceId);
                    expect(response.body.data.order).to.have.property('offering_id', offeringId);
                    orderId = response.body.data.order.id;
                    expect(response.body.data.order).to.have.property('status', 'initialized');
                    cy.log('Order Status: ', response.body.data.order.status)
                });
            });

            it('Vendor should accept the order', () => {
                acceptOrderByVendor(orderId, vendorToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${orderSuccessMessages.successful}accepted`);
                    expect(response.body.data.order[0]).to.have.property('status', 'accepted');
                    cy.log('Order Status: ', response.body.data.order[0].status);
                    selfPickup = response.body.data.order[0].is_self_pickup;
                    cy.log('Self Pickup: ', selfPickup);
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
                role = 'driver';
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

            it('should throw error on trying to accept the gig', () => {
                if(selfPickup === false){
                acceptGig(userToken, gigId).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', `${commonError.forbidden} user mode.`);
                });
            }else{
                cy.log('Self Pickup is true, so no need to accept the gig');
            }
            });

        });

        describe('User has applied for the Driver role and tries to accept a gig', () => {

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
                    pickup_time: "2022-06-30 01:05:00.099",
                    dropoff_time: "2022-07-01 01:05:00.099"};
                createOrder(x, userToken).then((response) => {
                    expect(response.status).to.eq(201);
                    expect(response.body).to.have.property('message', `${orderSuccessMessages.successful}created`);
                    expect(response.body.data).to.have.property('order');
                    expect(response.body.data.order).to.have.property('id');
                    expect(response.body.data.order).to.have.property('branch_id', branchId);
                    expect(response.body.data.order).to.have.property('service_id', serviceId);
                    expect(response.body.data.order).to.have.property('offering_id', offeringId);
                    orderId = response.body.data.order.id;
                    expect(response.body.data.order).to.have.property('status', 'initialized');
                    cy.log('Order Status: ', response.body.data.order.status);
                });
            });

            it('Vendor should accept the order', () => {
                acceptOrderByVendor(orderId, vendorToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${orderSuccessMessages.successful}accepted`);
                    expect(response.body.data.order[0]).to.have.property('status', 'accepted');
                    cy.log('Order Status: ', response.body.data.order[0].status);
                    selfPickup = response.body.data.order[0].is_self_pickup;
                    cy.log('Self Pickup: ', selfPickup);
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
                role = 'driver'
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

            it('should throw error on trying to accept the gig', () => {
                if(selfPickup === false){
                    acceptGig(userToken, gigId).then((response) => {
                        expect(response.status).to.eq(403);
                        expect(response.body).to.have.property('message', `${commonError.forbidden} user mode.`);
                    });
                }else{
                    cy.log('Self Pickup is true, so no need to accept the gig');
                }
            });

        });

    });

    describe('Without Login', () => {
        it('should throw error on trying to accept the gig', () => {
            acceptGig('', gigId).then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', `${commonError.unauthorized}`);
            });
        });
    });

});