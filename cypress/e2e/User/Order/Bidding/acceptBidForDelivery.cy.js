/// <reference types="Cypress" />

import { login, switchRole } from "../../../../api/Auth_APIs/handleAuth.api";
import { createBidding, getAllGigs, getGigDetails, pickGig } from "../../../../api/Driver_APIs/driver.api";
import { acceptOrderByVendor, createOrder, vendorFinishServicing, vendorStartServicing } from "../../../../api/Order_APIs/handleOrder.api";
import { createOrderData, orderAccessEmails } from "../../../../api/Order_APIs/order.data";
import { acceptBid, viewBiddings } from "../../../../api/User_APIs/handleUser.api";
import { getAllBranchesOfVendor, getAllOfferingsOfBranch, getOrders } from "../../../../api/Vendor_APIs/handleVendor.api";
import { orderApiOptions, pageOptions } from "../../../../constants/apiOptions.constants";
import { commonError, orderErrorMessages } from "../../../../message/errorMessage";
import { commonSuccessMessages, driverSuccessMessages, orderSuccessMessages, userSuccessMessages, vendorSuccessMessages } from "../../../../message/successfulMessage";

let mainUserToken, userToken, vendorToken, driverToken, role, branchId, serviceId, offeringId, orderId, gigId;
let gigType, randomBidOption, selfPickup, selfDelivery, biddingId, randomBidId;

