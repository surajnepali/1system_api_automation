/// reference types="cypress" />

import register from '../../api/register.api';
import ERROR from '../../message/errorMessage';
import SUCCESSFUL from '../../message/successfulMessage';
import { createUserData } from '../../api/Auth_APIs/auth.data';
import { registerCustomer, setOTP, verifyOTP } from '../../api/Auth_APIs/handleAuth.api';

let otp;

describe('Register', () => {
  describe('setOTP', () => {
    it("Can't send otp to already registered email", () => {
      setOTP(Cypress.env('registeredEmail'), 'verifyEmail')
        .then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body).to.have.property(
            'message',
            'User with email ' +
              Cypress.env('registeredEmail') +
              ' already exist. Login with email'
          );
        });
    });

    it("Can't send otp to empty email", () => {
      setOTP('', 'verifyEmail').then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('message', ERROR.emptyEmail);
      });
    });

    it("Can't send otp to invalid email", () => {
      setOTP('invalidemail', 'verifyEmail').then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('message', ERROR.invalidEmail);
      });
    });

    it("Can't send otp to email with invalid purpose", () => {
      setOTP(Cypress.env('newEmail'), 'invalidPurpose')
        .then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body).to.have.property(
            'message',
            ERROR.invalidPurpose
          );
        });
    });

    it("Can't send otp to email with empty purpose", () => {
      setOTP(Cypress.env('newEmail'), '').then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('message', ERROR.emptyPurpose);
      });
    });

    it("Can't send otp to empty email and purpose", () => {
      setOTP('', '').then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('message', ERROR.emptyEmail);
      });
    });

    it('Can send otp to new email', () => {
      setOTP(Cypress.env('newEmail'), 'verifyEmail')
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property(
            'message',
            SUCCESSFUL.otpEmailSent
          );
          expect(response.body).to.have.property('data');
          expect(response.body.data).to.have.property('otp');
          otp = response.body.data.otp;
          cy.log(otp);
        });
    });
  });

  describe('verifyOTP', () => {
    it("Can't verify otp with invalid email", () => {
      verifyOTP('invalidemail', 'verifyEmail', otp)
        .then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body).to.have.property('message', ERROR.invalidEmail);
        });
    });

    it("Can't verify otp with empty email", () => {
      verifyOTP('', 'verifyEmail', otp).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('message', ERROR.invalidEmail);
      });
    });

    it("Can't verify otp with invalid purpose", () => {
      verifyOTP(Cypress.env('newEmail'), 'invalidPurpose', otp)
        .then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body).to.have.property(
            'message',
            ERROR.invalidPurpose
          );
        });
    });

    it("Can't verify otp with empty purpose", () => {
      verifyOTP(Cypress.env('newEmail'), '', otp).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('message', ERROR.emptyPurpose);
      });
    });

    it("Can't verify otp with invalid otp", () => {
      verifyOTP(Cypress.env('newEmail'), 'verifyEmail', 'invalidotp')
        .then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body).to.have.property('message', ERROR.invalidOtp);
        });
    });

    it("Can't verify otp with empty otp", () => {
      verifyOTP(Cypress.env('newEmail'), 'verifyEmail', '')
        .then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body).to.have.property('message', ERROR.emptyOtp);
        });
    });

    it('Can verify otp with valid otp', () => {
      verifyOTP(Cypress.env('newEmail'), 'verifyEmail', otp)
        .then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property(
            'message',
            SUCCESSFUL.otpVerified
          );
        });
    });
  });

  describe('registerCustomer', () => {
    it("Can't register with invalid email", () => {
      const invalidEmail = 'wjhvekwj';
      const x = {...createUserData, otp: otp, email: invalidEmail}
      registerCustomer(x).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body).to.have.property('message', ERROR.invalidEmail);
        });
    });

    it("Can't register with empty email", () => {
      const newEmail = '';
      const x = {...createUserData, otp: otp, email: newEmail}
      registerCustomer(x).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body).to.have.property('message', ERROR.emptyEmail);
        });
    });

    it("Can't register with invalid username", () => {
      const newEmail = Cypress.env('newEmail');
      const x = {...createUserData, otp: otp, email: newEmail, username: 'username123'}
      registerCustomer(x).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body).to.have.property(
            'message',
            ERROR.invalidUsername
          );
        });
    });

    it("Can't register with empty username", () => {
      const newEmail = Cypress.env('newEmail');
      const x = {...createUserData, otp: otp, email: newEmail, username: ''}
      registerCustomer(x).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body).to.have.property(
            'message',
            ERROR.emptyUsername
          );
        });
    });

    it("Can't register with empty password", () => {
      const newEmail = Cypress.env('newEmail');
      const x = {...createUserData, otp: otp, email: newEmail, password: ''}
      registerCustomer(x).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body).to.have.property(
            'message',
            ERROR.invalidPassword
          );
        });
    });

    it("Can't register with invalid otp", () => {
      const newEmail = Cypress.env('newEmail');
      const x = {...createUserData, otp: '1234', email: newEmail}
      registerCustomer(x).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('message', ERROR.notMatchedPassword);
      });
    });

    it("Can't register with invalid otp that is more than 4 characters", () => {
      const newEmail = Cypress.env('newEmail');
      const x = {...createUserData, otp: '123456', email: newEmail}
      registerCustomer(x).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property('message', ERROR.invalidOtp);
      });
    });

    it("Can't register with empty otp", () => {
      const newEmail = Cypress.env('newEmail');
      const x = {...createUserData, otp: '', email: newEmail}
      registerCustomer(x).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body).to.have.property('message', ERROR.emptyOtp);
        });
    });

    it("Can't register with invalid estimated_service_usage", () => {
      const newEmail = Cypress.env('newEmail');
      const x = {...createUserData, otp: otp, email: newEmail, estimated_service_usage: 'invalid'}
      registerCustomer(x).then((response) => {
          expect(response.status).to.eq(400);
          expect(response.body).to.have.property(
            'message',
            ERROR.invalidEstimatedServiceUsage
          );
        });
    });

    it('Can register with valid data', () => {
      const newEmail = Cypress.env('newEmail');
      const x = {...createUserData, otp: otp, email: newEmail}
      registerCustomer(x).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('message', SUCCESSFUL.customerRegistered);
      });
    });
  });
});