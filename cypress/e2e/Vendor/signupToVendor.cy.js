/// <reference types="cypress" />

import { adminLogin } from "../../api/Admin_APIs/adminDriver.api";
import { approveVendor, getAllNotVerifiedVendors } from "../../api/Admin_APIs/adminVendor.api";
import { randomEmail } from "../../api/Auth_APIs/auth.data";
import { login, registerCustomerWithImage, setOTP, switchRole, verifyOTP } from "../../api/Auth_APIs/handleAuth.api";
import { onboardPayment } from "../../api/Payment_APIs/handlePayment.api";
import { applyForVendor } from "../../api/Vendor_APIs/handleVendor.api";
import { vendorCreateData } from "../../api/Vendor_APIs/vendor.data";
import { pageOptions } from "../../constants/apiOptions.constants";
import { commonSuccessMessages, paymentSuccesMessages } from "../../message/successfulMessage";

let otp, email, userToken, vendorToken, adminToken, vendorId;
let connectUrl, role;

Cypress.on('uncaught:exception', (err, runnable) => {
    // You can choose to handle the error here or simply prevent Cypress from failing the test
    return false; // Return false to prevent Cypress from failing the test
  });

describe("Journey from Signing up to being a verified Vendor", () => {

    describe("First: Sign up", () => {

        email = randomEmail.email;
        it('Can send otp to new email', () => {
            setOTP(email, 'verifyEmail').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', `${commonSuccessMessages.otpEmailSent}`);
                expect(response.body).to.have.property('data');
                expect(response.body.data).to.have.property('otp');
                otp = response.body.data.otp;
                cy.log(otp);
              });
            });
        
        it('Can verify otp with valid otp', () => {
            verifyOTP(email, 'verifyEmail', otp).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', `${commonSuccessMessages.otpVerified}`);
            });
        });

        it('should throw status code of 200', () => {
            cy.fixture('person.jpg', 'binary')
                .then((file) => Cypress.Blob.binaryStringToBlob(file, 'image/jpg'))
                .then((blob) => {
                    let formData = new FormData();
                    formData.append('email', email);
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

    describe("Second: Login and Apply for Vendor", () => {

        it("Can login with registered email and password", () => {
            login(email, Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                expect(response.body).to.have.property('data');
                expect(response.body.data).to.have.property('token');
                userToken = response.body.data.token;
            });
        });

        
        it('Should apply for vendor successfully', () => {           
            cy.fixture('vendorRegistrationDocument.jpg', 'binary')
                .then((file) => Cypress.Blob.binaryStringToBlob(file, 'image/jpg'))
                .then((blob) => {
                        
                    let formData = new FormData();
                    formData.append('company_name', vendorCreateData.vendorName);
                    formData.append('state_id', vendorCreateData.vendorStateId);
                    formData.append('name', vendorCreateData.branchName);
                    formData.append('registration_document', blob, 'vendorRegistrationDocument.jpg');
                    formData.append('landmark', vendorCreateData.vendorLandmark);
                    formData.append('contact', vendorCreateData.vendorContact);
                    formData.append('place_id', vendorCreateData.vendorPlaceId);
                    formData.append('company_email', vendorCreateData.vendorEmail);
                    formData.append('longitude', vendorCreateData.vendorLongitude);
                    formData.append('latitude', vendorCreateData.vendorLatitude);

                    applyForVendor(formData, userToken).then((response) => {
                        expect(response.status).to.eq(200);
                    });
                });
        });

    });

    describe("Third: Admin logs in and approves the application", () => {
                
        it("Can login with admin email and password", () => {
            adminLogin(Cypress.env('adminEmail'), Cypress.env('adminPassword')).then((response) => {
                expect(response.status).to.eq(200);
                adminToken = response.body.data.token;
            });
        });

        it("Should get all the not verified drivers", () => {
            getAllNotVerifiedVendors(pageOptions.PAGE, pageOptions.LIMIT, adminToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('data');
                const data = response.body.data.data;
                const object = data.find((vendor) => vendor.email === email);
                cy.log(JSON.stringify(object));
                vendorId = object.vendor.id
                cy.log("Driver ID: " + vendorId);
            });
        });

        it("Should approve the driver", () => {
            approveVendor(vendorId, adminToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', "Successfully accepted");
            });
        });

    });

    describe("User switches to the vendor account", () => {

        it("should switch to vendor role", () => {
            switchRole('vendor', userToken).then((response) => {
                expect(response.status).to.eq(200);
                vendorToken = response.body.data.token;
            });
        });

    });

    describe("Setup Payout", () => {

        it("Should onboard a vendor to connect for payout", () => {
            role = 'vendor';
            onboardPayment(vendorToken, role).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', paymentSuccesMessages.onboard);
                connectUrl = response.body.data.url;
                cy.log(connectUrl);
                cy.visit(connectUrl);
                cy.get('input[id="phone_number"]').type('0000000000');
                cy.get('[data-test="phone-entry-submit"]').click();
                cy.wait(5000);
                cy.get('[data-test="test-mode-fill-button"]').click();
                cy.wait(10000);
                cy.get('input[id="first_name"]').type('John');
                cy.get('input[id="last_name"]').type('Doe');
                cy.get('input[id="email"]').type(email);
                cy.get('#dob').type('01');
                cy.get(':nth-child(3) > .Box-root > .Input').type('01');
                cy.get(':nth-child(5) > .Box-root > .Input').type('1901');
                cy.get('input[placeholder="Address line 1"]').type('1 Line Drive');
                cy.get('input[placeholder="City"]').type('Manchester');
                cy.get('select#subregion').select('New Hampshire');
                cy.get('input[placeholder="ZIP"]').type('03101');
                cy.get('input[id="phone"]').type('0000000000');
                cy.get('input[id="ssn_last_4"]').type('0000');
                cy.get('[data-test="bizrep-submit-button"]').click();
                cy.wait(8000);
                cy.get('.SearchableSelect-element').click();
                cy.get('div[class="Box-root Padding-left--16"]').contains('Software').click();
                cy.get('[data-test="company-submit-button"]').click();
                cy.wait(20000);
                cy.get('span').contains('Debit card').click();
                cy.wait(2000);
                cy.get('span').contains('Use test card').click();
                cy.wait(5000);
                cy.get('div.ContentFooter-end.Box-root.Flex-flex.Flex-alignItems--center.Flex-justifyContent--flexStart').click();
                cy.wait(10000);
            });
        });

    });
    
});