/// <reference types="cypress" />

import { login, switchRole } from "../../../../api/Auth_APIs/handleAuth.api";
import { createBidding, getAllGigs, getGigDetails } from "../../../../api/Driver_APIs/driver.api";
import { acceptOrderByVendor, createOrder } from "../../../../api/Order_APIs/handleOrder.api";
import { createOrderData, orderAccessEmails } from "../../../../api/Order_APIs/order.data";
import { acceptBid, viewBiddings } from "../../../../api/User_APIs/handleUser.api";
import { getAllBranchesOfVendor, getAllOfferingsOfBranch } from "../../../../api/Vendor_APIs/handleVendor.api";
import { orderApiOptions, pageOptions } from "../../../../constants/apiOptions.constants";
import { commonError } from "../../../../message/errorMessage";
import { commonSuccessMessages, driverSuccessMessages, orderSuccessMessages, userSuccessMessages, vendorSuccessMessages } from "../../../../message/successfulMessage";

let userToken, vendorToken, driverToken, role;
let gigId, branchId, orderId, offeringId, serviceId, gigType, selfPickup, randomBidOption, randomBidId;

describe('Accept Bid For Pickup API Testing', () => {

    describe('GET brandId, ServiceId, OfferingId', () => {

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

        describe('User Accepts the a bid available in the Biddings List', () => {

            let driverOneBidID, driverTwoBidID, mainUserToken; 
    
            before(() => {
                login(orderAccessEmails.onlyCustomerEmail, Cypress.env('password'), 'email').then((response) => {
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
                    cy.log('Order Status: ', response.body.data.order[0].status);
                    selfPickup = response.body.data.order[0].is_self_pickup;
                    cy.log('Self Pickup: ', selfPickup);
                });
            });
    
            describe('Driver 1 makes a bid', () => {
    
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
                                    cy.log('Gig Type: ' + gigs[i].gig_type);
                                    gigType = gigs[i].gig_type
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
                            cy.log("Bid Option", randomBidOption);
    
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
                            driverOneBidID = response.body.data.bidding.id;
                            cy.log('Bidding ID: ' + driverOneBidID);
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to create bidding')
                    }
                });
    
            });
    
            describe('Driver 2 makes a bid', () => {
    
                it('should login with the driver email', () => {
                    if(selfPickup === false){
                        login(orderAccessEmails.approvedDriverEmail2, Cypress.env('password'), 'email').then((response) => {
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
                            cy.log("Bid Option", randomBidOption);
    
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
                            driverTwoBidID = response.body.data.bidding.id;
                            cy.log('Bidding ID: ' + driverTwoBidID);
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to create bidding')
                    }
                });
    
            });
    
            describe('User Views ths list of Biddings made for that order', () => {
    
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

        describe('Vendor tries to accept the bid', () => {

            it('should throw error on trying to accept the bid from vendor role', () => {
                role = 'vendor'
                if(selfPickup === false){
                    acceptBid(orderId, randomBidId, gigType, vendorToken).then((response) => {
                        cy.log(orderId);
                        expect(response.status).to.eq(403);
                        expect(response.body).to.have.property('message', `${commonError.forbidden} ${role} mode.`);
                    });
                }
            });

        });

        describe('Vendor tries to accept the bid', () => {

            it('should throw error on trying to accept the bid from vendor role', () => {
                role = 'driver'
                if(selfPickup === false){
                    acceptBid(orderId, randomBidId, gigType, driverToken).then((response) => {
                        cy.log(orderId);
                        expect(response.status).to.eq(403);
                        expect(response.body).to.have.property('message', `${commonError.forbidden} ${role} mode.`);
                    });
                }
            });

        });

    })

    describe('Without Login', () => {

        it('Should throw error on trying to accept the bidding without logging in', () => {
            if(selfPickup === false){
                acceptBid(orderId, randomBidId, gigType, '').then((response) => {
                    cy.log(orderId);
                    expect(response.status).to.eq(401);
                    expect(response.body).to.have.property('message', `${commonError.unauthorized}`);
                });
            }
        });

    });

});