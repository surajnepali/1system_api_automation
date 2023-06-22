/// <reference types="Cypress" />

import login from '../../api/login.api';
import changePassword from '../../api/changePassword.api';
import SUCCESSFUL from '../../message/successfulMessage';
import ERROR from '../../message/errorMessage';

describe('Change Password', () => {

    describe('Without Login', () => {
      
        it('Should throw error message on trying to change the password', () => {
                
            changePassword.changePassword(Cypress.env('newPassword'), Cypress.env('oldPassword')).then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', ERROR.unauthorized);
            });
        });
        
    });

    describe('Change Password After Successful Login', () => {

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

        it('Should throw error when old password is empty', () => {
            changePassword.changePassword('', Cypress.env('newPassword')).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.emptyCurrentPassword);
            });
        });

        it('Should throw error when new password is empty', () => {
            changePassword.changePassword(Cypress.env('oldPassword'), '').then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.emptyPassword);
            });
        });

        it('Should throw error when old password is invalid', () => {
            changePassword.changePassword(Cypress.env('wrongPassword'), Cypress.env('newPassword')).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.oldInvalidPassword);
            });
        });

        it('Should throw error when new password is same as old password', () => {
            changePassword.changePassword(Cypress.env('oldPassword'), Cypress.env('oldPassword')).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.newPasswordSame);
            });
        });

        it('Should throw error when new password is less than 8 characters', () => {
            changePassword.changePassword(Cypress.env('oldPassword'), '1234567').then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.invalidPassword);
            });
        });

        it('Should sucessful when old and new passwords are different and valid', () => {
            changePassword.changePassword(Cypress.env('oldPassword'), Cypress.env('newPassword')).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.passwordChanged);
            });
        });

    });

    describe("Change back to old password", () => {

        beforeEach(() => {
            login.loginUser(Cypress.env('registeredEmail'), Cypress.env('newPassword'), 'email').then((response) => {
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
                
            changePassword.changePassword(Cypress.env('newPassword'), Cypress.env('oldPassword')).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.passwordChanged);
            });
        });

    });
});
