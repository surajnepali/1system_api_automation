/// <reference types="Cypress" />

import getApplicationDetails from "../../api/Vendor_APIs/getApplicationDetails.api";
import { vendorCreateData } from "../../api/Vendor_APIs/vendor.data";
import login from "../../api/login.api";
import vendorErrorMessages from "../../message/Error/Vendor/vendorErrorMessage";
import { vendorSuccessMessages } from "../../message/Successful/Vendor/vendorSuccessMessage";
import SUCCESSFUL from "../../message/successfulMessage";

describe("Get Application Details", () => {

    describe("Without Login", () => {

        it('Should throw error message on trying to get the details of the vendor', () => {
                
                getApplicationDetails.getApplicationDetails().then((response) => {
                    expect(response.status).to.eq(401);
                    expect(response.body).to.have.property('message', vendorErrorMessages.unauthorized);
                });
    
        });

    });

    describe("After Login", () => {

        describe("If user tries to get the application details without applying for the vendor, the system", () => {
                
            beforeEach(() => {
    
                login.loginUser(vendorCreateData.notAppliedEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    const token = response.body.data.token;
                    localStorage.setItem('token', token);
                    return token;
                });
                
            });
    
            it('Should throw error message', () => {
                    
                getApplicationDetails.getApplicationDetails().then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', vendorErrorMessages.hasNotAppliedYet);
                });
            });
        });

        describe('If user tries to get the application details after being approved for the vendor, the system', () => {
            beforeEach(() => {
                                    
                login.loginUser(vendorCreateData.appliedmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    const token = response.body.data.token;
                    localStorage.setItem('token', token);
                    return token;
                });

            });

            it('Should throw error message', () => {
                        
                getApplicationDetails.getApplicationDetails().then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', vendorSuccessMessages.dataRetrieved);
                }); 
            });
        });

        describe('If user tries to get the application details after applying for the vendor, the system', () => {
            beforeEach(() => {
                                    
                login.loginUser(vendorCreateData.approvedVendor, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    const token = response.body.data.token;
                    localStorage.setItem('token', token);
                    return token;
                });

            });

            it('Should return the application details of the vendor', () => {
                        
                getApplicationDetails.getApplicationDetails().then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', vendorSuccessMessages.dataRetrieved);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('company_name');
                    expect(response.body.data).to.have.property('state_id');
                    expect(response.body.data).to.have.property('company_email');
                    expect(response.body.data).to.have.property('user_id');
                    expect(response.body.data).to.have.property('registration_document');
                });
            });
        });

    });

});

