/// <reference types="Cypress" />

import { login } from "../../api/Auth_APIs/handleAuth.api";
import { getApplicationDetails } from "../../api/Vendor_APIs/handleVendor.api";
import { vendorCreateData } from "../../api/Vendor_APIs/vendor.data";
import { commonError, userErrorMessages } from "../../message/errorMessage";
import { commonSuccessMessages, vendorSuccessMessages } from "../../message/successfulMessage";

let userToken;

describe("Get Application Details", () => {

    describe("Without Login", () => {

        it('Should throw error message on trying to get the details of the vendor', () => {         
            getApplicationDetails('').then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', `${commonError.unauthorized}`);
            });
        });

    });

    describe("After Login", () => {

        describe("If user tries to get the application details without applying for the vendor, the system", () => {
                
            before(() => {
    
                login(vendorCreateData.notAppliedEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
                
            });
    
            it('Should throw error message', () => {          
                getApplicationDetails(userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${userErrorMessages.notAppliedYet} vendor.`);
                });
            });
        });

        describe('If user tries to get the application details after being approved for the vendor, the system', () => {

            before(() => {
                                    
                login(vendorCreateData.approvedVendor, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });

            });

            it('Should show the application details which is going to be used in Legal Documents Page', () => {                        
                getApplicationDetails(userToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${vendorSuccessMessages.dataRetrieved}`);
                }); 
            });
        });

        describe('If user tries to get the application details after applying for the vendor, the system', () => {
            
            before(() => {
                                    
                login(vendorCreateData.appliedEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });

            });

            it('Should return the application details of the vendor', () => {         
                getApplicationDetails(userToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${vendorSuccessMessages.dataRetrieved}`);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('company_name');
                    expect(response.body.data).to.have.property('state_id');
                    expect(response.body.data).to.have.property('company_email');
                    expect(response.body.data).to.have.property('registration_document');
                });
            });
        });

    });

});

