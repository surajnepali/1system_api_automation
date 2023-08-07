/// <reference types="Cypress" />

import { login } from "../../api/Auth_APIs/handleAuth.api";
import { applyDriver, getVehicleTypes } from "../../api/Driver_APIs/driver.api";
import { driverRole } from "../../api/Driver_APIs/driver.data";
import { commonSuccessMessages } from "../../message/successfulMessage";

let userToken;
let driverType = 'car';

describe('User apply for Driver API Testing', () => {

    describe('Return vehicle Types', () => {

        before(() => {
            login(Cypress.env('registeredEmail'), Cypress.env('password'), 'email').then((response) => {
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

    describe('After Login', () => {

        describe('User has already applied for Driver Role and is approved', () => {

            before(() => {
                login(driverRole.approvedDriverEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });

            it('should throw error on trying to apply for driver again.', () => {
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
                                    expect(response.status).to.eq(400);
                                });
                            });
                    });
                    
            });

        });

        describe('User has not applied for Driver Role', () => {

            before(() => {
                login(Cypress.env('newEmail'), Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });

            it('should throw error on trying to apply for driver leaving work_permit empty.', () => {
                cy.fixture('driverBack.jpg', 'binary')
                    .then((file1) => Cypress.Blob.binaryStringToBlob(file1, 'image/jpg'))
                    .then((blob1) => {
                        cy.fixture('driverFront.jpg', 'binary')
                            .then((file2) => Cypress.Blob.binaryStringToBlob(file2, 'image/jpg'))
                            .then((blob2) => {
                                let formData = new FormData();
                                formData.append('work_permit', '');
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
                                    expect(response.status).to.eq(400);
                                });
                            });
                    });

            });

            it('should throw error on trying to apply for driver leaving citizenship_number empty.', () => {
                cy.fixture('driverBack.jpg', 'binary')
                    .then((file1) => Cypress.Blob.binaryStringToBlob(file1, 'image/jpg'))
                    .then((blob1) => {
                        cy.fixture('driverFront.jpg', 'binary')
                            .then((file2) => Cypress.Blob.binaryStringToBlob(file2, 'image/jpg'))
                            .then((blob2) => {
                                let formData = new FormData();
                                formData.append('work_permit', 1234);
                                formData.append('citizenship_number', '');
                                formData.append('vehicle_type', driverType);
                                formData.append('vehicle_registration', 1234567);
                                formData.append('license_number', 12);
                                formData.append('state_id', 12);
                                formData.append('license_back', blob1, 'driverBack.jpg');
                                formData.append('license_front', blob2, 'driverFront.jpg');
                                formData.append('work_type', 'full_time');
                                formData.append('contact', 4157637461);

                                applyDriver(formData, userToken).then((response) => {
                                    expect(response.status).to.eq(400);
                                });
                            });
                    });

            });

            it('should throw error on trying to apply for driver leaving vehicle_type empty.', () => {
                cy.fixture('driverBack.jpg', 'binary')
                    .then((file1) => Cypress.Blob.binaryStringToBlob(file1, 'image/jpg'))
                    .then((blob1) => {
                        cy.fixture('driverFront.jpg', 'binary')
                            .then((file2) => Cypress.Blob.binaryStringToBlob(file2, 'image/jpg'))
                            .then((blob2) => {
                                let formData = new FormData();
                                formData.append('work_permit', 1234);
                                formData.append('citizenship_number', 12345678);
                                formData.append('vehicle_type', '');
                                formData.append('vehicle_registration', 1234567);
                                formData.append('license_number', 12);
                                formData.append('state_id', 12);
                                formData.append('license_back', blob1, 'driverBack.jpg');
                                formData.append('license_front', blob2, 'driverFront.jpg');
                                formData.append('work_type', 'full_time');
                                formData.append('contact', 4157637461);

                                applyDriver(formData, userToken).then((response) => {
                                    expect(response.status).to.eq(400);
                                });
                            });
                    });

            });

            it('should throw error on trying to apply for driver entering string in vehicle_type field.', () => {
                cy.fixture('driverBack.jpg', 'binary')
                    .then((file1) => Cypress.Blob.binaryStringToBlob(file1, 'image/jpg'))
                    .then((blob1) => {
                        cy.fixture('driverFront.jpg', 'binary')
                            .then((file2) => Cypress.Blob.binaryStringToBlob(file2, 'image/jpg'))
                            .then((blob2) => {
                                let formData = new FormData();
                                formData.append('work_permit', 1234);
                                formData.append('citizenship_number', 12345678);
                                formData.append('vehicle_type', 12345);
                                formData.append('vehicle_registration', 1234567);
                                formData.append('license_number', 12);
                                formData.append('state_id', 12);
                                formData.append('license_back', blob1, 'driverBack.jpg');
                                formData.append('license_front', blob2, 'driverFront.jpg');
                                formData.append('work_type', 'full_time');
                                formData.append('contact', 4157637461);

                                applyDriver(formData, userToken).then((response) => {
                                    expect(response.status).to.eq(400);
                                });
                            });
                    });

            });

            it('should throw error on trying to apply for driver leaving vehicle_registration empty.', () => {
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
                                formData.append('vehicle_registration', '');
                                formData.append('license_number', 12);
                                formData.append('state_id', 12);
                                formData.append('license_back', blob1, 'driverBack.jpg');
                                formData.append('license_front', blob2, 'driverFront.jpg');
                               formData.append('work_type', 'full_time');
                                formData.append('contact', 4157637461);

                                applyDriver(formData, userToken).then((response) => {
                                    expect(response.status).to.eq(400);
                                });
                            });
                    });

            });

            it('should throw error on trying to apply for driver leaving license_number empty.', () => {
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
                                formData.append('license_number', '');
                                formData.append('state_id', 12);
                                formData.append('license_back', blob1, 'driverBack.jpg');
                                formData.append('license_front', blob2, 'driverFront.jpg');
                                formData.append('work_type', 'full_time');
                                formData.append('contact', 4157637461);

                                applyDriver(formData, userToken).then((response) => {
                                    expect(response.status).to.eq(400);
                                });
                            });
                    });

            });

            it('should throw error on trying to apply for driver leaving state_id empty.', () => {
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
                                formData.append('state_id', '');
                                formData.append('license_back', blob1, 'driverBack.jpg');
                                formData.append('license_front', blob2, 'driverFront.jpg');
                                formData.append('work_type', 'full_time');
                                formData.append('contact', 4157637461);

                                applyDriver(formData, userToken).then((response) => {
                                    expect(response.status).to.eq(400);
                                });
                            });
                    });

            });

            it('should throw error on trying to apply for driver leaving license_back empty.', () => {
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
                        formData.append('license_back', '');
                        formData.append('license_front', blob2, 'driverFront.jpg');
                        formData.append('work_type', 'full_time');
                        formData.append('contact', 4157637461);

                        applyDriver(formData, userToken).then((response) => {
                            expect(response.status).to.eq(400);
                        });
                    });

            });

            it('should throw error on trying to apply for driver putting image more than 2 MB.', () => {
                cy.fixture('sample.jpg', 'binary')
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
                                formData.append('license_back', blob1, 'sample.jpg');
                                formData.append('license_front', blob2, 'driverFront.jpg');
                                formData.append('work_type', 'full_time');
                                formData.append('contact', 4157637461);

                                applyDriver(formData, userToken).then((response) => {
                                    expect(response.status).to.eq(400);
                                });
                            });
                    });

            });

            it('should throw error on trying to apply for driver putting leaving license_front empty.', () => {
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
                                formData.append('license_front', '');
                                formData.append('work_type', 'full_time');
                                formData.append('contact', 4157637461);

                                applyDriver(formData, userToken).then((response) => {
                                    expect(response.status).to.eq(400);
                                });
                            });
                    });

            });

            it('should throw error on trying to apply for driver putting image more than 2 MB.', () => {
                cy.fixture('driverBack.jpg', 'binary')
                    .then((file1) => Cypress.Blob.binaryStringToBlob(file1, 'image/jpg'))
                    .then((blob1) => {
                        cy.fixture('sample.jpg', 'binary')
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
                                formData.append('license_front', blob2, 'sample.jpg');
                                formData.append('work_type', 'full_time');
                                formData.append('contact', 4157637461);

                                applyDriver(formData, userToken).then((response) => {
                                    expect(response.status).to.eq(400);
                                });
                            });
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

        describe('User has already applied for Driver Role', () => {
            
            before(() => {
                login(driverRole.appliedDriverEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });

            it('should throw error on trying to apply for driver again.', () => {
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
                                    expect(response.status).to.eq(400);
                                });
                            });
                    });

            });

        });

    });

});