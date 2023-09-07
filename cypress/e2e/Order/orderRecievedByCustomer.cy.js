/// <reference types="Cypress" />

import { login, switchRole } from "../../api/Auth_APIs/handleAuth.api";
import { createBidding, getAllGigs, getGigDetails, orderDroppedbyDriver, pickGig } from "../../api/Driver_APIs/driver.api";
import { driverLocation } from "../../api/Driver_APIs/driver.data";
import { acceptOrderByVendor, completeOrderProcess, createOrder, vendorFinishServicing, vendorStartServicing } from "../../api/Order_APIs/handleOrder.api";
import { createOrderData, orderAccessEmails } from "../../api/Order_APIs/order.data";
import { acceptBid, getOrderDetailsById, viewBiddings } from "../../api/User_APIs/handleUser.api";
import { addOverweight, getAllBranchesOfVendor, getAllOfferingsOfBranch, getOrders } from "../../api/Vendor_APIs/handleVendor.api";
import { overweightData } from "../../api/Vendor_APIs/vendor.data";
import { orderApiOptions, pageOptions } from "../../constants/apiOptions.constants";
import { commonError, orderErrorMessages } from "../../message/errorMessage";
import { commonSuccessMessages, driverSuccessMessages, orderSuccessMessages, userSuccessMessages, vendorSuccessMessages } from "../../message/successfulMessage";

