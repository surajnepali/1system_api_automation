/// <reference types="Cypress" />

import editBranchApi from "../../../api/Vendor_APIs/editBranch.api";
import getAllBranchesOfVendorApi from "../../../api/Vendor_APIs/getAllBranchesOfVendor.api";
import { editBranchFakerData, vendorCreateData } from "../../../api/Vendor_APIs/vendor.data";
import loginApi from "../../../api/login.api";
import switchRoleApi from "../../../api/switchRole.api";
import vendorErrorMessages from "../../../message/Error/Vendor/vendorErrorMessage";
import { vendorSuccessMessages } from "../../../message/Successful/Vendor/vendorSuccessMessage";
import SUCCESSFUL from "../../../message/successfulMessage";

let token, branchId;

describe('Edit Branch API Testing', () => {

    describe('Without Login', () => {
            
        it('should throw status code of 401', () => {
            editBranchApi.editBranch(editBranchFakerData, '', '1').then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', vendorErrorMessages.unauthorized);
            });
        });
            
    });

    describe('After Login', () => {

        describe('If user is an approved vendor', () => {

            before(() => {
                loginApi.loginUser(vendorCreateData.approvedVendor, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    localStorage.setItem('token', response.body.data.token);
                });
            });

            it('should switch to vendor role', () => {
                switchRoleApi.switchRole('vendor').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', SUCCESSFUL.vendorRoleSwitched);
                    expect(response.body.data).to.have.property('token');
                    token = response.body.data.token;
                });
            });

            it('should get all the branches of the vendor', () => {
                getAllBranchesOfVendorApi.getAllBranchesOfVendor(token).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', vendorSuccessMessages.retrievedAllBranches);
                    const branches = response.body.data.branches;
                    const randomIndex = Math.floor(Math.random() * branches.length);
                    cy.log('Random Index: ' + randomIndex);
                    const randomBranch = branches[randomIndex];
                    branchId = randomBranch.id;
                    cy.log('Branch ID: ' + branchId);
                });
            });

            it('should throw error when landmark is empty', () => {
                const x = {...editBranchFakerData, landmark: ''};
                editBranchApi.editBranch(x, token, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', vendorErrorMessages.emptyLandmark);
                });
            });

            it('should throw error when contact field is emptied', () => {
                const x = {...editBranchFakerData, contact: ''};
                editBranchApi.editBranch(x, token, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', vendorErrorMessages.emptyContact);
                });
            });

            it('should throw error when contact field is invalid', () => {
                const x = {...editBranchFakerData, contact: 'abcd'};
                editBranchApi.editBranch(x, token, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', vendorErrorMessages.contactInvalid);
                });
            });

            it('should throw error when contact field is less than 10 digits', () => {
                const x = {...editBranchFakerData, contact: '123456789'};
                editBranchApi.editBranch(x, token, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', vendorErrorMessages.invalidContact);
                });
            });

            it('should throw error when contact field is more than 10 digits', () => {
                const x = {...editBranchFakerData, contact: '12345678901'};
                editBranchApi.editBranch(x, token, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', vendorErrorMessages.contactInvalid);
                });
            });

            it('should throw error when longitude field is emptied', () => {
                const x = {...editBranchFakerData, longitude: ''};
                editBranchApi.editBranch(x, token, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', vendorErrorMessages.emptyLongitude);
                });
            });

            it('should throw error when longitude field is invalid', () => {
                const x = {...editBranchFakerData, longitude: 'abcd'};
                editBranchApi.editBranch(x, token, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', vendorErrorMessages.invalidLongitude);
                });
            });

            it('should throw error when latitude field is emptied', () => {
                const x = {...editBranchFakerData, latitude: ''};
                editBranchApi.editBranch(x, token, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', vendorErrorMessages.emptyLatitude);
                });
            });

            it('should throw error when latitude field is invalid', () => {
                const x = {...editBranchFakerData, latitude: 'abcd'};
                editBranchApi.editBranch(x, token, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', vendorErrorMessages.invalidLatitude);
                });
            });

        });
            
        describe('If user has not applied for the vendor', () => {
    
            before(() => {
                loginApi.loginUser(vendorCreateData.notAppliedEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    token = response.body.data.token;
                });
            });
                    
    
            it('should throw status code of 403', () => {
                editBranchApi.editBranch(editBranchFakerData, token, branchId).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', vendorErrorMessages.forbiddenFromUserMode);
                });
                
            });
    
        });
    
        describe('If user has applied for the vendor', () => {
                    
            before(() => {
                loginApi.loginUser(vendorCreateData.appliedEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    token = response.body.data.token;
                });
            });
                    
    
            it('should throw status code of 403', () => {
                editBranchApi.editBranch(editBranchFakerData, token, branchId).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', vendorErrorMessages.forbiddenFromUserMode);
                });
                    
            });
    
        }); 
    });

});