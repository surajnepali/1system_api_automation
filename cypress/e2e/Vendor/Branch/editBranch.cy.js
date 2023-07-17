/// <reference types="Cypress" />

import { login, switchRole } from "../../../api/Auth_APIs/handleAuth.api";
import { editBranch, getAllBranchesOfVendor } from "../../../api/Vendor_APIs/handleVendor.api";
import { editBranchFakerData, vendorCreateData } from "../../../api/Vendor_APIs/vendor.data";
import { commonError } from "../../../message/errorMessage";
import { commonSuccessMessages, vendorSuccessMessages } from "../../../message/successfulMessage";

let userToken, vendorToken, branchId;

describe('Edit Branch API Testing', () => {

    describe('Without Login', () => {
            
        it('should throw status code of 401', () => {
            editBranch(editBranchFakerData, '', '1').then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', `${commonError.unauthorized}`);
            });
        });
            
    });

    describe('After Login', () => {

        describe('If user is an approved vendor', () => {

            before(() => {
                login(vendorCreateData.approvedVendor, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });

            it('should switch to vendor role', () => {
                const role = 'vendor';
                switchRole(role, userToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.switchedTo} ${role}`);
                    expect(response.body.data).to.have.property('token');
                    vendorToken = response.body.data.token;
                });
            });

            it('should get all the branches of the vendor', () => {
                getAllBranchesOfVendor(vendorToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${vendorSuccessMessages.retrievedAllBranches}`);
                    const branches = response.body.data.branches;
                    const randomIndex = Math.floor(Math.random() * branches.length);
                    cy.log('Random Index: ' + randomIndex);
                    const randomBranch = branches[randomIndex];
                    branchId = randomBranch.id;
                    cy.log('Branch ID: ' + branchId);
                });
            });

            it('should throw error when landmark is empty', () => {
                const landmark = 'landmark';
                const editBranchWithEmptyLandmark = {...editBranchFakerData, [landmark]: ''};
                editBranch(editBranchWithEmptyLandmark, vendorToken, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${landmark} ${commonError.empty}`);
                });
            });

            it('should throw error when contact field is emptied', () => {
                const contact = 'contact';
                const editBranchWithEmptyContact = {...editBranchFakerData, [contact]: ''};
                editBranch(editBranchWithEmptyContact, vendorToken, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${contact} ${commonError.empty}`);
                });
            });

            it('should throw error when contact field is invalid', () => {
                const contact = 'contact';
                const editBranchWithInvalidContact = {...editBranchFakerData, [contact]: 'abcd'};
                editBranch(editBranchWithInvalidContact, vendorToken, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${contact} ${commonError.lessthan10digit}`);
                });
            });

            it('should throw error when contact field is less than 10 digits', () => {
                const contact = 'contact';
                const editBranchWithInvalidContact = {...editBranchFakerData, [contact]: '123456789'};
                editBranch(editBranchWithInvalidContact, vendorToken, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${contact} ${commonError.lessthan10digit}`);
                });
            });

            it('should throw error when contact field is more than 10 digits', () => {
                const contact = 'contact';
                const editBranchWithInvalidContact = {...editBranchFakerData, [contact]: '234567890101'};
                editBranch(editBranchWithInvalidContact, vendorToken, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${commonError.invalidContact} phone number.`);
                });
            });

            it('should throw error when longitude field is emptied', () => {
                const longitude = 'longitude';
                const editBranchWithEmptyLongitude = {...editBranchFakerData, [longitude]: ''};
                editBranch(editBranchWithEmptyLongitude, vendorToken, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${longitude} ${commonError.empty}`);
                });
            });

            it('should throw error when longitude field is invalid', () => {
                const longitude = 'longitude';
                const editBranchWithInvalidLongitude = {...editBranchFakerData, [longitude]: 'abcd'};
                editBranch(editBranchWithInvalidLongitude, vendorToken, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${longitude} ${commonError.invalid}`);
                });
            });

            it('should throw error when latitude field is emptied', () => {
                const latitude = 'latitude';
                const editBranchWithEmptyLatitude = {...editBranchFakerData, [latitude]: ''};
                editBranch(editBranchWithEmptyLatitude, vendorToken, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${latitude} ${commonError.empty}`);
                });
            });

            it('should throw error when latitude field is invalid', () => {
                const latitude = 'latitude';
                const editBranchWithInvalidLatitude = {...editBranchFakerData, [latitude]: 'abcd'};
                editBranch(editBranchWithInvalidLatitude, vendorToken, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${latitude} ${commonError.invalid}`);
                });
            });

        });
            
        describe('If user has not applied for the vendor', () => {
    
            before(() => {
                login(vendorCreateData.notAppliedEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });
                    
    
            it('should throw status code of 403', () => {
                editBranch(editBranchFakerData, userToken, branchId).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', `${commonError.forbidden} user mode.`);
                });
                
            });
    
        });
    
        describe('If user has applied for the vendor', () => {
                    
            before(() => {
                login(vendorCreateData.appliedEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });
                    
    
            it('should throw status code of 403', () => {
                editBranch(editBranchFakerData, userToken, branchId).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', commonError.forbidden);
                });
                    
            });
    
        }); 
    });

});