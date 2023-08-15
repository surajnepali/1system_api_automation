/// <reference types="cypress" />

import { login, switchRole } from "../../../api/Auth_APIs/handleAuth.api";
import { activeGigs, completedGigs, createBidding, getAllGigs, getBiddings, getGigDetails, pickGig } from "../../../api/Driver_APIs/driver.api";
import { acceptOrderByVendor, createOrder, vendorStartServicing } from "../../../api/Order_APIs/handleOrder.api";
import { createOrderData, orderAccessEmails } from "../../../api/Order_APIs/order.data";
import { acceptBid, viewBiddings } from "../../../api/User_APIs/handleUser.api";
import { getAllBranchesOfVendor, getAllOfferingsOfBranch, getOrders } from "../../../api/Vendor_APIs/handleVendor.api";
import { orderApiOptions, pageOptions } from "../../../constants/apiOptions.constants";
import { commonError } from "../../../message/errorMessage";
import { commonSuccessMessages, driverSuccessMessages, orderSuccessMessages, userSuccessMessages, vendorSuccessMessages } from "../../../message/successfulMessage";

let userToken, mainUserToken, vendorToken, driverToken, role;
let branchId, serviceId, offeringId, orderId, gigId, selfPickup, driverId, gigType;
let randomBidOption, randomBidId;

