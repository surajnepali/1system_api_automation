/// <reference types="cypress" />

import { editUserData } from '../../api/Auth_APIs/auth.data';
import { editProfile, getProfile, login } from '../../api/Auth_APIs/handleAuth.api';
import ERROR from '../../message/errorMessage';
import SUCCESSFUL from '../../message/successfulMessage';

let contact, username, address, location;
let userToken;

describe('Profile Info', () => {

    describe('Without Login', () => {

        describe('Shoule throw errors on trying to Get and Edit Profile Info', () => {

            it('Should throw error message on trying to get profile info', () => {
                    
                    getProfile('').then((response) => {
                        expect(response.status).to.eq(401);
                        expect(response.body).to.have.property('message', ERROR.unauthorized);
                    });
    
            });

            it('Should throw error message on trying to edit profile info', () => {
                    
                    editProfile(editUserData, '').then((response) => {
                        expect(response.status).to.eq(401);
                        expect(response.body).to.have.property('message', ERROR.unauthorized);
                    });
    
            });

        });

    });

    describe('Get Profile Info After Successful Login', () => {

        before(() => {
                
            login(Cypress.env('registeredEmail'), Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                expect(response.body).to.have.property('data');
                expect(response.body.data).to.have.property('token');
                userToken = response.body.data.token;
            });
            
        });

        it('Should get profile info', () => {
            getProfile(userToken).then((response) => {
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

        before(() => {
                    
            login(Cypress.env('registeredEmail'), Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                expect(response.body).to.have.property('data');
                expect(response.body.data).to.have.property('token');
                userToken = response.body.data.token;
            });
                
        });

        it('Should throw error on leaving contact field empty', () => {
            const detailWithEmptyContact = {...editUserData, contact: ''};
            editProfile(detailWithEmptyContact, userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.emptyContact);
            });
        });

        it('Should throw error on entering invalid contact', () => {
            const detailWithInvalidContact = {...editUserData, contact: '1234567890'};
            editProfile(detailWithInvalidContact, userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.invalidContact);
            });
        });

        it('Should throw error on leaving username field empty', () => {
            const detailWithEmptyUsername = {...editUserData, username: ''};
            editProfile(detailWithEmptyUsername, userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.emptyUsername);
            });
        });

        it('Should throw error on entering invalid username', () => {
            const detailWithInvalidUsername = {...editUserData, username: 'abcd123'};
            editProfile(detailWithInvalidUsername, userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.invalidUsername);
            });
        });

        it('Should throw error on leaving address field empty', () => {
            const detailWithEmptyAddress = {...editUserData, address: ''};
            editProfile(detailWithEmptyAddress, userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.emptyAddress);
            });
        });

        it('Should throw error on entering less than 2 characters address', () => {
            const detailWithInvalidAddress = {...editUserData, address: 'a'};
            editProfile(detailWithInvalidAddress, userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.invalidAddress);
            });
        });

        it('Should throw error on leaving longitude field empty', () => {
            const detailWithEmptyLongitude = {...editUserData, longitude: ''};
            editProfile(detailWithEmptyLongitude, userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.emptyLongitude);
            });
        });

        it('Should throw error on entering invalid longitude', () => {
            const detailWithInvalidLongitude = {...editUserData, longitude: 'abcd123'};
            editProfile(detailWithInvalidLongitude, userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.invalidLongitude);
            });
        });

        it('Should throw error on leaving latitude field empty', () => {
            const detailWithEmptyLatitude = {...editUserData, latitude: ''};
            editProfile(detailWithEmptyLatitude, userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.emptyLatitude);
            });
        });

        it('Should throw error on entering invalid latitude', () => {
            const detailWithInvalidLatitude = {...editUserData, latitude: 'abcd123'};
            editProfile(detailWithInvalidLatitude, userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.invalidLatitude);
            });
        });

        it('Should edit the user profile', () => {
            editProfile(editUserData, userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.profileInfoUpdated);
                expect(response.body).to.have.property('data');
            });
        });
    
    });
});