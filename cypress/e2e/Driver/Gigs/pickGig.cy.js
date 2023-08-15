/// reference types="Cypress" />

const jwt = require('jsonwebtoken');

import { createBidding, getAllGigs, getGigDetails, pickGig } from "../../../api/Driver_APIs/driver.api";
import { acceptOrderByVendor, createOrder } from "../../../api/Order_APIs/handleOrder.api";
import { createOrderData, orderAccessEmails } from "../../../api/Order_APIs/order.data";
import { commonSuccessMessages, driverSuccessMessages, orderSuccessMessages, userSuccessMessages, vendorSuccessMessages } from "../../../message/successfulMessage";
import { commonError, driverErrorMessages } from "../../../message/errorMessage";
import { orderApiOptions, pageOptions } from "../../../constants/apiOptions.constants";
import { login, switchRole } from "../../../api/Auth_APIs/handleAuth.api";
import { getAllBranchesOfVendor, getAllOfferingsOfBranch } from "../../../api/Vendor_APIs/handleVendor.api";
import { acceptBid, viewBiddings } from "../../../api/User_APIs/handleUser.api";

let userToken, vendorToken, branchId, offeringId, serviceId , orderId, gigId, driverToken, selfPickup, role;
let gigType, randomBidOption, randomBidId, driverId;
const drivers = [];

