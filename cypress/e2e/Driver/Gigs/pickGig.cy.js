/// reference types="Cypress" />

import { acceptGig, getAllGigs, pickGig } from "../../../api/Driver_APIs/driver.api";
import { acceptOrderByVendor, createOrder } from "../../../api/Order_APIs/handleOrder.api";
import { createOrderData, orderAccessEmails } from "../../../api/Order_APIs/order.data";
import { getAllOfferingsOfBranch } from "../../../api/Vendor_APIs/branchOffering.api";
import getAllBranchesOfVendorApi from "../../../api/Vendor_APIs/getAllBranchesOfVendor.api";
import loginApi from "../../../api/login.api";
import switchRoleApi from "../../../api/switchRole.api";
import { driverErrorMessages } from "../../../message/Error/Driver/driverErrorMessages";
import { driverSuccessMessages } from "../../../message/Successful/Driver/driverSuccessMessages";
import { orderSuccessMessages } from "../../../message/Successful/Order/orderSuccessMessages";
import { vendorSuccessMessages } from "../../../message/Successful/Vendor/vendorSuccessMessage";
import SUCCESSFUL from "../../../message/successfulMessage";
import ERROR from "../../../message/errorMessage";

let userToken, vendorToken, branchId, offeringId, serviceId , orderId, gigId, driverToken;

