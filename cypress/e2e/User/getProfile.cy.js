/// <reference types="Cypress" />

import { login, switchRole } from "../../api/Auth_APIs/handleAuth.api";
import { getProfile } from "../../api/User_APIs/handleUser.api";
import { commonError } from "../../message/errorMessage";
import { commonSuccessMessages } from "../../message/successfulMessage";

let userToken, vendorToken, driverToken, role;
let contact, name, address, id, email;

describe('Get User Profile API Testing', () => {

    describe('Without Login', () => {

        it('should throw error message of unauthorized', () => {
            getProfile('').then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', `${commonError.unauthorized}`);
            });
        });

    });

    describe('After Login', () => {

        describe('When user is in customer mode', () => {

            before(() => {
                login(Cypress.env('registeredEmail'), Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                    name = response.body.data.user.name;
                    address = response.body.data.user.address;
                    id = response.body.data.user.id;
                    email = response.body.data.user.email;
                    cy.log(name);
                    cy.log(address);
                    cy.log(id);
                    cy.log(email);
                });
            });

            it('should get the profile info', () => {
                getProfile(userToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.profileInfo}`);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data.user.username).to.eq(name);
                    expect(response.body.data.user.address).to.eq(address);
                    expect(response.body.data.user.id).to.eq(id);
                    expect(response.body.data.user.email).to.eq(email);
                    contact = response.body.data.user.contact;
                    cy.log(contact);
                });
            });

        });

        describe('When user is in vendor mode', () => {

            before(() => {
                login(Cypress.env('registeredEmail'), Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });

            it('should switch to vendor mode', () => {
                role = 'vendor';
                switchRole(role, userToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message',`${commonSuccessMessages.switchedTo} ${role}`);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    vendorToken = response.body.data.token;
                });
            });

            it('should get the profile info', () => {
                getProfile(vendorToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.profileInfo}`);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data.user.username).to.eq(name);
                    expect(response.body.data.user.contact).to.eq(contact);
                    expect(response.body.data.user.address).to.eq(address);
                    expect(response.body.data.user.id).to.eq(id);
                    expect(response.body.data.user.email).to.eq(email);
                });
            });

        });

        describe('When user is in driver mode', () => {

            before(() => {
                login(Cypress.env('registeredEmail'), Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });

            it('should switch to driver mode', () => {
                role = 'driver';
                switchRole(role, userToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message',`${commonSuccessMessages.switchedTo} ${role}`);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    driverToken = response.body.data.token;
                });
            });

            it('should get the profile info', () => {
                getProfile(driverToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.profileInfo}`);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data.user.username).to.eq(name);
                    expect(response.body.data.user.contact).to.eq(contact);
                    expect(response.body.data.user.address).to.eq(address);
                    expect(response.body.data.user.id).to.eq(id);
                    expect(response.body.data.user.email).to.eq(email);
                });
            });

        });

    });
    
});