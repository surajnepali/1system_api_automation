/// <reference types="cypress" />

import register from '../../api/register.api';
import forgotPassword from '../../api/forgotPassword.api';
import ERROR from '../../message/errorMessage';
import SUCCESSFUL from '../../message/successfulMessage';

let otp;

describe('Forgot Password', () => {
    describe('setOTP', () => {

        it("Can't send otp to new email", () => {
            register.setOTP(Cypress.env('forgotPasswordEmail'), 'forgotpassword').then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.userNotExist);
            });
        });

        it('Can send otp to registered email', () => {
            register.setOTP(Cypress.env('registeredEmail'), 'forgotpassword').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.otpToSetPasswordSent);
                expect(response.body.data).to.have.property('otp');
                otp = response.body.data.otp;
                cy.log(otp);
            });
        });
    
    });

    describe('resetPassword', () => {
        
        it("Can't reset password with empty email", () => {
            forgotPassword.forgotPassword('', otp, 'newPassword').then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.emptyEmail);
            });
        });

        it("Can't reset password with invalid email", () => {
            forgotPassword.forgotPassword('invalidemail', otp, 'newPassword').then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.invalidEmail);
            });
        });

        it("Can't reset password with empty otp", () => {
            forgotPassword.forgotPassword(Cypress.env('registeredEmail'), '', 'newPassword').then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.emptyOtp);
            });
        });

        it("Can't reset password with invalid otp", () => {
            forgotPassword.forgotPassword(Cypress.env('registeredEmail'), 'invalidotp', 'newPassword').then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.invalidOtp);
            });
        });

        it("Can't reset password with empty password", () => {
            forgotPassword.forgotPassword(Cypress.env('registeredEmail'), otp, '').then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.emptyPassword);
            });
        });

        it("Can't reset password with password less than 8 characters", () => {
            forgotPassword.forgotPassword(Cypress.env('registeredEmail'), otp, '1234567').then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.invalidPassword);
            });
        });

        it("Can reset password with password 8 or more characters", () => {
            forgotPassword.forgotPassword(Cypress.env('registeredEmail'), otp, '12345678').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.passwordReset);
            })
        });


    });

});