/// <reference types="Cypress" />

import { roleEmail } from "../../api/Auth_APIs/auth.data";
import { login, switchRole } from "../../api/Auth_APIs/handleAuth.api";
import { commonError, userErrorMessages } from "../../message/errorMessage";
import { authSuccessMessages, commonSuccessMessages } from "../../message/successfulMessage";

let userToken, role;

describe('Switch Role', () => {

    describe('When user has not applied for any role', () => {

        before(() => {
            login(roleEmail.noRoleEmail, Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data).to.have.property('token');
                userToken = response.body.data.token;
                
            });
        });

        it('should throw error on trying to switch without role', () => {
            switchRole('', userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', `${commonError.emptyRole}`);
            });
        });
            
        it('should throw error on trying to switch to driver role', () => {
            switchRole('driver', userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', `${userErrorMessages.driverRoleNotApplied}`);
            });
        });

        it('should throw error on trying to switch to vendor role', () => {
            switchRole('vendor', userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', `${userErrorMessages.vendorRoleNotApplied}`);
            });
        });

    });

    describe('When user has applied for driver role only', () => {
        
        before(() => {
            login(roleEmail.appliedForDriverOnly, Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data).to.have.property('token');
                userToken = response.body.data.token;
            });
        });

        it('should throw warning message on trying to switch driver role', () => {
            role = 'driver'
            switchRole(role, userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', `${authSuccessMessages.applicationInReview} ${role} after being verified.`);
            });
        });

        it('should throw error on trying to switch to vendor role', () => {
            switchRole('vendor', userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', `${userErrorMessages.vendorRoleNotApplied}`);
            });
        });

    });

    describe('When user has applied for vendor role only', () => {
            
        before(() => {
            login(roleEmail.appliedForVendorOnly, Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data).to.have.property('token');
                userToken = response.body.data.token;
            });
        });
    
        it('should throw error on trying to switch to driver role', () => {
            switchRole('driver', userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', `${userErrorMessages.driverRoleNotApplied}`);
            });
        });
    
        it('should throw warning message on trying to switch vendor role', () => {
            role = 'vendor'
            switchRole(role, userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', `${authSuccessMessages.applicationInReview} ${role} after being verified.`);
            });
        });

    });

    describe('When user has applied for both driver and vendor role', () => {
                
        before(() => {
            login(roleEmail.appliedForBothRoles, Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data).to.have.property('token');
                userToken = response.body.data.token;
            });
        });
        
        it('should throw warning message on trying to switch driver role', () => {
            role = 'driver'
            switchRole(role, userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', `${authSuccessMessages.applicationInReview} ${role} after being verified.`);
            });
        });
    
        it('should throw warning message on trying to switch vendor role', () => {
            role = 'vendor'
            switchRole(role, userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', `${authSuccessMessages.applicationInReview} ${role} after being verified.`);
            });
        });
    
    });

    describe("When user's driver role only is approved", () => {

        before(() => {
            login(roleEmail.driverRoleApprovedOnly, Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data).to.have.property('token');
                userToken = response.body.data.token;
            });
        });

        it('should switch to driver role', () => {
            role = 'driver'
            switchRole(role, userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', `${commonSuccessMessages.switchedTo} ${role}`);
            });
        });

        it('should throw error on trying to switch to vendor role', () => {
            switchRole('vendor', userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', `${userErrorMessages.vendorRoleNotApplied}`);
            });
        });

    });

    describe("When user's vendor role only is approved", () => {
    
        before(() => {
            login(roleEmail.vendorRoleApprovedOnly, Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data).to.have.property('token');
                userToken = response.body.data.token;
            });
        });
    
        it('should throw error on trying to switch to driver role', () => {
            switchRole('driver', userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', `${userErrorMessages.driverRoleNotApplied}`);
            });
        });
    
        it('should switch to vendor role', () => {
            role = 'vendor'
            switchRole(role, userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', `${commonSuccessMessages.switchedTo} ${role}`);
            });
        });
    

    });

    describe('When user has applied for vendor role and driver application is approved', () => {

        before(() => {
            login(roleEmail.vendorAppliedDriverApproved, Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data).to.have.property('token');
                userToken = response.body.data.token;
            });
        });

        it('should switch to driver role', () => {
            role = 'driver'
            switchRole(role, userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', `${commonSuccessMessages.switchedTo} ${role}`);
            });
        });

        it('should throw warning message on trying to switch to vendor role', () => {
            role = 'vendor'
            switchRole(role, userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', `${authSuccessMessages.applicationInReview} ${role} after being verified.`);
            });
        });

    });

    describe('When user has applied for driver role and vendor application is approved', () => {
      
        before(() => {
            login(roleEmail.driverAppliedVendorApproved, Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data).to.have.property('token');
                userToken = response.body.data.token;
            });
        });

        it('should throw warning message on trying to switch to driver role', () => {
            role = 'driver'
            switchRole(role, userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', `${authSuccessMessages.applicationInReview} ${role} after being verified.`);
            });
        });

        it('should switch to vendor role', () => {
            role = 'vendor'
            switchRole(role, userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', `${commonSuccessMessages.switchedTo} ${role}`);
            });
        });

        
    });

    describe('When user has both roles: driver and vendor are approved', () => {
    
        before(() => {
            login(roleEmail.bothRolesApproved, Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data).to.have.property('token');
                userToken = response.body.data.token;
            });
        });
    
        it('should switch to driver role', () => {
            role = 'driver'
            switchRole(role, userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', `${commonSuccessMessages.switchedTo} ${role}`);
            });
        });
    
        it('should switch to vendor role', () => {
            role = 'vendor'
            switchRole(role, userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', `${commonSuccessMessages.switchedTo} ${role}`);
            });
        });
    
    });

});