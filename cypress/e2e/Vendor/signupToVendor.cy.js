/// <reference types="cypress" />

import { adminLogin } from "../../api/Admin_APIs/adminDriver.api";
import { approveVendor, getAllNotVerifiedVendors } from "../../api/Admin_APIs/adminVendor.api";
import { randomEmail } from "../../api/Auth_APIs/auth.data";
import { login, registerCustomerWithImage, setOTP, switchRole, verifyOTP } from "../../api/Auth_APIs/handleAuth.api";
import { applyForVendor } from "../../api/Vendor_APIs/handleVendor.api";
import { vendorCreateData } from "../../api/Vendor_APIs/vendor.data";
import { pageOptions } from "../../constants/apiOptions.constants";
import { commonSuccessMessages } from "../../message/successfulMessage";

let otp, email, userToken, adminToken, vendorId;

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
            });
        });

    });
    
});