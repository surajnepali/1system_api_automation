/// <reference types="cypress" />

import { adminLogin, approveDriver, getAllNotVerifiedDrivers } from "../../api/Admin_APIs/adminDriver.api";
import { randomEmail } from "../../api/Auth_APIs/auth.data";
import { login, registerCustomerWithImage, setOTP, verifyOTP } from "../../api/Auth_APIs/handleAuth.api";
import { applyDriver, getVehicleTypes } from "../../api/Driver_APIs/driver.api";
import { orderAccessEmails } from "../../api/Order_APIs/order.data";
import { pageOptions } from "../../constants/apiOptions.constants";
import { commonSuccessMessages } from "../../message/successfulMessage";

let otp, email, userToken, adminToken, driverType, driverId;

describe("Journey from Signing up to being a verified Driver", () => {

    describe('Return vehicle Types', () => {

        before(() => {
            login(orderAccessEmails.approvedDriverEmail, Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                expect(response.body).to.have.property('data');
                expect(response.body.data).to.have.property('token');
                userToken = response.body.data.token;
            });
        });

        it('should select one random vehicle type', () => {
            getVehicleTypes(userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('data');
                expect(response.body.data).to.have.property('types');
                const vehicleTypes = response.body.data.types;
                const randomVehicleType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
                driverType = randomVehicleType;
                cy.log(driverType);
            });
        });
            
    });

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

    describe("Second: Login and Apply for Driver", () => {

        it("Can login with registered email and password", () => {
            login(email, Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                expect(response.body).to.have.property('data');
                expect(response.body.data).to.have.property('token');
                userToken = response.body.data.token;
            });
        });

        it('should successfully apply for driver', () => {
            cy.fixture('driverBack.jpg', 'binary')
                .then((file1) => Cypress.Blob.binaryStringToBlob(file1, 'image/jpg'))
                .then((blob1) => {
                    cy.fixture('driverFront.jpg', 'binary')
                        .then((file2) => Cypress.Blob.binaryStringToBlob(file2, 'image/jpg'))
                        .then((blob2) => {
                            let formData = new FormData();
                            formData.append('work_permit', 1234);
                            formData.append('citizenship_number', 12345678);
                            formData.append('vehicle_type', driverType);
                            formData.append('vehicle_registration', 1234567);
                            formData.append('license_number', 12);
                            formData.append('state_id', 12);
                            formData.append('license_back', blob1, 'driverBack.jpg');
                            formData.append('license_front', blob2, 'driverFront.jpg');
                            formData.append('work_type', 'full_time');
                            formData.append('contact', 4157637461);

                            applyDriver(formData, userToken).then((response) => {
                                expect(response.status).to.eq(200);
                            });
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
            getAllNotVerifiedDrivers(pageOptions.PAGE, pageOptions.LIMIT, adminToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('data');
                const data = response.body.data.data;
                const object = data.find((driver) => driver.email === email);
                cy.log(JSON.stringify(object));
                driverId = object.driver.id
                cy.log("Driver ID: " + driverId);
            });
        });

        it("Should approve the driver", () => {
            approveDriver(driverId, adminToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', "Successfully updated.");
            });
        });

    });

});