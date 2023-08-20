/// reference types= "cypress" />

import { createUserData, randomEmail } from "../../api/Auth_APIs/auth.data";
import { login, registerCustomer, setOTP, verifyOTP } from "../../api/Auth_APIs/handleAuth.api";
import { commonSuccessMessages } from "../../message/successfulMessage";

let otp, newEmail;

newEmail = randomEmail.email;
describe("Registration of User", () => {

    describe("Sign up", () => {

        it("Set OTP", () => {
            setOTP(newEmail, 'verifyEmail').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', `${commonSuccessMessages.otpEmailSent}`);
                expect(response.body).to.have.property('data');
                expect(response.body.data).to.have.property('otp');
                otp = response.body.data.otp;
                cy.log(otp);
            });
        });

        it("Verify OTP", () => {
            verifyOTP(newEmail, 'verifyEmail', otp).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', `${commonSuccessMessages.otpVerified}`);
            });
        });

        it('Can register with valid data', () => {
            const x = {...createUserData, otp: otp, email: newEmail}
            registerCustomer(x).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
            });
          });

    });

    describe("Login", () => {

        it("Can login with registered email and password", () => {
            login(newEmail, Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
            });
        });

    });

});