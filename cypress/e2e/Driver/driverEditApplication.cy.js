/// <reference types="Cypress" />

import { editDriverApplication } from "../../api/Driver_APIs/driver.api";
import loginApi from "../../api/login.api";
import { driverRole, editDriverApplicationData } from "../../api/Driver_APIs/driver.data";
import SUCCESSFUL from "../../message/successfulMessage";
import { driverErrorMessages } from "../../message/Error/Driver/driverErrorMessages";
import getVehicleTypesApi from "../../api/getVehicleTypes.api";

let userToken;
let vehicleType = '';

describe('Driver Edit Application API Testing', () => {

    describe('With Login', () => {

        describe('User is an approved Driver and tries to edit the application', () => {

            before(() => {
                loginApi.loginUser(driverRole.approvedDriverEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
               });
            });

            it('Should return all vehicle types', () => {
                getVehicleTypesApi.getVehicleTypes(userToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('types');
                    const vehicleTypes = response.body.data.types;
                    const randomVehicleType = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
                    vehicleType = randomVehicleType;
                });
            });
    
            it('Should throw error on trying to edit the application', () => {
                const x = {...editDriverApplicationData, vehicle_type: vehicleType};
                editDriverApplication(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', driverErrorMessages.alreadyVerified);
                });
            });
        });

        describe('User has not applied for Driver and tries to edit the application', () => {
                
            before(() => {
                loginApi.loginUser(driverRole.freshEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });
    
            it('Should throw error on trying to edit the application', () => {
                const x = {...editDriverApplicationData, vehicle_type: vehicleType};
                editDriverApplication(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', driverErrorMessages.notApplied);
                });
            });
        });

        describe('User has applied for Driver and wants to edit the application', () => {

            before(() => {
                loginApi.loginUser(driverRole.appliedDriverEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });
    
            it('Should throw error on trying to edit the application leaving work_permit empty', () => {
                const var1 = 'work_permit';
                const x = {...editDriverApplicationData, vehicle_type: vehicleType, [var1]: ''};
                editDriverApplication(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${driverErrorMessages.emptyField}`);
                });
            });

            it('Should throw error on trying to edit the application entering number in work_permit field', () => {
                const var1 = 'work_permit';
                const x = {...editDriverApplicationData, vehicle_type: vehicleType, [var1]: 123};
                editDriverApplication(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${driverErrorMessages.invalidData}`);
                });
            });

            it('Should throw error on trying to edit the application leaving citizenship_number', () => {
                const var1 = 'citizenship_number';
                const x = {...editDriverApplicationData, vehicle_type: vehicleType, [var1]: ''};
                editDriverApplication(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${driverErrorMessages.emptyField}`);
                });
            });

            it('Should throw error on trying to edit the application leaving vehicle_type empty', () => {
                const var1 = 'vehicle_type';
                const x = {...editDriverApplicationData, [var1]: ''};
                editDriverApplication(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${driverErrorMessages.emptyField}`);
                });
            });

            it('Should throw error on trying to edit the application entering invalid data in vehicle_type field', () => {
                const var1 = 'vehicle_type';
                const x = {...editDriverApplicationData, [var1]: 123};
                editDriverApplication(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${driverErrorMessages.invalidVehicleType}`);
                });
            });

            it('Should throw error on trying to edit the application leaving vehicle_registration_number empty', () => {
                const var1 = 'vehicle_registration_number';
                const x = {...editDriverApplicationData, vehicle_type: vehicleType, [var1]: ''};
                editDriverApplication(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${driverErrorMessages.emptyField}`);
                });
            });

            it('Should throw error on trying to edit the application entering invalid data in vehicle_registration_number field', () => {
                const var1 = 'vehicle_registration_number';
                const x = {...editDriverApplicationData, vehicle_type: vehicleType, [var1]: 123};
                editDriverApplication(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${driverErrorMessages.invalidData}`);
                });
            });

            it('Should throw error on trying to edit the application leaving license_number empty', () => {
                const var1 = 'license_number';
                const x = {...editDriverApplicationData, vehicle_type: vehicleType, [var1]: ''};
                editDriverApplication(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${driverErrorMessages.emptyField}`);
                });
            });

            it('Should throw error on trying to edit the application entering invalid data in license_number field', () => {
                const var1 = 'license_number';
                const x = {...editDriverApplicationData, vehicle_type: vehicleType, [var1]: 123};
                editDriverApplication(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${driverErrorMessages.invalidData}`);
                });
            });

            it('Should throw error on trying to edit the application leaving state_id empty', () => {
                const var1 = 'state_id';
                const x = {...editDriverApplicationData, vehicle_type: vehicleType, [var1]: ''};
                editDriverApplication(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${driverErrorMessages.emptyField}`);
                });
            });

            it('Should throw error on trying to edit the application entering invalid data in state_id field', () => {
                const var1 = 'state_id';
                const x = {...editDriverApplicationData, vehicle_type: vehicleType, [var1]: 123};
                editDriverApplication(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${driverErrorMessages.invalidData}`);
                });
            });

        });

    });

    describe('Without Login', () => {

        it('should throw error 401', () => {
            editDriverApplication(editDriverApplicationData, null).then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', 'Unauthorized access');
            });
        });
    });

});