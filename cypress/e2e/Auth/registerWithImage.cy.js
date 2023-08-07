/// <reference types="cypress" />

import { registerCustomerWithImage, setOTP, verifyOTP } from '../../api/Auth_APIs/handleAuth.api';
import { commonSuccessMessages } from '../../message/successfulMessage';

let otp;
describe('Register Customer', () => {


  it('Can send otp to new email', () => {
    setOTP(Cypress.env('newEmail'), 'verifyEmail').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('message', `${commonSuccessMessages.otpEmailSent}`);
        expect(response.body).to.have.property('data');
        expect(response.body.data).to.have.property('otp');
        otp = response.body.data.otp;
        cy.log(otp);
      });
    });

  it('Can verify otp with valid otp', () => {
    verifyOTP(Cypress.env('newEmail'), 'verifyEmail', otp)
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('message', `${commonSuccessMessages.otpVerified}`);
      });
  });


  it('should throw status code of 400', () => {
    cy.fixture('sample.jpg', 'binary')
      .then((file) => Cypress.Blob.binaryStringToBlob(file, 'image/jpg'))
      .then((blob) => {
        let formData = new FormData();
        formData.append('email', Cypress.env('newEmail'));
        formData.append('password', Cypress.env('password'));
        formData.append('username', 'John Doe');
        formData.append('otp', otp);
        formData.append('estimated_service_usage', 12);
        formData.append('profile_picture', blob, 'sample.jpg');
        formData.append('loginAgent', 'email');

        registerCustomerWithImage(formData).then((response) => {
          expect(response.status).to.eq(400);
          console.log(response.body);
        });
      });
  });

  it('should throw status code of 200', () => {
    cy.fixture('person.jpg', 'binary')
      .then((file) => Cypress.Blob.binaryStringToBlob(file, 'image/jpg'))
      .then((blob) => {
        let formData = new FormData();
        formData.append('email', Cypress.env('newEmail'));
        formData.append('password', Cypress.env('password'));
        formData.append('username', 'John Doe');
        formData.append('otp', otp);
        formData.append('estimated_service_usage', 12);
        formData.append('profile_picture', blob, 'person.jpg');
        formData.append('loginAgent', 'email');

        registerCustomerWithImage(formData).then((response) => {
          expect(response.status).to.eq(200);
        });
      });
  });
});