describe('Create Bidding For Delivery API Testing', () => {

    describe('GET BranchId, ServiceId, OfferingId', () => {

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
                cy.log('Service ID: ' + serviceId);
                const randomOffering = offerings[randomIndex];
                offeringId = randomOffering.id;
                cy.log('Offering ID: ' + offeringId);
            });
        });

    });

    describe('After Login', () => {

        describe("User is an approved Driver", () => {

            describe("Tries to create Bidding to deliver the order at user's house", () => {

                before(() => {
                    login(orderAccessEmails.approvedDriverEmail, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                        expect(response.body.data).to.have.property('token');
                        mainUserToken = response.body.data.token;
                    });
                });

                it('should create order successfully', () => {
                    const x = {...createOrderData, branch_id: branchId, service_id: serviceId, offering_id: offeringId, 
                        pickup_time: "2022-06-30 01:05:00.099",
                        dropoff_time: "2022-07-01 01:05:00.099"
                    };
                    createOrder(x, mainUserToken).then((response) => {
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
                        expect(response.body.data.order[0]).to.have.property('status', 'accepted');
                        cy.log('Order Status: ' + response.body.data.order[0].status);
                        selfPickup = response.body.data.order[0].is_self_pickup;
                        selfDelivery = response.body.data.order[0].is_self_delivery;
                        cy.log('Self Pickup: ' + selfPickup);
                        cy.log('Self Delivery: ' + selfDelivery);
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

                    if(selfPickup === false){
                        role = 'driver'
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
                                    cy.log('Gig Type: ' + gigs[i].gig_type);
                                    gigType = gigs[i].gig_type;
                                    break;
                                }
                            }
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to get all the gigs')
                    }
                });

                it('should get gig details', () => {
                    if(selfPickup === false){
                        getGigDetails(driverToken, gigId).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${driverSuccessMessages.gigsRetrieved}`);
                            expect(response.body.data).to.have.property('gig');
                            expect(response.body.data.gig).to.be.an('object');
                            expect(response.body.data.gig).to.have.property('gig_id', gigId);
                            const gigBiddingOptions = response.body.data.gig.bidding_options;
                            randomBidOption = gigBiddingOptions[Math.floor(Math.random() * gigBiddingOptions.length)];
                            cy.log("Bid Option" + randomBidOption);
        
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to get gig details')
                    }
                });

                it('should create bidding successfully', () => {
                    if(selfPickup === false){
                        createBidding(driverToken, gigId, randomBidOption).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${driverSuccessMessages.bidPlaced}`);
                            expect(response.body.data).to.have.property('bidding');
                            expect(response.body.data.bidding).to.have.property('id');
                            expect(response.body.data.bidding).to.have.property('gig_id', gigId);
                            expect(response.body.data.bidding).to.have.property('ask_price', randomBidOption);
                            expect(response.body.data.bidding).to.have.property('status', orderApiOptions.PLACED);
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to create bidding')
                    }
                });

                it('should view the list of biddings by the user', () => {
                    if(selfPickup === false){
                        viewBiddings(orderId, gigType, pageOptions.PAGE, pageOptions.LIMIT, mainUserToken).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${userSuccessMessages.biddingRetrieved}`)
                            const bids = response.body.data.biddings;
                            randomBidId = bids[Math.floor(Math.random() * bids.length)].id;
                            cy.log("Bid ID: " + randomBidId);
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to get bidding details')
                    }
                });

                it('should accept a bid successfully', ()=> {
                    if(selfPickup === false){
                        acceptBid(orderId, randomBidId, gigType, mainUserToken).then((response) => {
                            cy.log(orderId);
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${userSuccessMessages.bidAccepted}`);
                        });
                    }
                });

                it('should pick the gig', () => {
                    if(selfPickup === false){
                        pickGig(driverToken, gigId).then((response) => {
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
                    vendorStartServicing(orderId, vendorToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${orderSuccessMessages.isNow} in servicing.`);
                    });
                });

                it('should finish the servicing by the vendor', () => {
                    vendorFinishServicing(orderId, vendorToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${orderSuccessMessages.isNow} ready..`);
                    });
                });

                describe("Driver 1 makes a bid", () => {

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
                        role = 'driver';
                        if(selfDelivery === false){
                            switchRole(role, userToken).then((response) => {
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
                                    if(gigs[i].order_id === orderId) {
                                        gigId = gigs[i].gig_id;
                                        cy.log('Gig ID: ' + gigId);
                                        cy.log('Gig Type: ' + gigs[i].gig_type);
                                        gigType = gigs[i].gig_type;
                                        break;
                                    }
                                }
                            });
                        }else{
                            cy.log('Self Delivery is true, so no need to get all the gigs')
                        }
                    });

                    it('should get gig details', () => {
                        if(selfDelivery === false){
                            getGigDetails(driverToken, gigId).then((response) => {
                                expect(response.status).to.eq(200);
                                expect(response.body).to.have.property('message', `${driverSuccessMessages.gigsRetrieved}`);
                                expect(response.body.data).to.have.property('gig');
                                expect(response.body.data.gig).to.be.an('object');
                                expect(response.body.data.gig).to.have.property('gig_id', gigId);
                                const gigBiddingOptions = response.body.data.gig.bidding_options;
                                randomBidOption = gigBiddingOptions[Math.floor(Math.random() * gigBiddingOptions.length)];
                                cy.log("Bid Option" + randomBidOption);
        
                            });
                        }else{
                            cy.log('Self Delivery is true, so no need to get gig details')
                        }
                    });

                    it('should create bidding successfully', () => {
                        if(selfDelivery === false){
                            createBidding(driverToken, gigId, randomBidOption).then((response) => {
                                expect(response.status).to.eq(200);
                                expect(response.body).to.have.property('message', `${driverSuccessMessages.bidPlaced}`);
                                expect(response.body.data).to.have.property('bidding');
                                expect(response.body.data.bidding).to.have.property('id');
                                expect(response.body.data.bidding).to.have.property('gig_id', gigId);
                                expect(response.body.data.bidding).to.have.property('ask_price', randomBidOption);
                                expect(response.body.data.bidding).to.have.property('status', orderApiOptions.PLACED);
                                biddingId = response.body.data.bidding.id;
                                cy.log('Bidding ID: ' + biddingId);
                            });
                        }else{
                            cy.log('Self Delivery is true, so no need to create bidding')
                        }
                    });   
                    
                });

                describe('Driver 2 makes a bid', () => {

                    it('should login with the driver email', () => {
                        if(selfDelivery === false){
                            login(orderAccessEmails.approvedDriverEmail2, Cypress.env('password'), 'email').then((response) => {
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
                        role = 'driver';
                        if(selfDelivery === false){
                            switchRole(role, userToken).then((response) => {
                                expect(response.status).to.eq(200);
                                expect(response.body).to.have.property('message', `${commonSuccessMessages.switchedTo} ${role}`);
                                expect(response.body.data).to.have.property('token');
                                driverToken = response.body.data.token;
                            });
                        }else{
                            cy.log('Self Delivery is true, so no need to switch to driver role')
                        }
                    });

                    it('should create bidding successfully', () => {
                        if(selfDelivery === false){
                            createBidding(driverToken, gigId, randomBidOption).then((response) => {
                                expect(response.status).to.eq(200);
                                expect(response.body).to.have.property('message', `${driverSuccessMessages.bidPlaced}`);
                                expect(response.body.data).to.have.property('bidding');
                                expect(response.body.data.bidding).to.have.property('id');
                                expect(response.body.data.bidding).to.have.property('gig_id', gigId);
                                expect(response.body.data.bidding).to.have.property('ask_price', randomBidOption);
                                expect(response.body.data.bidding).to.have.property('status', orderApiOptions.PLACED);
                                biddingId = response.body.data.bidding.id;
                                cy.log('Bidding ID: ' + biddingId);
                            });
                        }else{
                            cy.log('Self Delivery is true, so no need to create bidding')
                        }
                    });

                });

                describe('User views the list of biddings and accept one of them', () => {

                    it('should view the list of biddings by the user', () => {
                        if(selfPickup === false){
                            viewBiddings(orderId, gigType, pageOptions.PAGE, pageOptions.LIMIT, mainUserToken).then((response) => {
                                expect(response.status).to.eq(200);
                                expect(response.body).to.have.property('message', `${userSuccessMessages.biddingRetrieved}`)
                                const bids = response.body.data.biddings;
                                randomBidId = bids[Math.floor(Math.random() * bids.length)].id;
                                cy.log("Bid ID: " + randomBidId)
                            });
                        }else{
                            cy.log('Self Pickup is true, so no need to get bidding details')
                        }
                    });
        
                    it('should accept a bid successfully', ()=> {
                        if(selfPickup === false){
                            acceptBid(orderId, randomBidId, gigType, mainUserToken).then((response) => {
                                cy.log(orderId);
                                expect(response.status).to.eq(200);
                                expect(response.body).to.have.property('message', `${userSuccessMessages.bidAccepted}`);
                            });
                        }
                    });

                });
            });

            describe("User tries to accept the bid again that is already accepted", () => {
                    
                it('should throw error on trying to accept a bid', () => {
                    if(selfDelivery === false){
                        acceptBid(orderId, randomBidId, gigType, mainUserToken).then((response) => {
                            expect(response.status).to.eq(400);
                            expect(response.body).to.have.property('message', `${orderErrorMessages.cantAcceptBid}`);
                        });
                    }else{
                        cy.log('Self Delivery is true, so no need to accept the bid again that is already accepted')
                    }
                });
    
            });

        });

        describe("Vendor tries to accept the gig", () => {

            it('should throw error on trying to accept a Gig', () => {
                role = 'vendor';
                if(selfDelivery === false){
                    acceptBid(orderId, randomBidId, gigType, vendorToken).then((response) => {
                        expect(response.status).to.eq(403);
                        expect(response.body).to.have.property('message', `${commonError.forbidden} ${role} mode.`);
                    });
                }else{
                    cy.log('Self Delivery is true, so no need to create bidding')
                }
            });

        });

        describe("Driver tries to create a gig", () => {

            it('should throw error on trying to create a Gig', () => {
                role = 'driver';
                if(selfDelivery === false){
                    acceptBid(orderId, randomBidId, gigType, driverToken).then((response) => {
                        expect(response.status).to.eq(403);
                        expect(response.body).to.have.property('message', `${commonError.forbidden} ${role} mode.`);
                    });
                }else{
                    cy.log('Self Delivery is true, so no need to create bidding')
                }
            });

        });

    });

    describe('Without Login', () => {

        it('should throw error on trying to create a Bid', () => {
            acceptBid(orderId, randomBidId, gigType, '').then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', `${commonError.unauthorized}`);
            });
        });

    });

});