/// <reference types="Cypress" />

import SUCCESSFUL from '../../message/successfulMessage';
import ERROR from '../../message/errorMessage';
import { changePassword, login } from '../../api/Auth_APIs/handleAuth.api';

describe('Change Password', () => {

    describe('Without Login', () => {
      
        it('Should throw error message on trying to change the password', () => {
                
            changePassword(Cypress.env('newPassword'), Cypress.env('oldPassword')).then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', ERROR.unauthorized);
            });
        });
        
    });

    describe('Change Password After Successful Login', () => {

        beforeEach(() => {

            login(Cypress.env('registeredEmail'), Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                expect(response.body).to.have.property('data');
                expect(response.body.data).to.have.property('token');
                const token = response.body.data.token;
                localStorage.setItem('token', token);
                return token;
            });
        
        });

        it('Should throw error when old password is empty', () => {
            changePassword('', Cypress.env('newPassword')).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.emptyCurrentPassword);
            });
        });

        it('Should throw error when new password is empty', () => {
            changePassword(Cypress.env('oldPassword'), '').then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.emptyPassword);
            });
        });

        it('Should throw error when old password is invalid', () => {
            changePassword(Cypress.env('wrongPassword'), Cypress.env('newPassword')).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.oldInvalidPassword);
            });
        });

        it('Should throw error when new password is same as old password', () => {
            changePassword(Cypress.env('oldPassword'), Cypress.env('oldPassword')).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.newPasswordSame);
            });
        });

        it('Should throw error when new password is less than 8 characters', () => {
            changePassword(Cypress.env('oldPassword'), '1234567').then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.invalidPassword);
            });
        });

        it('Should sucessful when old and new passwords are different and valid', () => {
            changePassword(Cypress.env('oldPassword'), Cypress.env('newPassword')).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.passwordChanged);
            });
        });

    });

    describe("Change back to old password", () => {

        beforeEach(() => {
            login(Cypress.env('registeredEmail'), Cypress.env('newPassword'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                expect(response.body).to.have.property('data');
                expect(response.body.data).to.have.property('token');
                const token = response.body.data.token;
                localStorage.setItem('token', token);
                return token;
            });
        });

        it('Change back to old password', () => {
                
            changePassword(Cypress.env('newPassword'), Cypress.env('oldPassword')).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.passwordChanged);
            });
        });

    });
});
