/// <reference types="cypress" />

import { commonError } from '../../message/errorMessage';
import { commonSuccessMessages } from '../../message/successfulMessage';
import { forgotPassword, setOTP } from '../../api/Auth_APIs/handleAuth.api';

let otp;

describe('Forgot Password', () => {
    describe('setOTP', () => {

        it("Can't send otp to new email", () => {
            setOTP(Cypress.env('forgotPasswordEmail'), 'forgotpassword').then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', `${commonError.userNotExist}`);
            });
        });

        it('Can send otp to registered email', () => {
            setOTP(Cypress.env('registeredEmail'), 'forgotpassword').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', `${commonSuccessMessages.otpToSetPasswordSent}`);
                expect(response.body.data).to.have.property('otp');
                otp = response.body.data.otp;
                cy.log(otp);
            });
        });
    
    });

    describe('resetPassword', () => {
        
        it("Can't reset password with empty email", () => {
            forgotPassword('', otp, 'newPassword').then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', `email ${commonError.empty}`);
            });
        });

        it("Can't reset password with invalid email", () => {
            forgotPassword('invalidemail', otp, 'newPassword').then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', `${commonError.invalidEmail}`);
            });
        });

        it("Can't reset password with empty otp", () => {
            forgotPassword(Cypress.env('registeredEmail'), '', 'newPassword').then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', `otp ${commonError.empty}`);
            });
        });

        it("Can't reset password with invalid otp", () => {
            forgotPassword(Cypress.env('registeredEmail'), 'invalidotp', 'newPassword').then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', `${commonError.invalidOtp}`);
            });
        });

        it("Can't reset password with empty password", () => {
            forgotPassword(Cypress.env('registeredEmail'), otp, '').then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', `password ${commonError.lessThan8Characters}`);
            });
        });

        it("Can't reset password with password less than 8 characters", () => {
            forgotPassword(Cypress.env('registeredEmail'), otp, '1234567').then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', `password ${commonError.lessThan8Characters}`);
            });
        });

        it("Can reset password with password 8 or more characters", () => {
            forgotPassword(Cypress.env('registeredEmail'), otp, '12345678').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', `${commonSuccessMessages.passwordReset}`);
            })
        });

    });

});