/// <reference types="Cypress" />

import { editDriverApplication, getVehicleTypes } from "../../api/Driver_APIs/driver.api";
import { editDriverApplicationData } from "../../api/Driver_APIs/driver.data";
import { commonSuccessMessages } from "../../message/successfulMessage";
import { login } from "../../api/Auth_APIs/handleAuth.api";
import { commonError, userErrorMessages } from "../../message/errorMessage";
import { roleEmail } from "../../api/Auth_APIs/auth.data";

let userToken;
let vehicleType = '';

describe('Driver Edit Application API Testing', () => {

    describe('With Login', () => {

        describe('User is an approved Driver and tries to edit the application', () => {

            before(() => {
                login(roleEmail.approvedDriver, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
               });
            });

            it('Should return all vehicle types', () => {
                getVehicleTypes(userToken).then((response) => {
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
                    expect(response.body).to.have.property('message', `${userErrorMessages.alreadyVerified} driver role. ${userErrorMessages.pleaseSwitch} driver role.`);
                });
            });
        });

        describe('User has not applied for Driver and tries to edit the application', () => {
                
            before(() => {
                login(roleEmail.noRoleEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });
    
            it('Should throw error on trying to edit the application', () => {
                const x = {...editDriverApplicationData, vehicle_type: vehicleType};
                editDriverApplication(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${userErrorMessages.notApplied} driver`);
                });
            });
        });

        describe('User has applied for Driver and wants to edit the application', () => {

            before(() => {
                login(roleEmail.driverAppliedEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });
    
            it('Should throw error on trying to edit the application leaving work_permit empty', () => {
                const var1 = 'work_permit';
                const x = {...editDriverApplicationData, vehicle_type: vehicleType, [var1]: ''};
                editDriverApplication(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${commonError.empty}`);
                });
            });

            it('Should throw error on trying to edit the application entering number in work_permit field', () => {
                const var1 = 'work_permit';
                const x = {...editDriverApplicationData, vehicle_type: vehicleType, [var1]: 123};
                editDriverApplication(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${commonError.moreThan2Characters}`);
                });
            });

            it('Should throw error on trying to edit the application leaving citizenship_number', () => {
                const var1 = 'citizenship_number';
                const x = {...editDriverApplicationData, vehicle_type: vehicleType, [var1]: ''};
                editDriverApplication(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${commonError.empty}`);
                });
            });

            it('Should throw error on trying to edit the application leaving vehicle_type empty', () => {
                const var1 = 'vehicle_type';
                const x = {...editDriverApplicationData, [var1]: ''};
                editDriverApplication(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${commonError.empty}`);
                });
            });

            it('Should throw error on trying to edit the application entering invalid data in vehicle_type field', () => {
                const var1 = 'vehicle_type';
                const x = {...editDriverApplicationData, [var1]: 123};
                editDriverApplication(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${commonError.mustBeString}`);
                });
            });

            it('Should throw error on trying to edit the application leaving vehicle_registration_number empty', () => {
                const var1 = 'vehicle_registration_number';
                const x = {...editDriverApplicationData, vehicle_type: vehicleType, [var1]: ''};
                editDriverApplication(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${commonError.empty}`);
                });
            });

            it('Should throw error on trying to edit the application entering invalid data in vehicle_registration_number field', () => {
                const var1 = 'vehicle_registration_number';
                const x = {...editDriverApplicationData, vehicle_type: vehicleType, [var1]: 123};
                editDriverApplication(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${commonError.moreThan2Characters}`);
                });
            });

            it('Should throw error on trying to edit the application leaving license_number empty', () => {
                const var1 = 'license_number';
                const x = {...editDriverApplicationData, vehicle_type: vehicleType, [var1]: ''};
                editDriverApplication(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${commonError.empty}`);
                });
            });

            it('Should throw error on trying to edit the application entering invalid data in license_number field', () => {
                const var1 = 'license_number';
                const x = {...editDriverApplicationData, vehicle_type: vehicleType, [var1]: 123};
                editDriverApplication(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${commonError.moreThan2Characters}`);
                });
            });

            it('Should throw error on trying to edit the application leaving state_id empty', () => {
                const var1 = 'state_id';
                const x = {...editDriverApplicationData, vehicle_type: vehicleType, [var1]: ''};
                editDriverApplication(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${commonError.empty}`);
                });
            });

            it('Should throw error on trying to edit the application entering invalid data in state_id field', () => {
                const var1 = 'state_id';
                const x = {...editDriverApplicationData, vehicle_type: vehicleType, [var1]: 123};
                editDriverApplication(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${commonError.moreThan2Characters}`);
                });
            });

        });

    });

    describe('Without Login', () => {

        it('should throw error 401', () => {
            editDriverApplication(editDriverApplicationData, '').then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', commonError.unauthorized);
            });
        });
    });

});