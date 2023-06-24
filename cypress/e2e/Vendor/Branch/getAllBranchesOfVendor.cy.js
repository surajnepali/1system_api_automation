/// <reference types="Cypress" />

import getAllBranchesOfVendor from "../../../api/Vendor_APIs/getAllBranchesOfVendor.api";
import { vendorCreateData } from "../../../api/Vendor_APIs/vendor.data";
import login from "../../../api/login.api";
import switchRole from "../../../api/switchRole.api";
import vendorErrorMessages from "../../../message/Error/Vendor/vendorErrorMessage";
import { vendorSuccessMessages } from "../../../message/Successful/Vendor/vendorSuccessMessage";
import SUCCESSFUL from "../../../message/successfulMessage";

let token;

describe('Get All Branches Of Vendor', () => {

    describe('Without Login', () => {
                
            it('should throw status code of 401', () => {
                getAllBranchesOfVendor.getAllBranchesOfVendor().then((response) => {
                    expect(response.status).to.eq(401);
                    expect(response.body).to.have.property('message', vendorErrorMessages.unauthorized);
                });
            });
        
    });

    describe('After Login', () => {

        describe('If user has not applied for the vendor', () => {

            before(() => {
                login.loginUser(vendorCreateData.notAppliedEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    token = response.body.data.token;
                });
            });

            it('should throw status code of 403', () => {
                getAllBranchesOfVendor.getAllBranchesOfVendor(token).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', vendorErrorMessages.forbiddenFromUserMode);
                });
            });

        });

        describe('If user has applied for the vendor', () => {
                
            before(() => {
                login.loginUser(vendorCreateData.appliedEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    token = response.body.data.token;
                });
            });
    
            it('should throw status code of 403', () => {
                getAllBranchesOfVendor.getAllBranchesOfVendor(token).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', vendorErrorMessages.forbiddenFromUserMode);
                });
            });
    
        });

        describe('If user has been approved as a vendor', () => {
                        
            before(() => {
                login.loginUser(vendorCreateData.approvedVendor, Cypress.env('password'), 'email')
                    .then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                        expect(response.body).to.have.property('data');
                        expect(response.body.data).to.have.property('token');
                        localStorage.setItem('token', response.body.data.token);
                    });
            });

            it("should switch to vendor's mode", () => {
                switchRole.switchRole('vendor').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', vendorSuccessMessages.switchedToVendor);
                    expect(response.body.data).to.have.property('token');
                    token = response.body.data.token;
                });
            });
    
            it('should successfully get the list of branches of this vendor', () => {
                getAllBranchesOfVendor.getAllBranchesOfVendor(token).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', vendorSuccessMessages.retrievedAllBranches);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('branches');
                    cy.log(response.body.data.branches);
                });
            }); 
        });

    });

});