describe('Active Gigs API Testing', () => {

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

    describe('After Login', () => {

        describe('User is an approved Driver and visits the active gigs', () => {

            describe('When user switched to driver role', () => {

                before(() => {
                    login(orderAccessEmails.approvedDriverEmail, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                        expect(response.body.data).to.have.property('token');
                        mainUserToken = response.body.data.token;
                    });
                });

                it('user should create order successfully', () => {
                    const createOrderNewData = {...createOrderData, branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                    createOrder(createOrderNewData, mainUserToken).then((response) => {
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
                        cy.log('Self Pickup: ', selfPickup);
                    });
                });

                it('user should login with the driver email', () => {
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
    
                it('user should switch to driver role', () => {
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

                it('driver should get all the gigs', () => {
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

                it('in driver role, this gig should not be available in the active section', () => {
                    if(selfPickup === false){
                        activeGigs(pageOptions.PAGE, pageOptions.LIMIT, driverToken).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${driverSuccessMessages.gigsRetrieved}`);
                            expect(response.body.data).to.have.property('gigs');
                            const gigs = response.body.data.gigs;
                            for(let i = 0; i < gigs.length; i++) {
                                expect(gigs[i].gig_id).to.not.eq(gigId);
                            }
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to get all the gigs')
                    }
                });

                it('In driver role, this gig should not be available in the Applied section', () => {
                    if(selfPickup === false){
                        getBiddings(pageOptions.PAGE, pageOptions.LIMIT, driverToken).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${driverSuccessMessages.dataRetrieved}`);
                            expect(response.body.data).to.have.property('biddings');
                            const biddings = response.body.data.biddings;
                            for(let i = 0; i < biddings.length; i++) {
                                expect(biddings[i].gig_id).to.not.eq(gigId);
                            }
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to get all the gigs')
                    }
                });

                it('In driver role, this gig should not be available in the Completed Section', () => {
                    if(selfPickup === false){
                        completedGigs(pageOptions.PAGE, pageOptions.LIMIT, driverToken).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${driverSuccessMessages.gigsRetrieved}`);
                            expect(response.body.data).to.have.property('gigs');
                            const gigs = response.body.data.gigs;
                            for(let i = 0; i < gigs.length; i++) {
                                expect(gigs[i].gig_id).to.not.eq(gigId);
                            }
                        });
                    }
                })

                it('driver should get gig details', () => {
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
    
                it('driver should create bidding successfully', () => {
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

                it('in Driver role, this gig should not be available in the active section', () => {
                    if(selfPickup === false){
                        activeGigs(pageOptions.PAGE, pageOptions.LIMIT, driverToken).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${driverSuccessMessages.gigsRetrieved}`);
                            expect(response.body.data).to.have.property('gigs');
                            const gigs = response.body.data.gigs;
                            for(let i = 0; i < gigs.length; i++) {
                                expect(gigs[i].gig_id).to.not.eq(gigId);
                            }
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to get all the gigs')
                    }
                });

                it('driver should make the gig available in the Applied section', () => {
                    if (!selfPickup) {
                        getBiddings(pageOptions.PAGE, pageOptions.LIMIT, driverToken).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body.message).to.eq(driverSuccessMessages.dataRetrieved);
                            expect(response.body.data).to.have.property('biddings');
                                
                            const biddings = response.body.data.biddings;
                            const foundGig = biddings.find((bid) => bid.gig_id === gigId);
                            cy.log('Found Gig ID: ' + foundGig.gig_id);
                            cy.log('Variable had Gig ID:' + gigId)
                            expect(foundGig).to.exist;
                        })
                    } else {
                        cy.log('Self Pickup is true, so no need to get all the gigs');
                    }
                });

                it('user should view the list of biddings by the user', () => {
                    if(selfPickup === false){
                        viewBiddings(orderId, gigType, pageOptions.PAGE, pageOptions.LIMIT, mainUserToken).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${userSuccessMessages.biddingRetrieved}`)
                            const bids = response.body.data.biddings;
                            randomBidId = bids[Math.floor(Math.random() * bids.length)].id;
                            cy.log("Bid ID: " + randomBidId)

                            const selectedBid = bids.find((bid) => bid.id === randomBidId);
                            if (selectedBid) {
                            driverId = selectedBid.driver.id;
                            cy.log("Driver ID of selected bid: " + driverId);
                            }
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to get bidding details')
                    }
                });
    
                it('user should accept a bid successfully', ()=> {
                    if(selfPickup === false){
                        acceptBid(orderId, randomBidId, gigType, mainUserToken).then((response) => {
                            cy.log(orderId);
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${userSuccessMessages.bidAccepted}`);
                        });
                    }
                });

                it('this gig should be available in the active section', () => {
                    if(selfPickup === false){
                        activeGigs(pageOptions.PAGE, pageOptions.LIMIT, driverToken).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${driverSuccessMessages.gigsRetrieved}`);
                            expect(response.body.data).to.have.property('gigs');
                            const gigs = response.body.data.gigs;
                            const foundGig = gigs.find((gig) => gig.gig_id === gigId);
                            cy.log('Found Gig ID: ' + foundGig.gig_id);
                            cy.log('Variable had Gig ID:' + gigId);
                            expect(foundGig).to.exist;
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to get all the gigs')
                    }
                });

                it('the gig should not be available in the Applied section', () => {
                    if (!selfPickup) {
                        getBiddings(pageOptions.PAGE, pageOptions.LIMIT, driverToken).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body.message).to.eq(driverSuccessMessages.dataRetrieved);
                            expect(response.body.data).to.have.property('biddings');
                                
                            const biddings = response.body.data.biddings;
                            for(let i = 0; i < biddings.length; i++) {
                                expect(biddings[i].gig_id).to.not.eq(gigId);
                            }
                        })
                    }else {
                        cy.log('Self Pickup is true, so no need to get all the gigs');
                    }
                });

                it('In driver role, this gig should not be available in the Completed Section', () => {
                    if(selfPickup === false){
                        completedGigs(pageOptions.PAGE, pageOptions.LIMIT, driverToken).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${driverSuccessMessages.gigsRetrieved}`);
                            expect(response.body.data).to.have.property('gigs');
                            const gigs = response.body.data.gigs;
                            for(let i = 0; i < gigs.length; i++) {
                                expect(gigs[i].gig_id).to.not.eq(gigId);
                            }
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to get all the gigs');
                    }
                });

                it('driver should pick the gig', () => {
                    if(selfPickup === false){
                        pickGig(driverToken, gigId).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${driverSuccessMessages.gigPicked}`);
                        });            
                    }else{
                        cy.log('Self Pickup is true, so no need to pick the gig');
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

                it('In driver role, this gig should be available in the Completed Section', () => {
                    if(selfPickup === false){
                        completedGigs(pageOptions.PAGE, pageOptions.LIMIT, driverToken).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${driverSuccessMessages.gigsRetrieved}`);
                            expect(response.body.data).to.have.property('gigs');
                            const gigs = response.body.data.gigs;
                            const foundGig = gigs.find((gig) => gig.gig_id === gigId);
                            cy.log('Found Gig ID: ' + foundGig.gig_id);
                            cy.log('Variable had Gig ID:' + gigId);
                            expect(foundGig).to.exist;
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to get all the gigs');
                    }
                });

            });

        });

        describe('User tries to access the active gigs without switching to driver role', () => {

            describe('User is in an Customer role', () => {

                it('should throw error on trying to get the active gigs', () => {
                    role = 'user';
                    activeGigs(pageOptions.PAGE, pageOptions.LIMIT, mainUserToken).then((response) => {
                        expect(response.status).to.eq(403);
                        expect(response.body).to.have.property('message', `${commonError.forbidden} ${role} mode.`);
                    });
                });

            });

            describe('User is in an Vendor role', () => {

                it('should throw error on trying to get the active gigs', () => {
                    role = 'vendor';
                    activeGigs(pageOptions.PAGE, pageOptions.LIMIT, vendorToken).then((response) => {
                        expect(response.status).to.eq(403);
                        expect(response.body).to.have.property('message', `${commonError.forbidden} ${role} mode.`);
                    });
                });

            });

        });

    });

    describe('Without Login', () => {
         
        it('should throw error on trying to get the active gigs', () => {
            activeGigs(pageOptions.PAGE, pageOptions.LIMIT, '').then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', `${commonError.unauthorized}`);
            });
        });
    
    });

});