describe('Driver Pick GIG API Testing', () => {

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

        describe('User is an approved Driver and tries to pick up a GIG', () => {

            describe("when user switches to driver role", () => {
                
                let mainUserToken, driver1Token, driver2Token, driver1Id, driver2Id;

                before(() => {
                    login(orderAccessEmails.onlyCustomerEmail, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                        expect(response.body.data).to.have.property('token');
                        mainUserToken = response.body.data.token;
                    });
                });

                it('should create order successfully', () => {
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
                                driver1Token = response.body.data.token;
                                const decodedToken = jwt.decode(driver1Token);

                                driver1Id = decodedToken.driver_id;
                                cy.log("Driver ID:" + driver1Id);

                                drivers.push({
                                    driver_id: driver1Id,
                                    driver_token: driver1Token
                                })

                                cy.log("Drivers Array: " + JSON.stringify(drivers));

                            });
                        }else{
                            cy.log('Self Pickup is true, so no need to switch to driver role')
                        }
                    });
        
                    it('should get all the gigs', () => {
                        if(selfPickup === false){
                            getAllGigs(driver1Token, pageOptions.PAGE, pageOptions.LIMIT).then((response) => {
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
                            getGigDetails(driver1Token, gigId).then((response) => {
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
                            createBidding(driver1Token, gigId, randomBidOption).then((response) => {
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
                                driver2Token = response.body.data.token;
                                const decodedToken = jwt.decode(driver2Token);

                                driver2Id = decodedToken.driver_id;
                                cy.log("Driver ID:" + driver2Id);

                                drivers.push({
                                    driver_id: driver2Id,
                                    driver_token: driver2Token
                                })

                                cy.log("Drivers Array: " + drivers);
                            });
                        }else{
                            cy.log('Self Pickup is true, so no need to switch to driver role')
                        }
                    });
        
                    it('should get gig details', () => {
                        if(selfPickup === false){
                            getGigDetails(driver2Token, gigId).then((response) => {
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
                            createBidding(driver2Token, gigId, randomBidOption).then((response) => {
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

                describe('Driver picks the order from the User', () => {

                    it('should pick the gig', () => {
                        if(selfPickup === false){
                            const selectedDriver = drivers.find((driver) => driver.driver_id === driverId);
                            if (selectedDriver) {
                                // Pick the gig for the selected driver using the corresponding driver_token
                                pickGig(selectedDriver.driver_token, gigId).then((response) => {
                                    expect(response.status).to.eq(200);
                                    expect(response.body).to.have.property('message', `${driverSuccessMessages.gigPicked}`);
                                });
                            } 
                        }else{
                            cy.log('Self Pickup is true, so no need to pick the gig')
                        }
                    });

                });

            });

            describe('When user does not switch to driver role', () => {

                it('should throw error on trying to pick the gig by user role', () => {
                    role = 'user';
                    pickGig(userToken, gigId).then((response) => {
                        expect(response.status).to.eq(403);
                        expect(response.body).to.have.property('message', `${commonError.forbidden} ${role} mode.`);
                    });
                });

            });

            describe('When user switches to vendor role', () => {

                it('should throw error on trying to pick the gig by vendor role', () => {
                    role = 'vendor';
                    pickGig(vendorToken, gigId).then((response) => {
                        expect(response.status).to.eq(403);
                        expect(response.body).to.have.property('message', `${commonError.forbidden} ${role} mode.`);
                    });
                });

            });

            describe('When user tries to re-pick the already picked gig', () => {

                it('should throw error on trying to re-pick the gig', () => {
                    if(selfPickup === false){
                        const selectedDriver = drivers.find((driver) => driver.driver_id == driverId);
                            if (selectedDriver) {
                                // Pick the gig for the selected driver using the corresponding driver_token
                                pickGig(selectedDriver.driver_token, gigId).then((response) => {
                                    expect(response.status).to.eq(400);
                                    expect(response.body).to.have.property('message', `${driverErrorMessages.noGigFound}`);
                                });
                            } 
                    }else{
                        cy.log('Self Pickup is true, so no need to pick the gig')
                    }
                });

            });

            describe('When another driver tries to accept the gig that was already accepted by another driver', () => {

                it('should login with another driver email', () => {
                    if(selfPickup === false){
                        login(orderAccessEmails.aprrovedDriverEmail3, Cypress.env('password'), 'email').then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                            expect(response.body.data).to.have.property('token');
                            userToken = response.body.data.token;
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to login with another driver email')
                    }
                });

                it('should switch to driver role', () => {
                    role = 'driver';
                    if(selfPickup === false){
                        switchRole(role, userToken).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message',   `${commonSuccessMessages.switchedTo} ${role}`);
                            expect(response.body.data).to.have.property('token');
                            driverToken = response.body.data.token;
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to switch to driver role');
                    }
                });

                it('should throw on trying to pick the already picked gig', () => {
                    if(selfPickup === false){
                        pickGig(driverToken, gigId).then((response) => {
                            expect(response.status).to.eq(403);
                            expect(response.body).to.have.property('message', `${driverErrorMessages.notAssignedGig}`)
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to pick the gig');
                    }
                });

            });

            describe('When user tries to pick the gig without accepting it', () => {

                before(() => {
                    login(orderAccessEmails.onlyCustomerEmail, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;
                    });
                });

                it('should create order successfully', () => {
                    const createOrderNewData = {...createOrderData, branch_id: branchId, service_id: serviceId, offering_id: offeringId, 
                        pickup_time: "2022-06-30 01:05:00.099",
                        dropoff_time: "2022-07-01 01:05:00.099"};
                    createOrder(createOrderNewData, userToken).then((response) => {
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

                // Now, the driver is trying to pick the gig without accepting it
                it('should throw on trying to pick the gig without accepting it', () => {
                    if(selfPickup === false){
                        pickGig(driverToken, gigId).then((response) => {
                            expect(response.status).to.eq(403);
                            expect(response.body).to.have.property('message', `${driverErrorMessages.notAssignedGig}`);
                        });
                    }else{
                        cy.log('Self Pickup is true, so no need to pick the gig');
                    }
                });

            });

        });

    });

    describe('Without Login', () => {
        it('should throw on trying to pick the gig without login', () => {
            if(selfPickup === false){
                pickGig('', gigId).then((response) => {
                    expect(response.status).to.eq(401);
                    expect(response.body).to.have.property('message', `${commonError.unauthorized}`);
                });
            }else{
                cy.log('Self Pickup is true, so no need to pick the gig');
            }
        });
    
    });

});