describe('Driver Pick GIG API Testing', () => {

    describe('After Login', () => {

        describe('User is an approved Driver and tries to pick up a GIG', () => {

            describe("when user switches to driver role", () => {
                
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
                        cy.log(serviceId);
                        const randomOffering = offerings[randomIndex];
                        offeringId = randomOffering.id;
                        cy.log('Offering ID: ' + offeringId);
                    });
                });

                it('should login with the customer email', () => {
                    loginApi.loginUser(orderAccessEmails.onlyCustomerEmail, Cypress.env('password'), 'email').then((response) => {
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
                        expect(response.body.data.order).to.have.property('status', 'initialized');
                        cy.log('Order Status: ', response.body.data.order.status)
                    });
                });

                it('Vendor should accept the order', () => {
                    acceptOrderByVendor(orderId, vendorToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', orderSuccessMessages.orderAcceptedByVendor);
                        expect(response.body.data.order[0]).to.have.property('status', 'accepted');
                        cy.log('Order Status: ', response.body.data.order[0].status)
                    });
                });

                it('should login with the driver email', () => {
                    loginApi.loginUser(orderAccessEmails.approvedDriverEmail, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;
                    });
                });

                it('should switch to driver role', () => {
                    switchRoleApi.switchRole('driver', userToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', driverSuccessMessages.roleSwitched);
                        expect(response.body.data).to.have.property('token');
                        driverToken = response.body.data.token;
                    });
                });

                it('should get all the gigs', () => {
                    getAllGigs(driverToken, 1, 86).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', driverSuccessMessages.gigsRetrieved);
                        expect(response.body.data).to.have.property('gigs');
                        expect(response.body.data.gigs).to.be.an('array');
                        const gigs = response.body.data.gigs;
                        cy.log('No. of Gigs: ', gigs.length);
                        for(let i = 0; i < gigs.length; i++) {
                            if(gigs[i].order_id === orderId) {
                                gigId = gigs[i].gig_id;
                                cy.log('Gig ID: ' + gigId);
                                break;
                            }
                        }
                    });
                });

                it('should accept the gig', () => {
                    acceptGig(driverToken, gigId).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', driverSuccessMessages.gigAccepted);
                    });
                });

                it('should pick the gig', () => {
                    pickGig(driverToken, gigId).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', driverSuccessMessages.gigPicked);
                    });
                });

            });

            describe('When user does not switch to driver role', () => {

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
                        cy.log(serviceId);
                        const randomOffering = offerings[randomIndex];
                        offeringId = randomOffering.id;
                        cy.log('Offering ID: ' + offeringId);
                    });
                });

                it('should login with the customer email', () => {
                    loginApi.loginUser(orderAccessEmails.onlyCustomerEmail, Cypress.env('password'), 'email').then((response) => {
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
                        expect(response.body.data.order).to.have.property('status', 'initialized');
                        cy.log('Order Status: ', response.body.data.order.status)
                    });
                });

                it('Vendor should accept the order', () => {
                    acceptOrderByVendor(orderId, vendorToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', orderSuccessMessages.orderAcceptedByVendor);
                        expect(response.body.data.order[0]).to.have.property('status', 'accepted');
                        cy.log('Order Status: ', response.body.data.order[0].status)
                    });
                });

                it('should login with the driver email', () => {
                    loginApi.loginUser(orderAccessEmails.approvedDriverEmail, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;
                    });
                });

                it('should switch to driver role', () => {
                    switchRoleApi.switchRole('driver', userToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', driverSuccessMessages.roleSwitched);
                        expect(response.body.data).to.have.property('token');
                        driverToken = response.body.data.token;
                    });
                });

                it('should get all the gigs', () => {
                    getAllGigs(driverToken, 1, 86).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', driverSuccessMessages.gigsRetrieved);
                        expect(response.body.data).to.have.property('gigs');
                        expect(response.body.data.gigs).to.be.an('array');
                        const gigs = response.body.data.gigs;
                        for(let i = 0; i < gigs.length; i++) {
                            if(gigs[i].order_id === orderId) {
                                gigId = gigs[i].gig_id;
                                cy.log('Gig ID: ' + gigId);
                                break;
                            }
                        }
                    });
                });

                it('should accept the gig', () => {
                    acceptGig(driverToken, gigId).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', driverSuccessMessages.gigAccepted);
                    });
                });

                it('should throw error on trying to pick the gig', () => {
                    pickGig(userToken, gigId).then((response) => {
                        expect(response.status).to.eq(403);
                        expect(response.body).to.have.property('message', driverErrorMessages.forbidden);
                    });
                });

            });

            describe('When user tries to re-pick the accepted gig', () => {

                it('should pick the gig', () => {
                    pickGig(driverToken, gigId).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', driverSuccessMessages.gigPicked);
                    });
                });

                it('should throw error on trying to re-pick the gig', () => {
                    pickGig(driverToken, gigId).then((response) => {
                        expect(response.status).to.eq(400);
                        expect(response.body).to.have.property('message', driverErrorMessages.noGigFound);
                    });
                });

            });

            describe('When another driver tries to accept the gig that was already accepted by another driver', () => {

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
                        cy.log(serviceId);
                        const randomOffering = offerings[randomIndex];
                        offeringId = randomOffering.id;
                        cy.log('Offering ID: ' + offeringId);
                    });
                });

                it('should login with the customer email', () => {
                    loginApi.loginUser(orderAccessEmails.onlyCustomerEmail, Cypress.env('password'), 'email').then((response) => {
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
                        expect(response.body.data.order).to.have.property('status', 'initialized');
                        cy.log('Order Status: ', response.body.data.order.status)
                    });
                });

                it('Vendor should accept the order', () => {
                    acceptOrderByVendor(orderId, vendorToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', orderSuccessMessages.orderAcceptedByVendor);
                        expect(response.body.data.order[0]).to.have.property('status', 'accepted');
                        cy.log('Order Status: ', response.body.data.order[0].status)
                    });
                });

                it('should login with the driver email', () => {
                    loginApi.loginUser(orderAccessEmails.approvedDriverEmail, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;
                    });
                });

                it('should switch to driver role', () => {
                    switchRoleApi.switchRole('driver', userToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', driverSuccessMessages.roleSwitched);
                        expect(response.body.data).to.have.property('token');
                        driverToken = response.body.data.token;
                    });
                });

                it('should get all the gigs', () => {
                    getAllGigs(driverToken, 1, 86).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', driverSuccessMessages.gigsRetrieved);
                        expect(response.body.data).to.have.property('gigs');
                        expect(response.body.data.gigs).to.be.an('array');
                        const gigs = response.body.data.gigs;
                        cy.log('No. of Gigs: ', gigs.length);
                        for(let i = 0; i < gigs.length; i++) {
                            if(gigs[i].order_id === orderId) {
                                gigId = gigs[i].gig_id;
                                cy.log('Gig ID: ' + gigId);
                                break;
                            }
                        }
                    });
                });

                it('should accept the gig', () => {
                    acceptGig(driverToken, gigId).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', driverSuccessMessages.gigAccepted);
                    });
                });

                it('should pick the gig', () => {
                    pickGig(driverToken, gigId).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', driverSuccessMessages.gigPicked);
                    });
                });

                it('should login with another driver email', () => {
                    loginApi.loginUser(Cypress.env('userWithDriverRoleApproved'), Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;
                    });
                });

                it('should switch to driver role', () => {
                    switchRoleApi.switchRole('driver', userToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', driverSuccessMessages.roleSwitched);
                        expect(response.body.data).to.have.property('token');
                        driverToken = response.body.data.token;
                    });
                });

                it('should throw on trying to pick the already picked gig', () => {
                    pickGig(driverToken, gigId).then((response) => {
                        expect(response.status).to.eq(403);
                        expect(response.body).to.have.property('message', driverErrorMessages.notAssignedGig)
                    });
                });

            });

            describe('When user tries to pick the gig without accepting it', () => {

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
                        cy.log(serviceId);
                        const randomOffering = offerings[randomIndex];
                        offeringId = randomOffering.id;
                        cy.log('Offering ID: ' + offeringId);
                    });
                });

                it('should login with the customer email', () => {
                    loginApi.loginUser(orderAccessEmails.onlyCustomerEmail, Cypress.env('password'), 'email').then((response) => {
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
                        expect(response.body.data.order).to.have.property('status', 'initialized');
                        cy.log('Order Status: ', response.body.data.order.status)
                    });
                });

                it('Vendor should accept the order', () => {
                    acceptOrderByVendor(orderId, vendorToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', orderSuccessMessages.orderAcceptedByVendor);
                        expect(response.body.data.order[0]).to.have.property('status', 'accepted');
                        cy.log('Order Status: ', response.body.data.order[0].status)
                    });
                });

                it('should login with the driver email', () => {
                    loginApi.loginUser(orderAccessEmails.approvedDriverEmail, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;
                    });
                });

                it('should switch to driver role', () => {
                    switchRoleApi.switchRole('driver', userToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', driverSuccessMessages.roleSwitched);
                        expect(response.body.data).to.have.property('token');
                        driverToken = response.body.data.token;
                    });
                });

                it('should get all the gigs', () => {
                    getAllGigs(driverToken, 1, 100).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', driverSuccessMessages.gigsRetrieved);
                        expect(response.body.data).to.have.property('gigs');
                        expect(response.body.data.gigs).to.be.an('array');
                        const gigs = response.body.data.gigs;
                        for(let i = 0; i < gigs.length; i++) {
                            if(gigs[i].order_id === orderId) {
                                gigId = gigs[i].gig_id;
                                cy.log('Gig ID: ' + gigId);
                                break;
                            }
                        }
                    });
                });

                // Now, the driver is trying to pick the gig without accepting it
                it('should throw on trying to pick the gig without accepting it', () => {
                    pickGig(driverToken, gigId).then((response) => {
                        expect(response.status).to.eq(403);
                        expect(response.body).to.have.property('message', driverErrorMessages.notAssignedGig);
                    });
                });

            });

        });

    });

    describe('Without Login', () => {
            
            it('should throw on trying to pick the gig without login', () => {
                pickGig('', gigId).then((response) => {
                    expect(response.status).to.eq(401);
                    expect(response.body).to.have.property('message', ERROR.unauthorized);
                });
            });
    
    });

});