let mainUserToken, userToken, vendorToken, driverToken, branchId, serviceId, offeringId, orderId, gigId;
let selfPickup, selfDelivery, gigType, randomBidOption, randomBidId, biddingId, driverId,role;
let priceOfOffering, estimatedWeight, estimatedPrice;


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
                priceOfOffering = randomOffering.price;
                cy.log('Price of Offering: ' + priceOfOffering)
            });
        });

    });

    describe('After Login', () => {

        describe('User is genuine customer and tries to complete the order by receiving the order from vendor', () => {

            // for(let i = 0; i < 6; i++) {
            describe('User receives the order from the driver', () => {

                before(() => {
                    login(orderAccessEmails.onlyCustomerEmail, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                        expect(response.body.data).to.have.property('token');
                        mainUserToken = response.body.data.token;
                    });
                });

                it('should create order successfully', () => {
                    estimatedWeight = Math.floor(Math.random() * 20) + 1;
                    estimatedPrice = estimatedWeight * priceOfOffering;
                    // const x = {...createOrderData,is_self_delivery:i%2===0, is_self_pickup: i%3===1,branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                    const x = {...createOrderData, branch_id: branchId, service_id: serviceId, offering_id: offeringId, estimated_weight: estimatedWeight, estimated_price: estimatedPrice};
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
                        getAllGigs(driverToken, pageOptions.PAGE, pageOptions.LIMIT, driverLocation.longitude, driverLocation.latitude).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${driverSuccessMessages.gigsRetrieved}`);
                            expect(response.body.data).to.have.property('gigs');
                            expect(response.body.data.gigs).to.be.an('array');
                            const gigs = response.body.data.gigs;
                            for(let i = 0; i < gigs.length; i++) {
                                if(gigs[i].order_id === orderId && gigs[i].gig_type === 'pickup') {
                                    gigId = gigs[i].gig_id;
                                    cy.log('Gig ID: ' + gigs[i].gig_id);
                                    cy.log('Gig Status: ' + gigs[i].gig_type);
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
                    if (selfPickup === false) {
                        getGigDetails(driverToken, gigId).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${driverSuccessMessages.gigsRetrieved}`);
                            expect(response.body.data).to.have.property('gig');
                            expect(response.body.data.gig).to.be.an('object');
                            expect(response.body.data.gig).to.have.property('gig_id', gigId);
                            const gigBiddingOptions = response.body.data.gig.bidding_options;
                            randomBidOption = gigBiddingOptions[Math.floor(Math.random() * gigBiddingOptions.length)];
                            cy.log('Bid Option' + randomBidOption);
                        });
                    } else {
                        cy.log('Self Pickup is true, so no need to get gig details');
                    }
                });

                it('should create bidding successfully', () => {
                    if (selfPickup === false) {
                        createBidding(driverToken, gigId, randomBidOption).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${driverSuccessMessages.bidPlaced}`);
                            expect(response.body.data).to.have.property('bidding');
                            expect(response.body.data.bidding).to.have.property('id');
                            expect(response.body.data.bidding).to.have.property('gig_id', gigId);
                            expect(response.body.data.bidding).to.have.property('ask_price', randomBidOption);
                            expect(response.body.data.bidding).to.have.property('status', orderApiOptions.PLACED);
                        });
                    } else {
                        cy.log('Self Pickup is true, so no need to create bidding');
                    }
                });

                it('should view the list of biddings by the user', () => {
                    if (selfPickup === false) {
                        viewBiddings(orderId, gigType, pageOptions.PAGE, pageOptions.LIMIT, mainUserToken).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${userSuccessMessages.biddingRetrieved}`);
                            const bids = response.body.data.biddings;
                            randomBidId = bids[Math.floor(Math.random() * bids.length)].id;
                            cy.log('Bid ID: ' + randomBidId);
                        });
                    } else {
                        cy.log('Self Pickup is true, so no need to get bidding details');
                    }
                });

                it('should accept a bid successfully', () => {
                    if (selfPickup === false) {
                        acceptBid(orderId, randomBidId, gigType, mainUserToken).then((response) => {
                            cy.log(orderId);
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${userSuccessMessages.bidAccepted}`);
                        });
                    }
                });

                it('should pick the gig', () => {
                    if (selfPickup === false) {
                        pickGig(driverToken, gigId).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${driverSuccessMessages.gigPicked}`);
                        });
                    } else {
                        cy.log('Self Pickup is true, so no need to pick the gig');
                    }
                });

                it('should get order from the gig', () => {
                    if (selfPickup === false) {
                        getOrders(vendorToken, pageOptions.PAGE, pageOptions.LIMIT, orderApiOptions.PICKING, branchId).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property( 'message', `${orderSuccessMessages.getOrdersByVendor}`);
                        expect(response.body.data).to.have.property('orders');
                        const orders = response.body.data.orders;
                        for (let i = 0; i < orders.length; i++) {
                            if (orders[i].id === orderId) {
                                expect(orders[i]).to.have.property('status', orderApiOptions.PICKEDUP);
                                cy.log('Order Status: ', orders[i].status);
                                cy.log('Order ID: ', orders[i].id);
                                break;
                            }
                        }
                        });
                    } else {
                        cy.log('Self Pickup is true, so no need to get order from the gig');
                    }
                });

                it('should start servicing by the vendor', () => {
                    vendorStartServicing(orderId, vendorToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${orderSuccessMessages.isNow} in servicing.`);
                    });
                });

                it('Vendor should add the over-weight', () => {
                    addOverweight(orderId, vendorToken, overweightData).then((response) => {
                        expect(response.status).to.eq(200);
                        // expect(response.body).to.have.property('message', `${orderSuccessMessages.overweightAdded}`);
                    });
                });

                it('should finish the servicing by the vendor', () => {
                    vendorFinishServicing(orderId, vendorToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${orderSuccessMessages.isNow} ready..`);
                    });
                });

            
                it('should login with the driver email', () => {
                    if (selfDelivery === false) {
                        login(orderAccessEmails.approvedDriverEmail, Cypress.env('password'), 'email').then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                            expect(response.body.data).to.have.property('token');
                            userToken = response.body.data.token;
                        });
                    } else {
                        cy.log('Self Delivery is true, so no need to login with driver email');
                    }
                });

                it('should switch to driver role', () => {
                    role = 'driver';
                    if (selfDelivery === false) {
                        switchRole(role, userToken).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${commonSuccessMessages.switchedTo} ${role}`);
                            expect(response.body.data).to.have.property('token');
                            driverToken = response.body.data.token;
                        });
                    } else {
                        cy.log('Self Delivery is true, so no need to switch to driver role');
                    }
                });

                it('should get all the gigs', () => {
                    if (selfDelivery === false) {
                        getAllGigs(driverToken, pageOptions.PAGE, pageOptions.LIMIT, driverLocation.longitude, driverLocation.latitude).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${driverSuccessMessages.gigsRetrieved}`);
                            expect(response.body.data).to.have.property('gigs');
                            expect(response.body.data.gigs).to.be.an('array');
                            const gigs = response.body.data.gigs;
                            for (let i = 0; i < gigs.length; i++) {
                                if (gigs[i].order_id === orderId) {
                                    gigId = gigs[i].gig_id;
                                    cy.log('Gig ID: ' + gigId);
                                    cy.log('Gig Type: ' + gigs[i].gig_type);
                                    gigType = gigs[i].gig_type;
                                    break;
                                }
                            }
                        });
                    } else {
                        cy.log('Self Delivery is true, so no need to get all the gigs');
                    }
                });

                it('should get gig details', () => {
                    if (selfDelivery === false) {
                        getGigDetails(driverToken, gigId).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${driverSuccessMessages.gigsRetrieved}`);
                            expect(response.body.data).to.have.property('gig');
                            expect(response.body.data.gig).to.be.an('object');
                            expect(response.body.data.gig).to.have.property('gig_id', gigId);
                            const gigBiddingOptions =
                            response.body.data.gig.bidding_options;
                            randomBidOption = gigBiddingOptions[Math.floor(Math.random() * gigBiddingOptions.length)];
                            cy.log('Bid Option' + randomBidOption);
                        });
                    } else {
                        cy.log('Self Delivery is true, so no need to get gig details');
                    }
                });

                it('should create bidding successfully', () => {
                    if (selfDelivery === false) {
                        createBidding(driverToken, gigId, randomBidOption).then(
                            (response) => {
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
                    } else {
                        cy.log('Self Delivery is true, so no need to create bidding');
                    }
                });

                it('should view the list of biddings by the user', () => {
                    if (selfDelivery === false) {
                        viewBiddings(orderId, gigType, pageOptions.PAGE, pageOptions.LIMIT, mainUserToken).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${userSuccessMessages.biddingRetrieved}`);
                            const bids = response.body.data.biddings;
                            randomBidId = bids[Math.floor(Math.random() * bids.length)].id;
                            cy.log('Bid ID: ' + randomBidId);

                            const selectedBid = bids.find((bid) => bid.id === randomBidId);
                            if (selectedBid) {
                                driverId = selectedBid.driver.id;
                                cy.log('Driver ID of selected bid: ' + driverId);
                            }
                        });
                    } else {
                        cy.log('Self Delivery is true, so no need to get bidding details');
                    }
                });

                it('should accept a bid successfully', () => {
                    if (selfDelivery === false) {
                        acceptBid(orderId, randomBidId, gigType, mainUserToken).then((response) => {
                            cy.log(orderId);
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${userSuccessMessages.bidAccepted}`);
                        });
                    }else{
                        cy.log("Self Delivery is true, so no need to accept the bid")
                    }
                });

                it('should pick the gig', () => {
                    if(selfDelivery === false){
                        pickGig(driverToken, gigId).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${driverSuccessMessages.gigPicked}`);
                        });            
                    }else{
                        cy.log('Self Pickup is true, so no need to pick the gig')
                    }
                });

                it('should drop the gig', () => {
                    if(selfDelivery === false){
                        cy.fixture('person.jpg', 'binary')
                            .then((file) => Cypress.Blob.binaryStringToBlob(file, 'image/jpg'))
                            .then((blob) => {
                                let formData = new FormData();
                                formData.append('completion_image', blob, 'person.jpg');

                                orderDroppedbyDriver(gigId, formData, driverToken).then((response) => {
                                    expect(response.status).to.eq(200);
                                })
                            })
                    }else{
                        cy.log('Self Delivery is true, so no need to drop the gig');
                    }
                });

                it('should complete the order succesfully', () => {
                    const complete = 'completed';
                    completeOrderProcess(orderId, mainUserToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${orderSuccessMessages.isNow} ${complete}.`);
                    });
                    cy.wait(30000);
                });

                it('should display the order details', () => {
                    getOrderDetailsById(orderId, mainUserToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${orderSuccessMessages.successful}retrived data`);
                        const resultedPrice = response.body.data.estimated_price;
                        expect(response.body.data).to.have.property('estimated_weight', estimatedWeight);
                        expect(estimatedPrice).to.eq(parseInt(resultedPrice.split('.')[0]));
                        expect(response.body.data).to.have.property('status', orderApiOptions.COMPLETED);
                        // expect(response.body.data.order_payment_meta).to.have.property('status', "paid");
                    });
                });

            });
        // }

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
