/// <reference types="cypress" />

import { getAllGigs, getGigDetails } from "../../../api/Driver_APIs/driver.api";
import { driverRole } from "../../../api/Driver_APIs/driver.data";
import loginApi from "../../../api/login.api";
import switchRoleApi from "../../../api/switchRole.api";
import { driverErrorMessages } from "../../../message/Error/Driver/driverErrorMessages";
import { driverSuccessMessages } from "../../../message/Successful/Driver/driverSuccessMessages";
import ERROR from "../../../message/errorMessage";
import SUCCESSFUL from "../../../message/successfulMessage";

let userToken, driverToken;
let gigId = '';

describe('Get GIG Details API Testing', () => {

    describe('With Login', () => {

        describe('User is an approved Driver and tries to get the GIG details', () => {

            describe('When user switches to driver role', () => {

                before(() => {
                    loginApi.loginUser(driverRole.approvedDriverEmail, Cypress.env('password'), 'email').then((response) => {
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

                it('should get all gigs', () => {
                    getAllGigs(driverToken, 1, 100).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', driverSuccessMessages.gigsRetrieved);
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
                        expect(response.body).to.have.property('message', driverSuccessMessages.gigsRetrieved);
                        expect(response.body.data).to.have.property('gig');
                        expect(response.body.data.gig).to.be.an('object');
                        const gig = response.body.data.gig;
                        expect(gig).to.have.property('id', gigId);
                    });
                });

            });

            describe('When user does not switch to driver role', () => {

                before(() => {
                    loginApi.loginUser(driverRole.approvedDriverEmail, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;
                    });
                });

                it('should throw error on trying to get gig details', () => {
                    getGigDetails(userToken, gigId).then((response) => {
                        expect(response.status).to.eq(403);
                        expect(response.body).to.have.property('message', driverErrorMessages.forbidden);
                    });
                });

            });

        });

        describe('User is a pending Driver and tries to get the GIG details', () => {

            before(() => {
                loginApi.loginUser(driverRole.appliedDriverEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });

            it('should throw error on trying to get gig details', () => {
                getGigDetails(userToken, gigId).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', driverErrorMessages.forbidden);
                });
            });

        });

        describe('User has not applied for Driver role yet', () => {

            before(() => {
                loginApi.loginUser(driverRole.freshEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });

            it('should throw error on trying to get gig details', () => {
                getGigDetails(userToken, gigId).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', driverErrorMessages.forbidden);
                });
            });

        });

    });

    describe('Without Login', () => {
            
            it('should throw error on trying to get gig details', () => {
                getGigDetails('', gigId).then((response) => {
                    expect(response.status).to.eq(401);
                    expect(response.body).to.have.property('message', ERROR.unauthorized);
                });
            });
    });

});