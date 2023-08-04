/// <reference types="cypress" />

import { login, switchRole } from "../../../api/Auth_APIs/handleAuth.api";
import { getAllGigs, getGigDetails } from "../../../api/Driver_APIs/driver.api";
import { orderAccessEmails } from "../../../api/Order_APIs/order.data";
import { commonError } from "../../../message/errorMessage";
import { commonSuccessMessages, driverSuccessMessages } from "../../../message/successfulMessage";

let userToken, driverToken, role;
let gigId = '';

describe('Get GIG Details API Testing', () => {

    describe('With Login', () => {

        describe('User is an approved Driver and tries to get the GIG details', () => {

            describe('When user switches to driver role', () => {

                before(() => {
                    login(orderAccessEmails.approvedDriverEmail, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;
                    });
                });

                it('should switch to driver role', () => {
                    role = 'driver';
                    switchRole(role, userToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.switchedTo} ${role}`);
                        expect(response.body.data).to.have.property('token');
                        driverToken = response.body.data.token;
                    });
                });

                it('should get all gigs', () => {
                    getAllGigs(driverToken, 1, 100).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${driverSuccessMessages.gigsRetrieved}`);
                        expect(response.body.data).to.have.property('gigs');
                        expect(response.body.data.gigs).to.be.an('array');
                        const gigs = response.body.data.gigs;
                        const randomGig = gigs[Math.floor(Math.random() * gigs.length)];
                        gigId = randomGig.gig_id;
                        cy.log(gigId);
                    });
                });

                it('should get gig details', () => {
                    getGigDetails(driverToken, gigId).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${driverSuccessMessages.gigsRetrieved}`);
                        expect(response.body.data).to.have.property('gig');
                        expect(response.body.data.gig).to.be.an('object');
                        expect(response.body.data.gig).to.have.property('gig_id', gigId);
                        const gigBiddingOptions = response.body.data.gig.bidding_options;
                        const randomBidOption = gigBiddingOptions[Math.floor(Math.random() * gigBiddingOptions.length)];
                        cy.log("Bid Option", randomBidOption);

                    });
                });

            });

            describe('When user does not switch to driver role', () => {

                before(() => {
                    login(orderAccessEmails.approvedDriverEmail, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message',  `${commonSuccessMessages.sucessfulLogin}`);
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;
                    });
                });

                it('should throw error on trying to get gig details', () => {
                    role = 'user'
                    getGigDetails(userToken, gigId).then((response) => {
                        expect(response.status).to.eq(403);
                        expect(response.body).to.have.property('message', `${commonError.forbidden} ${role} mode.`);
                    });
                });

            });

        });

        describe('User is a pending Driver and tries to get the GIG details', () => {

            before(() => {
                login(orderAccessEmails.appliedDriverEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });

            it('should throw error on trying to get gig details', () => {
                role = 'user';
                getGigDetails(userToken, gigId).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', `${commonError.forbidden} ${role} mode.`);
                });
            });

        });

        describe('User has not applied for Driver role yet', () => {

            before(() => {
                login(orderAccessEmails.onlyCustomerEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });

            it('should throw error on trying to get gig details', () => {
                role = 'user';
                getGigDetails(userToken, gigId).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', `${commonError.forbidden} ${role} mode.`);
                });
            });

        });

    });

    describe('Without Login', () => {
            
            it('should throw error on trying to get gig details', () => {
                getGigDetails('', gigId).then((response) => {
                    expect(response.status).to.eq(401);
                    expect(response.body).to.have.property('message', `${commonError.unauthorized}`);
                });
            });
    });

});