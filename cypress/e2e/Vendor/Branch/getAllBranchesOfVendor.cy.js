/// <reference types="Cypress" />

import { login, switchRole } from "../../../api/Auth_APIs/handleAuth.api";
import { getAllBranchesOfVendor } from "../../../api/Vendor_APIs/handleVendor.api";
import { vendorCreateData } from "../../../api/Vendor_APIs/vendor.data";
import { vendorSuccessMessages } from "../../../message/Successful/Vendor/vendorSuccessMessage";
import { commonError } from "../../../message/errorMessage";
import { commonSuccessMessages } from "../../../message/successfulMessage";

let userToken, vendorToken;

describe('Get All Branches Of Vendor', () => {

    describe('Without Login', () => {
                
            it('should throw status code of 401', () => {
                getAllBranchesOfVendor().then((response) => {
                    expect(response.status).to.eq(401);
                    expect(response.body).to.have.property('message', `${commonError.unauthorized}`);
                });
            });
        
    });

    describe('After Login', () => {

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
                getAllBranchesOfVendor(userToken).then((response) => {
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
                getAllBranchesOfVendor(userToken).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', commonError.forbidden);
                });
            });
    
        });

        describe('If user has been approved as a vendor', () => {
                        
            before(() => {
                login(vendorCreateData.approvedVendor, Cypress.env('password'), 'email')
                    .then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                        expect(response.body).to.have.property('data');
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;
                    });
            });

            it("should switch to vendor's mode", () => {
                const role = 'vendor';
                switchRole(role, userToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.switchedTo} ${role}`);
                    expect(response.body.data).to.have.property('token');
                    vendorToken = response.body.data.token;
                });
            });
    
            it('should successfully get the list of branches of this vendor', () => {
                getAllBranchesOfVendor(vendorToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${vendorSuccessMessages.retrievedAllBranches}`);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('branches');
                });
            }); 
        });

    });

});