/// <reference types="Cypress" />

import getServiceTypes from '../../../api/Vendor_APIs/getServiceTypes.api';
import { vendorCreateData } from '../../../api/Vendor_APIs/vendor.data';
import login from '../../../api/login.api';
import switchRole from '../../../api/switchRole.api';
import vendorErrorMessages from '../../../message/Error/Vendor/vendorErrorMessage';
import { vendorSuccessMessages } from '../../../message/Successful/Vendor/vendorSuccessMessage';
import SUCCESSFUL from '../../../message/successfulMessage';

let token = '';

describe('Get Service Types', () => {

    describe('Without Login', () => {

        it('should throw status code of 401', () => {
            getServiceTypes.getServiceTypes(1, 10).then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', vendorErrorMessages.unauthorized);
            });
        });

    })

    describe('After Login', () => {

        describe('If user has not applied for the vendor', () => {

            beforeEach(() => {
                login.loginUser(vendorCreateData.notAppliedEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    token = response.body.data.token;
                });
            });

            it('should throw status code of 403', () => {
                getServiceTypes.getServiceTypes(1, 10, token).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', vendorErrorMessages.forbiddenFromUserMode);
                });
            });

        });

        describe('If user has applied for the vendor', () => {
                
            beforeEach(() => {
                login.loginUser(vendorCreateData.appliedEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    token = response.body.data.token;
                });
            });
    
            it('should throw status code of 403', () => {
                getServiceTypes.getServiceTypes(1, 10, token).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', vendorErrorMessages.forbiddenFromUserMode);
                });
            }); 
        });

        describe('If user has been approved as a vendor', () => {
                    
            beforeEach(() => {
                login.loginUser(vendorCreateData.approvedVendor, Cypress.env('password'), 'email')
                  .then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    localStorage.setItem('token', response.body.data.token);
                  });
              });
              
        
            
            it("Switch Role to Vendor", () => {
                switchRole.switchRole('vendor')
                  .then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', vendorSuccessMessages.switchedToVendor);
                    expect(response.body.data).to.have.property('token');
                    token = response.body.data.token;
                });
            });
                
            
            it('should throw status code of 200', () => {

                getServiceTypes.getServiceTypes(1, 10, token).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', vendorSuccessMessages.retrievedServices);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('service');
                    cy.log(response.body.data.service);
            }); 
        });

    });

});
});