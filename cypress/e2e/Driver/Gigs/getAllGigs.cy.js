/// <reference types="Cypress" />

import { getAllGigs } from "../../../api/Driver_APIs/driver.api";
import { login, switchRole } from "../../../api/Auth_APIs/handleAuth.api";
import { orderAccessEmails } from "../../../api/Order_APIs/order.data";
import { commonSuccessMessages, driverSuccessMessages } from "../../../message/successfulMessage";
import { commonError } from "../../../message/errorMessage";

let userToken, driverToken, role;

describe('Driver Get All GIGS API Testing', () => {

    describe('With Login', () => {

        describe("When an user has not applied for a driver", () => {

            before(() => {
                login(orderAccessEmails.onlyCustomerEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });

            it('should throw error when user tries to get all gigs', () => {
                role = 'user';
                getAllGigs(userToken, 1, 20).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', `${commonError.forbidden} ${role} mode.`);
                });
            });

        });

        describe("When an user has applied for a driver", () => {

            before(() => {
                login(orderAccessEmails.appliedDriverEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });

            it('should throw error when user tries to get all gigs', () => {
                getAllGigs(userToken, 1, 20).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', `${commonError.forbidden} ${role} mode.`);
                });
            });

        });

        describe("When an user has been approved for a driver", () => {

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

            it('should successfully retireve the gigs', () => {
                getAllGigs(driverToken, 1, 100).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${driverSuccessMessages.gigsRetrieved}`);
                });
            });

        });

    });

    describe('Without Login', () => {

        it('should throw error when user tries to get all gigs', () => {
            getAllGigs('', 1, 20).then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', `${commonError.unauthorized}`);
            });
        });

    });

});