/// <reference types="cypress" />

import { editUserData } from '../../api/User_APIs/user.data';
import { login } from '../../api/Auth_APIs/handleAuth.api';
import { editProfile, getProfile} from '../../api/User_APIs/handleUser.api';
import { commonError } from '../../message/errorMessage';
import { commonSuccessMessages } from '../../message/successfulMessage';

let contact, username, address, location;
let userToken;

describe('Profile Info', () => {

    describe('Without Login', () => {

        describe('Shoule throw errors on trying to Get and Edit Profile Info', () => {

            it('Should throw error message on trying to get profile info', () => {
                    
                    getProfile('').then((response) => {
                        expect(response.status).to.eq(401);
                        expect(response.body).to.have.property('message', `${commonError.unauthorized}`);
                    });
    
            });

            it('Should throw error message on trying to edit profile info', () => {
                    
                    editProfile(editUserData, '').then((response) => {
                        expect(response.status).to.eq(401);
                        expect(response.body).to.have.property('message', `${commonError.unauthorized}`);
                    });
    
            });

        });

    });

    describe('Get Profile Info After Successful Login', () => {

        before(() => {
                
            login(Cypress.env('registeredEmail'), Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                expect(response.body).to.have.property('data');
                expect(response.body.data).to.have.property('token');
                userToken = response.body.data.token;
            });
            
        });

        it('Should get profile info', () => {
            getProfile(userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', `${commonSuccessMessages.profileInfo}`);
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
                expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                expect(response.body).to.have.property('data');
                expect(response.body.data).to.have.property('token');
                userToken = response.body.data.token;
            });
                
        });

        it('Should throw error on leaving contact field empty', () => {
            const contact = 'contact';
            const detailWithEmptyContact = {...editUserData, [contact]: ''};
            editProfile(detailWithEmptyContact, userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', `${contact} ${commonError.empty}`);
            });
        });

        it('Should throw error on entering invalid contact', () => {
            const contact = 'contact';
            const detailWithInvalidContact = {...editUserData, [contact]: '1234567890'};
            editProfile(detailWithInvalidContact, userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', `${commonError.invalidContact} phone number.`);
            });
        });

        it('Should throw error on leaving username field empty', () => {
            const userName = 'username';
            const detailWithEmptyUsername = {...editUserData, [userName]: ''};
            editProfile(detailWithEmptyUsername, userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', `${userName} ${commonError.lessThanxCharacters}3 characters.`);
            });
        });

        it('Should throw error on entering invalid username', () => {
            const detailWithInvalidUsername = {...editUserData, username: 'abcd123'};
            editProfile(detailWithInvalidUsername, userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', `${commonError.invalidUsername}`);
            });
        });

        it('Should throw error on leaving address field empty', () => {
            const address = 'address';
            const detailWithEmptyAddress = {...editUserData, [address]: ''};
            editProfile(detailWithEmptyAddress, userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', `${address} ${commonError.lessThanxCharacters}2 characters.`);
            });
        });

        it('Should throw error on entering less than 2 characters address', () => {
            const address = 'address';
            const detailWithInvalidAddress = {...editUserData, [address]: 'a'};
            editProfile(detailWithInvalidAddress, userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', `${address} ${commonError.lessThanxCharacters}2 characters.`);
            });
        });

        it('Should throw error on leaving longitude field empty', () => {
            const longitude = 'longitude';
            const detailWithEmptyLongitude = {...editUserData, [longitude]: ''};
            editProfile(detailWithEmptyLongitude, userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', `${longitude} ${commonError.empty}`);
            });
        });

        it('Should throw error on entering invalid longitude', () => {
            const longitude = 'longitude';
            const detailWithInvalidLongitude = {...editUserData, [longitude]: 'abcd123'};
            editProfile(detailWithInvalidLongitude, userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', `${longitude} ${commonError.invalid}`);
            });
        });

        it('Should throw error on leaving latitude field empty', () => {
            const latitude = 'latitude';
            const detailWithEmptyLatitude = {...editUserData, [latitude]: ''};
            editProfile(detailWithEmptyLatitude, userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', `${latitude} ${commonError.empty}`);
            });
        });

        it('Should throw error on entering invalid latitude', () => {
            const latitude = 'latitude';
            const detailWithInvalidLatitude = {...editUserData, [latitude]: 'abcd123'};
            editProfile(detailWithInvalidLatitude, userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', `${latitude} ${commonError.invalid}`);
            });
        });

        it('Should edit the user profile', () => {
            editProfile(editUserData, userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', `${commonSuccessMessages.updated}`);
                expect(response.body).to.have.property('data');
            });
        });
    
    });
});