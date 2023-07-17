/// <reference types="Cypress" />

import { login, switchRole } from '../../../api/Auth_APIs/handleAuth.api';
import { getServiceTypes } from '../../../api/Vendor_APIs/handleVendor.api';
import { vendorCreateData } from '../../../api/Vendor_APIs/vendor.data';
import { vendorSuccessMessages } from '../../../message/Successful/Vendor/vendorSuccessMessage';
import { commonError } from '../../../message/errorMessage';
import { commonSuccessMessages } from '../../../message/successfulMessage';

let userToken, vendorToken;

describe('Get Service Types', () => {

    describe('Without Login', () => {

        it('should throw status code of 401', () => {
            getServiceTypes(1, 10, '').then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', `${commonError.unauthorized}`);
            });
        });

    })

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
                getServiceTypes(1, 10, userToken).then((response) => {
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
                getServiceTypes(1, 10, userToken).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', `${commonError.forbidden} user mode.`);
                });
            }); 
        });

        describe('If user has been approved as a vendor', () => {
                    
            before(() => {
                login(vendorCreateData.approvedVendor, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                  });
              });
              
        
            
            it("Switch Role to Vendor", () => {
                const role = "vendor";
                switchRole(role, userToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.switchedTo} ${role}`);
                    expect(response.body.data).to.have.property('token');
                    vendorToken = response.body.data.token;
                });
            });
                
            
            it('should throw status code of 200', () => {
                getServiceTypes(1, 10, vendorToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${vendorSuccessMessages.retrievedServices}`);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('service');
                    cy.log(response.body.data.service);
            }); 
        });

    });

});
});