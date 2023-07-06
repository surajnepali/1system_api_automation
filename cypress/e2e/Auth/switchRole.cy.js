/// <reference types="Cypress" />

import { login, switchRole } from "../../api/Auth_APIs/handleAuth.api";
import ERROR from "../../message/errorMessage";
import SUCCESSFUL from "../../message/successfulMessage";

let userToken;

describe('Switch Role', () => {

    describe('When user has not applied for any role', () => {

        before(() => {
            login(Cypress.env('userWithNoRole'), Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data).to.have.property('token');
                userToken = response.body.data.token;
                
            });
        });

        it('should throw error on trying to switch without role', () => {
            switchRole('', userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.emptyRole);
            });
        });
            
        it('should throw error on trying to switch to driver role', () => {
            switchRole('driver', userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.driverRoleNotApplied);
            });
        });

        it('should throw error on trying to switch to vendor role', () => {
            switchRole('vendor', userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.vendorRoleNotApplied);
            });
        });

    });

    describe('When user has applied for driver role only', () => {
        
        before(() => {
            login(Cypress.env('userAppliedForDriverOnly'), Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data).to.have.property('token');
                userToken = response.body.data.token;
            });
        });

        it('should throw warning message on trying to switch driver role', () => {
            switchRole('driver', userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.driverApplicationInReview);
            });
        });

        it('should throw error on trying to switch to vendor role', () => {
            switchRole('vendor', userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.vendorRoleNotApplied);
            });
        });

    });

    describe('When user has applied for vendor role only', () => {
            
        before(() => {
            login(Cypress.env('userAppliedForVendorOnly'), Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data).to.have.property('token');
                userToken = response.body.data.token;
            });
        });
    
        it('should throw error on trying to switch to driver role', () => {
            switchRole('driver', userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.driverRoleNotApplied);
            });
        });
    
        it('should throw warning message on trying to switch vendor role', () => {
            switchRole('vendor', userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.vendorApplicationInReview);
            });
        });

    });

    describe('When user has applied for both driver and vendor role', () => {
                
        before(() => {
            login(Cypress.env('userAppliedForBothRoles'), Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data).to.have.property('token');
                userToken = response.body.data.token;
            });
        });
        
        it('should throw warning message on trying to switch driver role', () => {
            switchRole('driver', userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.driverApplicationInReview);
            });
        });
    
        it('should throw warning message on trying to switch vendor role', () => {
            switchRole('vendor', userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.vendorApplicationInReview);
            });
        });
    
    });

    describe("When user's driver role only is approved", () => {

        before(() => {
            login(Cypress.env('userWithDriverRoleApproved'), Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data).to.have.property('token');
                userToken = response.body.data.token;
            });
        });

        it('should switch to driver role', () => {
            switchRole('driver', userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.driverRoleSwitched);
            });
        });

        it('should throw error on trying to switch to vendor role', () => {
            switchRole('vendor', userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.vendorRoleNotApplied);
            });
        });

    });

    describe("When user's vendor role only is approved", () => {
    
        before(() => {
            login(Cypress.env('userWithVendorRoleApproved'), Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data).to.have.property('token');
                userToken = response.body.data.token;
            });
        });
    
        it('should throw error on trying to switch to driver role', () => {
            switchRole('driver', userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.driverRoleNotApplied);
            });
        });
    
        it('should switch to vendor role', () => {
            switchRole('vendor', userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.vendorRoleSwitched);
            });
        });
    

    });

    describe('When user has applied for vendor role and driver application is approved', () => {

        before(() => {
            login(Cypress.env('userWithDriverRoleApprovedAndVendorRoleApplied'), Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data).to.have.property('token');
                userToken = response.body.data.token;
            });
        });

        it('should switch to driver role', () => {
            switchRole('driver', userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.driverRoleSwitched);
            });
        });

        it('should throw warning message on trying to switch to vendor role', () => {
            switchRole('vendor', userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.vendorApplicationInReview);
            });
        });

    });

    describe('When user has applied for driver role and vendor application is approved', () => {
      
        before(() => {
            login(Cypress.env('userWithVendorRoleApprovedAndDriverRoleApplied'), Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data).to.have.property('token');
                userToken = response.body.data.token;
            });
        });

        it('should throw warning message on trying to switch to driver role', () => {
            switchRole('driver', userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.driverApplicationInReview);
            });
        });

        it('should switch to vendor role', () => {
            switchRole('vendor', userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.vendorRoleSwitched);
            });
        });

        
    });

    describe('When user has both roles: driver and vendor are approved', () => {
    
        before(() => {
            login(Cypress.env('userWithBothRolesApproved'), Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data).to.have.property('token');
                userToken = response.body.data.token;
            });
        });
    
        it('should switch to driver role', () => {
            switchRole('driver', userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.driverRoleSwitched);
            });
        });
    
        it('should switch to vendor role', () => {
            switchRole('vendor', userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.vendorRoleSwitched);
            });
        });
    
    });

});