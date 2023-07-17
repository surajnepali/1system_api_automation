/// <reference types="Cypress" />

import { commonSuccessMessages } from '../../message/successfulMessage';
import { commonError } from '../../message/errorMessage';
import { login } from '../../api/Auth_APIs/handleAuth.api';
import { changePassword } from '../../api/User_APIs/handleUser.api';

let userToken;

describe('Change Password', () => {

    describe('Without Login', () => {
      
        it('Should throw error message on trying to change the password', () => {
                
            changePassword(Cypress.env('newPassword'), Cypress.env('oldPassword'), '').then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', `${commonError.unauthorized}`);
            });
        });
        
    });

    describe('Change Password After Successful Login', () => {

        before(() => {

            login(Cypress.env('registeredEmail'), Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                expect(response.body).to.have.property('data');
                expect(response.body.data).to.have.property('token');
                userToken = response.body.data.token;
            });
        
        });

        it('Should throw error when old password is empty', () => {
            const currentPassword = 'current_password';
            changePassword('', Cypress.env('newPassword'), userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', `${currentPassword} ${commonError.empty}`);
            });
        });

        it('Should throw error when new password is empty', () => {
            const newPassword = 'password';
            changePassword(Cypress.env('oldPassword'), '', userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', `${newPassword} ${commonError.empty}`);
            });
        });

        it('Should throw error when old password is invalid', () => {
            changePassword(Cypress.env('wrongPassword'), Cypress.env('newPassword'), userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', `${commonError.oldInvalidPassword}`);
            });
        });

        it('Should throw error when new password is same as old password', () => {
            changePassword(Cypress.env('oldPassword'), Cypress.env('oldPassword'), userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', `${commonError.newPasswordSame}`);
            });
        });

        it('Should throw error when new password is less than 8 characters', () => {
            changePassword(Cypress.env('oldPassword'), '1234567', userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', `password ${commonError.lessThan8Characters}`);
            });
        });

        it('Should sucessful when old and new passwords are different and valid', () => {
            changePassword(Cypress.env('oldPassword'), Cypress.env('newPassword'), userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', `${commonSuccessMessages.updated}.`);
            });
        });

    });

    describe("Change back to old password", () => {

        before(() => {
            login(Cypress.env('registeredEmail'), Cypress.env('newPassword'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                expect(response.body).to.have.property('data');
                expect(response.body.data).to.have.property('token');
                userToken = response.body.data.token;
            });
        });

        it('Change back to old password', () => {
                
            changePassword(Cypress.env('newPassword'), Cypress.env('oldPassword'), userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', `${commonSuccessMessages.updated}.`);
            });
        });

    });
});
