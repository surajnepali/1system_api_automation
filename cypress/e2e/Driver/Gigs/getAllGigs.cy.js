/// <reference types="Cypress" />

import { getAllGigs } from "../../../api/Driver_APIs/driver.api";
import { driverRole } from "../../../api/Driver_APIs/driver.data";
import { driverErrorMessages } from "../../../message/Error/Driver/driverErrorMessages";
import { driverSuccessMessages } from "../../../message/Successful/Driver/driverSuccessMessages";
import SUCCESSFUL from "../../../message/successfulMessage";
import ERROR from "../../../message/errorMessage";
import { login, switchRole } from "../../../api/Auth_APIs/handleAuth.api";

let userToken, driverToken;

describe('Driver Get All GIGS API Testing', () => {

    describe('With Login', () => {

        describe("When an user has not applied for a driver", () => {

            before(() => {
                login(driverRole.freshEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });

            it('should throw error when user tries to get all gigs', () => {
                getAllGigs(userToken, 1, 20).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', driverErrorMessages.forbidden);
                });
            });

        });

        describe("When an user has applied for a driver", () => {

            before(() => {
                login(driverRole.appliedDriverEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });

            it('should throw error when user tries to get all gigs', () => {
                getAllGigs(userToken, 1, 20).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', driverErrorMessages.forbidden);
                });
            });

        });

        describe("When an user has been approved for a driver", () => {

            before(() => {
                login(driverRole.approvedDriverEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });

            it('should switch to driver role', () => {
                switchRole('driver', userToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', driverSuccessMessages.roleSwitched);
                    expect(response.body.data).to.have.property('token');
                    driverToken = response.body.data.token;
                });
            });

            it('should successfully retireve the gigs', () => {
                getAllGigs(driverToken, 1, 100).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', driverSuccessMessages.gigsRetrieved);
                });
            });

        });

    });

    describe('Without Login', () => {

        it('should throw error when user tries to get all gigs', () => {
            getAllGigs('', 1, 20).then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', ERROR.unauthorized);
            });
        });

    });

});