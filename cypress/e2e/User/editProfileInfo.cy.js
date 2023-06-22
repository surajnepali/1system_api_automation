/// <reference types="cypress" />

import login from '../../api/login.api';
import editProfileInfo from '../../api/editProfileInfo.api';
import ERROR from '../../message/errorMessage';
import SUCCESSFUL from '../../message/successfulMessage';

let contact, username, address, location;

describe('Profile Info', () => {

    describe('Without Login', () => {

        describe('Shoule throw errors on trying to Get and Edit Profile Info', () => {

            it('Should throw error message on trying to get profile info', () => {
                    
                    editProfileInfo.getProfile().then((response) => {
                        expect(response.status).to.eq(401);
                        expect(response.body).to.have.property('message', ERROR.unauthorized);
                    });
    
            });

            it('Should throw error message on trying to edit profile info', () => {
                    
                    editProfileInfo.editProfile(Cypress.env('newContact'), Cypress.env('newUsername'), Cypress.env('newAddress'), Cypress.env('newLocation')).then((response) => {
                        expect(response.status).to.eq(401);
                        expect(response.body).to.have.property('message', ERROR.unauthorized);
                    });
    
            });

        });

    });

    describe('Get Profile Info After Successful Login', () => {

        beforeEach(() => {
                
            login.loginUser(Cypress.env('registeredEmail'), Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                expect(response.body).to.have.property('data');
                expect(response.body.data).to.have.property('token');
                const token = response.body.data.token;
                localStorage.setItem('token', token);
                return token;
            });
            
        });

        it('Should get profile info', () => {
            editProfileInfo.getProfile().then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.profileInfo);
                expect(response.body).to.have.property('data');
                expect(response.body.data.user).to.have.property('contact');
                expect(response.body.data.user).to.have.property('username');
                expect(response.body.data.user).to.have.property('address');
                expect(response.body.data.user).to.have.property('location');
                contact = response.body.data.user.contact;
                username = response.body.data.user.username;
                address = response.body.data.user.address;
                location = response.body.data.user.location;
                cy.log(contact);
                cy.log(username);
                cy.log(address);
                cy.log(location);
            });
        });

    });

    describe('Edit Profile Info After Successful Login', () => {

        beforeEach(() => {
                    
            login.loginUser(Cypress.env('registeredEmail'), Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                expect(response.body).to.have.property('data');
                expect(response.body.data).to.have.property('token');
                const token = response.body.data.token;
                localStorage.setItem('token', token);
                return token;
            });
                
        });

        it('Should throw error on leaving contact field empty', () => {
            editProfileInfo.editProfile('', username, address, Cypress.env('newLongitude'), Cypress.env('newLatitude')).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.emptyContact);
            });
        });

        it('Should throw error on entering invalid contact', () => {
            editProfileInfo.editProfile('abch', username, address, Cypress.env('newLongitude'), Cypress.env('newLatitude')).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.invalidContact);
            });
        });

        it('Should throw error on leaving username field empty', () => {
            editProfileInfo.editProfile(contact, '', address, Cypress.env('newLongitude'), Cypress.env('newLatitude')).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.emptyUsername);
            });
        });

        it('Should throw error on entering invalid username', () => {
            editProfileInfo.editProfile(contact, 'abcd123', address, Cypress.env('newLongitude'), Cypress.env('newLatitude')).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.invalidUsername);
            });
        });

        it('Should throw error on leaving address field empty', () => {
            editProfileInfo.editProfile(contact, username, '', Cypress.env('newLongitude'), Cypress.env('newLatitude')).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.emptyAddress);
            });
        });

        it('Should throw error on entering less than 2 characters address', () => {
            editProfileInfo.editProfile(contact, username, 'a', Cypress.env('newLongitude'), Cypress.env('newLatitude')).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.invalidAddress);
            });
        });

        it('Should throw error on leaving longitude field empty', () => {
            editProfileInfo.editProfile(contact, username, address, '', Cypress.env('newLatitude')).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.emptyLongitude);
            });
        });

        it('Should throw error on entering invalid longitude', () => {
            editProfileInfo.editProfile(contact, username, address, 'abcd123', Cypress.env('newLatitude')).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.invalidLongitude);
            });
        });

        it('Should throw error on leaving latitude field empty', () => {
            editProfileInfo.editProfile(contact, username, address, Cypress.env('newLongitude'), '').then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.emptyLatitude);
            });
        });

        it('Should throw error on entering invalid latitude', () => {
            editProfileInfo.editProfile(contact, username, address, Cypress.env('newLongitude'), 'abcd123').then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.invalidLatitude);
            });
        });

        it('Should edit the user profile', () => {
            editProfileInfo.editProfile(contact, username, address, Cypress.env('newLongitude'), Cypress.env('newLatitude')).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.profileInfoUpdated);
                expect(response.body).to.have.property('data');
                expect(response.body.data.user).to.have.property('contact', contact);
                expect(response.body.data.user).to.have.property('username', username);
                expect(response.body.data.user).to.have.property('address', address);
                expect(response.body.data.user).to.have.property('location');
            });
        });
    
    });
});