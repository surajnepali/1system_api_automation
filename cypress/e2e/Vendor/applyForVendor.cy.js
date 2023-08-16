/// <reference types="cypress" />

import { roleEmail } from '../../api/Auth_APIs/auth.data';
import { login } from '../../api/Auth_APIs/handleAuth.api';
import { applyForVendor } from "../../api/Vendor_APIs/handleVendor.api";
import { vendorCreateData } from "../../api/Vendor_APIs/vendor.data";
import { commonSuccessMessages } from "../../message/successfulMessage";

let userToken;

describe('Apply for Vendor', () => {

    describe('Without Login', () => {
            
        it('Should throw error message on trying to apply for vendor', () => {

            cy.fixture('vendorRegistrationDocument.jpg', 'binary')
                .then((file) => Cypress.Blob.binaryStringToBlob(file, 'image/jpg'))
                .then((blob) => {
                        
                    let formData = new FormData();
                    formData.append('company_name', vendorCreateData.vendorName);
                    formData.append('state_id', vendorCreateData.vendorStateId);
                    formData.append('registration_document', blob, 'vendorRegistrationDocument.jpg');
                    formData.append('landmark', vendorCreateData.vendorLandmark);
                    formData.append('name', vendorCreateData.branchName);  
                    formData.append('contact', vendorCreateData.vendorContact);
                    formData.append('place_id', vendorCreateData.vendorPlaceId);
                    formData.append('company_email', vendorCreateData.vendorEmail);
                    formData.append('longitude', vendorCreateData.vendorLongitude);
                    formData.append('latitude', vendorCreateData.vendorLatitude);

                    applyForVendor(formData, '').then((response) => {
                        expect(response.status).to.eq(401);
                    });
                });
        });
    
    });

    describe('With Login', () => {

        describe('If user has already applied for the vendor', () => {

            before(() => {
                login(roleEmail.vendorAppliedEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });

            it('Should throw warning message on trying to apply for vendor', () => {
                    
                cy.fixture('vendorRegistrationDocument.jpg', 'binary')
                    .then((file) => Cypress.Blob.binaryStringToBlob(file, 'image/jpg'))
                    .then((blob) => {
                            
                        let formData = new FormData();
                        formData.append('company_name', vendorCreateData.vendorName);
                        formData.append('state_id', vendorCreateData.vendorStateId);
                        formData.append('name', vendorCreateData.branchName);
                        formData.append('registration_document', blob, 'vendorRegistrationDocument.jpg');
                        formData.append('landmark', vendorCreateData.vendorLandmark);
                        formData.append('contact', vendorCreateData.vendorContact);
                        formData.append('place_id', vendorCreateData.vendorPlaceId);
                        formData.append('company_email', vendorCreateData.vendorEmail);
                        formData.append('longitude', vendorCreateData.vendorLongitude);
                        formData.append('latitude', vendorCreateData.vendorLatitude);
    
                        applyForVendor(formData, userToken).then((response) => {
                            expect(response.status).to.eq(400);
                        });
                    });
            });
        });

        describe('If user is already a vendor', () => {
                
                before(() => {
                    login(roleEmail.approvedVendor, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                        expect(response.body).to.have.property('data');
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;
                    });
                });
    
                it('Should throw warning message on trying to apply for vendor', () => {
                        
                    cy.fixture('vendorRegistrationDocument.jpg', 'binary')
                        .then((file) => Cypress.Blob.binaryStringToBlob(file, 'image/jpg'))
                        .then((blob) => {
                                
                            let formData = new FormData();
                            formData.append('company_name', vendorCreateData.vendorName);
                            formData.append('state_id', vendorCreateData.vendorStateId);
                            formData.append('name', vendorCreateData.branchName);
                            formData.append('registration_document', blob, 'vendorRegistrationDocument.jpg');
                            formData.append('landmark', vendorCreateData.vendorLandmark);
                            formData.append('contact', vendorCreateData.vendorContact);
                            formData.append('place_id', vendorCreateData.vendorPlaceId);
                            formData.append('company_email', vendorCreateData.vendorEmail);
                            formData.append('longitude', vendorCreateData.vendorLongitude);
                            formData.append('latitude', vendorCreateData.vendorLatitude);
        
                            applyForVendor(formData, userToken).then((response) => {
                                cy.log(response.body)
                                expect(response.status).to.eq(400);
                            });
                        });
                });
        });

        describe('If user is not a vendor and has not applied for vendor', () => {

            before(() => {
                login(roleEmail.noRoleEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });

            it('Should throw error on trying to apply for vendor with empty vendor name', () => {
                        
                cy.fixture('vendorRegistrationDocument.jpg', 'binary')
                    .then((file) => Cypress.Blob.binaryStringToBlob(file, 'image/jpg'))
                    .then((blob) => {
                                
                        let formData = new FormData();
                        formData.append('company_name', '');
                        formData.append('state_id', vendorCreateData.vendorStateId);
                            formData.append('name', vendorCreateData.branchName);
                        formData.append('registration_document', blob, 'vendorRegistrationDocument.jpg');
                        formData.append('landmark', vendorCreateData.vendorLandmark);
                        formData.append('contact', vendorCreateData.vendorContact);
                        formData.append('place_id', vendorCreateData.vendorPlaceId);
                        formData.append('company_email', vendorCreateData.vendorEmail);
                        formData.append('longitude', vendorCreateData.vendorLongitude);
                        formData.append('latitude', vendorCreateData.vendorLatitude);
        
                        applyForVendor(formData, userToken).then((response) => {
                            expect(response.status).to.eq(400);
                        });
                });
            });

            it('Should throw error on trying to apply for vendor with empty state id', () => {
                                
                cy.fixture('vendorRegistrationDocument.jpg', 'binary')
                    .then((file) => Cypress.Blob.binaryStringToBlob(file, 'image/jpg'))
                    .then((blob) => {
                                        
                        let formData = new FormData();
                        formData.append('company_name', vendorCreateData.vendorName);
                        formData.append('state_id', '');
                        formData.append('name', vendorCreateData.branchName);
                        formData.append('registration_document', blob, 'vendorRegistrationDocument.jpg');
                        formData.append('landmark', vendorCreateData.vendorLandmark);
                        formData.append('contact', vendorCreateData.vendorContact);
                        formData.append('place_id', vendorCreateData.vendorPlaceId);
                        formData.append('company_email', vendorCreateData.vendorEmail);
                        formData.append('longitude', vendorCreateData.vendorLongitude);
                        formData.append('latitude', vendorCreateData.vendorLatitude);
                
                        applyForVendor(formData, userToken).then((response) => {
                            expect(response.status).to.eq(400);
                        });
                    });
            });

            it('Should throw error on trying to apply for vendor with empty registration document', () => {
               cy.fixture('vendorRegistrationDocument.jpg', 'binary')
                    .then((file) => Cypress.Blob.binaryStringToBlob(file, 'image/jpg'))
                    .then((blob) => {
                                            
                        let formData = new FormData();
                        formData.append('company_name', vendorCreateData.vendorName);
                        formData.append('state_id', vendorCreateData.vendorStateId);
                        formData.append('name', vendorCreateData.branchName);
                        formData.append('registration_document', '');
                        formData.append('landmark', vendorCreateData.vendorLandmark);
                        formData.append('contact', vendorCreateData.vendorContact);
                        formData.append('place_id', vendorCreateData.vendorPlaceId);
                        formData.append('company_email', vendorCreateData.vendorEmail);
                        formData.append('longitude', vendorCreateData.vendorLongitude);
                        formData.append('latitude', vendorCreateData.vendorLatitude);
                
                        applyForVendor(formData, userToken).then((response) => {
                            expect(response.status).to.eq(400);
                        });
                    }); 
            });

            it('Should throw error on trying to apply for vendor with registration document of invalid type', () => {
                cy.fixture('vendorRegistrationDocument.pdf', 'binary')
                    .then((file) => Cypress.Blob.binaryStringToBlob(file, 'application/pdf'))
                    .then((blob) => {
                        let formData = new FormData();
                        formData.append('company_name', vendorCreateData.vendorName);
                        formData.append('state_id', vendorCreateData.vendorStateId);
                        formData.append('name', vendorCreateData.branchName);
                        formData.append('registration_document', blob, 'vendorRegistrationDocument.pdf');
                        formData.append('landmark', vendorCreateData.vendorLandmark);
                        formData.append('contact', vendorCreateData.vendorContact);
                        formData.append('place_id', vendorCreateData.vendorPlaceId);
                        formData.append('company_email', vendorCreateData.vendorEmail);
                        formData.append('longitude', vendorCreateData.vendorLongitude);
                        formData.append('latitude', vendorCreateData.vendorLatitude);
    
                        applyForVendor(formData, userToken).then((response) => {
                            expect(response.status).to.eq(400);
                        });
                    });
 
            });

            it('Should throw error on trying to apply for vendor with empty landmark', () => {
                cy.fixture('vendorRegistrationDocument.jpg', 'binary')
                    .then((file) => Cypress.Blob.binaryStringToBlob(file, 'image/jpg'))
                    .then((blob) => {
                        let formData = new FormData();
                        formData.append('company_name', vendorCreateData.vendorName);
                        formData.append('state_id', vendorCreateData.vendorStateId);
                        formData.append('name', vendorCreateData.branchName);
                        formData.append('registration_document', blob, 'vendorRegistrationDocument.jpg');
                        formData.append('landmark', '');
                        formData.append('contact', vendorCreateData.vendorContact);
                        formData.append('place_id', vendorCreateData.vendorPlaceId);
                        formData.append('company_email', vendorCreateData.vendorEmail);
                        formData.append('longitude', vendorCreateData.vendorLongitude);
                        formData.append('latitude', vendorCreateData.vendorLatitude);
    
                        applyForVendor(formData, userToken).then((response) => {
                            expect(response.status).to.eq(400);
                        });
                    });
            });

            it('Should throw error on trying to apply for vendor with empty contact', () => {
                cy.fixture('vendorRegistrationDocument.jpg', 'binary')
                    .then((file) => Cypress.Blob.binaryStringToBlob(file, 'image/jpg'))
                    .then((blob) => {
                        let formData = new FormData();
                        formData.append('company_name', vendorCreateData.vendorName);
                        formData.append('state_id', vendorCreateData.vendorStateId);
                        formData.append('name', vendorCreateData.branchName);
                        formData.append('registration_document', blob, 'vendorRegistrationDocument.jpg');
                        formData.append('landmark', vendorCreateData.vendorLandmark);
                        formData.append('contact', '');
                        formData.append('place_id', vendorCreateData.vendorPlaceId);
                        formData.append('company_email', vendorCreateData.vendorEmail);
                        formData.append('longitude', vendorCreateData.vendorLongitude);
                        formData.append('latitude', vendorCreateData.vendorLatitude);
    
                        applyForVendor(formData, userToken).then((response) => {
                            expect(response.status).to.eq(400);
                        });
                    });
            });

            it('Should throw error on trying to apply for vendor with invalid contact', () => {
                cy.fixture('vendorRegistrationDocument.jpg', 'binary')
                    .then((file) => Cypress.Blob.binaryStringToBlob(file, 'image/jpg'))
                    .then((blob) => {
                        let formData = new FormData();
                        formData.append('company_name', vendorCreateData.vendorName);
                        formData.append('state_id', vendorCreateData.vendorStateId);
                        formData.append('name', vendorCreateData.branchName);
                        formData.append('registration_document', blob, 'vendorRegistrationDocument.jpg');
                        formData.append('landmark', vendorCreateData.vendorLandmark);
                        formData.append('contact', '123456789');
                        formData.append('place_id', vendorCreateData.vendorPlaceId);
                        formData.append('company_email', vendorCreateData.vendorEmail);
                        formData.append('longitude', vendorCreateData.vendorLongitude);
                        formData.append('latitude', vendorCreateData.vendorLatitude);
    
                        applyForVendor(formData, userToken).then((response) => {
                            expect(response.status).to.eq(400);
                        });
                    });
            });

            it('Should throw error on trying to apply for vendor with empty place id', () => {
                cy.fixture('vendorRegistrationDocument.jpg', 'binary')
                    .then((file) => Cypress.Blob.binaryStringToBlob(file, 'image/jpg'))
                    .then((blob) => {
                        let formData = new FormData();
                        formData.append('company_name', vendorCreateData.vendorName);
                        formData.append('state_id', vendorCreateData.vendorStateId);
                        formData.append('name', vendorCreateData.branchName);
                        formData.append('registration_document', blob, 'vendorRegistrationDocument.jpg');
                        formData.append('landmark', vendorCreateData.vendorLandmark);
                        formData.append('contact', vendorCreateData.vendorContact);
                        formData.append('place_id', '');
                        formData.append('company_email', vendorCreateData.vendorEmail);
                        formData.append('longitude', vendorCreateData.vendorLongitude);
                        formData.append('latitude', vendorCreateData.vendorLatitude);
    
                        applyForVendor(formData, userToken).then((response) => {
                            expect(response.status).to.eq(400);
                        });
                    });
            });

            it('Should throw error on trying to apply for vendor with empty email', () => {
                cy.fixture('vendorRegistrationDocument.jpg', 'binary')
                    .then((file) => Cypress.Blob.binaryStringToBlob(file, 'image/jpg'))
                    .then((blob) => {
                        let formData = new FormData();
                        formData.append('company_name', vendorCreateData.vendorName);
                        formData.append('state_id', vendorCreateData.vendorStateId);
                        formData.append('name', vendorCreateData.branchName);
                        formData.append('registration_document', blob, 'vendorRegistrationDocument.jpg');
                        formData.append('landmark', vendorCreateData.vendorLandmark);
                        formData.append('contact', vendorCreateData.vendorContact);
                        formData.append('place_id', vendorCreateData.vendorPlaceId);
                        formData.append('company_email', '');
                        formData.append('longitude', vendorCreateData.vendorLongitude);
                        formData.append('latitude', vendorCreateData.vendorLatitude);
    
                        applyForVendor(formData, userToken).then((response) => {
                            expect(response.status).to.eq(400);
                        });
                    });
            });

            it('Should throw error on trying to apply for vendor with invalid email', () => {
                cy.fixture('vendorRegistrationDocument.jpg', 'binary')
                    .then((file) => Cypress.Blob.binaryStringToBlob(file, 'image/jpg'))
                    .then((blob) => {
                        let formData = new FormData();
                        formData.append('company_name', vendorCreateData.vendorName);
                        formData.append('state_id', vendorCreateData.vendorStateId);
                        formData.append('name', vendorCreateData.branchName);
                        formData.append('registration_document', blob, 'vendorRegistrationDocument.jpg');
                        formData.append('landmark', vendorCreateData.vendorLandmark);
                        formData.append('contact', vendorCreateData.vendorContact);
                        formData.append('place_id', vendorCreateData.vendorPlaceId);
                        formData.append('company_email', 'test');
                        formData.append('longitude', vendorCreateData.vendorLongitude);
                        formData.append('latitude', vendorCreateData.vendorLatitude);
    
                        applyForVendor(formData, userToken).then((response) => {
                            expect(response.status).to.eq(400);
                        });
                    });
            });

            it('Should throw error on trying to apply for vendor with empty longitude', () => {
                cy.fixture('vendorRegistrationDocument.jpg', 'binary')
                    .then((file) => Cypress.Blob.binaryStringToBlob(file, 'image/jpg'))
                    .then((blob) => {
                        let formData = new FormData();
                        formData.append('company_name', vendorCreateData.vendorName);
                        formData.append('state_id', vendorCreateData.vendorStateId);
                        formData.append('name', vendorCreateData.branchName);
                        formData.append('registration_document', blob, 'vendorRegistrationDocument.jpg');
                        formData.append('landmark', vendorCreateData.vendorLandmark);
                        formData.append('contact', vendorCreateData.vendorContact);
                        formData.append('place_id', vendorCreateData.vendorPlaceId);
                        formData.append('company_email', vendorCreateData.vendorEmail);
                        formData.append('longitude', '');
                        formData.append('latitude', vendorCreateData.vendorLatitude);
    
                        applyForVendor(formData, userToken).then((response) => {
                            expect(response.status).to.eq(400);
                        });
                    });
            });

            it('Should throw error on trying to apply for vendor with invalid longitude', () => {
                cy.fixture('vendorRegistrationDocument.jpg', 'binary')
                    .then((file) => Cypress.Blob.binaryStringToBlob(file, 'image/jpg'))
                    .then((blob) => {
                        let formData = new FormData();
                        formData.append('company_name', vendorCreateData.vendorName);
                        formData.append('state_id', vendorCreateData.vendorStateId);
                        formData.append('name', vendorCreateData.branchName);
                        formData.append('registration_document', blob, 'vendorRegistrationDocument.jpg');
                        formData.append('landmark', vendorCreateData.vendorLandmark);
                        formData.append('contact', vendorCreateData.vendorContact);
                        formData.append('place_id', vendorCreateData.vendorPlaceId);
                        formData.append('company_email', vendorCreateData.vendorEmail);
                        formData.append('longitude', 'test');
                        formData.append('latitude', vendorCreateData.vendorLatitude);
    
                        applyForVendor(formData, userToken).then((response) => {
                            expect(response.status).to.eq(400);
                        });
                    });
            });

            it('Should throw error on trying to apply for vendor with empty latitude', () => {
                cy.fixture('vendorRegistrationDocument.jpg', 'binary')
                    .then((file) => Cypress.Blob.binaryStringToBlob(file, 'image/jpg'))
                    .then((blob) => {
                        let formData = new FormData();
                        formData.append('company_name', vendorCreateData.vendorName);
                        formData.append('state_id', vendorCreateData.vendorStateId);
                        formData.append('name', vendorCreateData.branchName);
                        formData.append('registration_document', blob, 'vendorRegistrationDocument.jpg');
                        formData.append('landmark', vendorCreateData.vendorLandmark);
                        formData.append('contact', vendorCreateData.vendorContact);
                        formData.append('place_id', vendorCreateData.vendorPlaceId);
                        formData.append('company_email', vendorCreateData.vendorEmail);
                        formData.append('longitude', vendorCreateData.vendorLongitude);
                        formData.append('latitude', '');
    
                        applyForVendor(formData, userToken).then((response) => {
                            expect(response.status).to.eq(400);
                        });
                    });
            });

            it('Should throw error on trying to apply for vendor with invalid latitude', () => {
                cy.fixture('vendorRegistrationDocument.jpg', 'binary')
                    .then((file) => Cypress.Blob.binaryStringToBlob(file, 'image/jpg'))
                    .then((blob) => {
                        let formData = new FormData();
                        formData.append('company_name', vendorCreateData.vendorName);
                        formData.append('state_id', vendorCreateData.vendorStateId);
                        formData.append('name', vendorCreateData.branchName);
                        formData.append('registration_document', blob, 'vendorRegistrationDocument.jpg');
                        formData.append('landmark', vendorCreateData.vendorLandmark);
                        formData.append('contact', vendorCreateData.vendorContact);
                        formData.append('place_id', vendorCreateData.vendorPlaceId);
                        formData.append('company_email', vendorCreateData.vendorEmail);
                        formData.append('longitude', vendorCreateData.vendorLongitude);
                        formData.append('latitude', 'test');
    
                        applyForVendor(formData, userToken).then((response) => {
                            expect(response.status).to.eq(400);
                        });
                    });
            });

            it('Should apply for vendor successfully', () => {
                    
                cy.fixture('vendorRegistrationDocument.jpg', 'binary')
                    .then((file) => Cypress.Blob.binaryStringToBlob(file, 'image/jpg'))
                    .then((blob) => {
                            
                        let formData = new FormData();
                        formData.append('company_name', vendorCreateData.vendorName);
                        formData.append('state_id', vendorCreateData.vendorStateId);
                        formData.append('name', vendorCreateData.branchName);
                        formData.append('registration_document', blob, 'vendorRegistrationDocument.jpg');
                        formData.append('landmark', vendorCreateData.vendorLandmark);
                        formData.append('contact', vendorCreateData.vendorContact);
                        formData.append('place_id', vendorCreateData.vendorPlaceId);
                        formData.append('company_email', vendorCreateData.vendorEmail);
                        formData.append('longitude', vendorCreateData.vendorLongitude);
                        formData.append('latitude', vendorCreateData.vendorLatitude);
    
                        applyForVendor(formData, userToken).then((response) => {
                            cy.log('Request Body:', formData);
                            cy.log('Response Body:', response.body);
                            expect(response.status).to.eq(200);
                        });
                    });
            });
        }); 
    });

});