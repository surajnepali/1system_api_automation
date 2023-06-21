/// <reference types="Cypress" />

import login from "../../api/login.api";
import switchRole from "../../api/switchRole.api";
import ERROR from "../../message/errorMessage";
import SUCCESSFUL from "../../message/successfulMessage";


describe('Switch Role', () => {

    describe('When user has not applied for any role', () => {

        beforeEach(() => {
            login.loginUser(Cypress.env('userWithNoRole'), Cypress.env('password')).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data).to.have.property('token');
                const token = response.body.data.token;
                localStorage.setItem('token', token);
                return token;
            });
        });

        it('should throw error on trying to switch without role', () => {
            switchRole.switchRole('').then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.emptyRole);
            });
        });
            
        it('should throw error on trying to switch to driver role', () => {
            switchRole.switchRole('driver').then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.driverRoleNotApplied);
            });
        });

        it('should throw error on trying to switch to vendor role', () => {
            switchRole.switchRole('vendor').then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.vendorRoleNotApplied);
            });
        });

    });

    describe('When user has applied for driver role only', () => {
        
        beforeEach(() => {
            login.loginUser(Cypress.env('userAppliedForDriverOnly'), Cypress.env('password')).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data).to.have.property('token');
                const token = response.body.data.token;
                localStorage.setItem('token', token);
                return token;
            });
        });

        it('should throw warning message on trying to switch driver role', () => {
            switchRole.switchRole('driver').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.driverApplicationInReview);
            });
        });

        it('should throw error on trying to switch to vendor role', () => {
            switchRole.switchRole('vendor').then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.vendorRoleNotApplied);
            });
        });

    });

    describe('When user has applied for vendor role only', () => {
            
        beforeEach(() => {
            login.loginUser(Cypress.env('userAppliedForVendorOnly'), Cypress.env('password')).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data).to.have.property('token');
                const token = response.body.data.token;
                localStorage.setItem('token', token);
                return token;
            });
        });
    
        it('should throw error on trying to switch to driver role', () => {
            switchRole.switchRole('driver').then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.driverRoleNotApplied);
            });
        });
    
        it('should throw warning message on trying to switch vendor role', () => {
            switchRole.switchRole('vendor').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.vendorApplicationInReview);
            });
        });

    });

    describe('When user has applied for both driver and vendor role', () => {
                
        beforeEach(() => {
            login.loginUser(Cypress.env('userAppliedForBothRoles'), Cypress.env('password')).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data).to.have.property('token');
                const token = response.body.data.token;
                localStorage.setItem('token', token);
                return token;
            });
        });
        
        it('should throw warning message on trying to switch driver role', () => {
            switchRole.switchRole('driver').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.driverApplicationInReview);
            });
        });
    
        it('should throw warning message on trying to switch vendor role', () => {
            switchRole.switchRole('vendor').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.vendorApplicationInReview);
            });
        });
    
    });

    describe("When user's driver role only is approved", () => {

        beforeEach(() => {
            login.loginUser(Cypress.env('userWithDriverRoleApproved'), Cypress.env('password')).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data).to.have.property('token');
                const token = response.body.data.token;
                localStorage.setItem('token', token);
                return token;
            });
        });

        it('should switch to driver role', () => {
            switchRole.switchRole('driver').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.driverRoleSwitched);
            });
        });

        it('should throw error on trying to switch to vendor role', () => {
            switchRole.switchRole('vendor').then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.vendorRoleNotApplied);
            });
        });

    });

    describe("When user's vendor role only is approved", () => {
    
        beforeEach(() => {
            login.loginUser(Cypress.env('userWithVendorRoleApproved'), Cypress.env('password')).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data).to.have.property('token');
                const token = response.body.data.token;
                localStorage.setItem('token', token);
                return token;
            });
        });
    
        it('should throw error on trying to switch to driver role', () => {
            switchRole.switchRole('driver').then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', ERROR.driverRoleNotApplied);
            });
        });
    
        it('should switch to vendor role', () => {
            switchRole.switchRole('vendor').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.vendorRoleSwitched);
            });
        });
    

    });

    describe('When user has applied for vendor role and driver application is approved', () => {

        beforeEach(() => {
            login.loginUser(Cypress.env('userWithDriverRoleApprovedAndVendorRoleApplied'), Cypress.env('password')).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data).to.have.property('token');
                const token = response.body.data.token;
                localStorage.setItem('token', token);
                return token;
            });
        });

        it('should switch to driver role', () => {
            switchRole.switchRole('driver').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.driverRoleSwitched);
            });
        });

        it('should throw warning message on trying to switch to vendor role', () => {
            switchRole.switchRole('vendor').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.vendorApplicationInReview);
            });
        });

    });

    describe('When user has applied for driver role and vendor application is approved', () => {
      
        beforeEach(() => {
            login.loginUser(Cypress.env('userWithVendorRoleApprovedAndDriverRoleApplied'), Cypress.env('password')).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data).to.have.property('token');
                const token = response.body.data.token;
                localStorage.setItem('token', token);
                return token;
            });
        });

        it('should throw warning message on trying to switch to driver role', () => {
            switchRole.switchRole('driver').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.driverApplicationInReview);
            });
        });

        it('should switch to vendor role', () => {
            switchRole.switchRole('vendor').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.vendorRoleSwitched);
            });
        });

        
    });

    describe('When user has both roles: driver and vendor are approved', () => {
    
        beforeEach(() => {
            login.loginUser(Cypress.env('userWithBothRolesApproved'), Cypress.env('password')).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data).to.have.property('token');
                const token = response.body.data.token;
                localStorage.setItem('token', token);
                return token;
            });
        });
    
        it('should switch to driver role', () => {
            switchRole.switchRole('driver').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.driverRoleSwitched);
            });
        });
    
        it('should switch to vendor role', () => {
            switchRole.switchRole('vendor').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.vendorRoleSwitched);
            });
        });
    
    });

});