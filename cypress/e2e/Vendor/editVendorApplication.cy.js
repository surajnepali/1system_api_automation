/// <reference types="Cypress" />

import { login } from "../../api/Auth_APIs/handleAuth.api";
import { editVendorApplication, editVendorApplication2, editVendorApplication3, getApplicationDetails } from "../../api/Vendor_APIs/handleVendor.api";
import { vendorCreateData, vendorFakerData, vendorFakerData2 } from "../../api/Vendor_APIs/vendor.data";
import vendorErrorMessages from "../../message/Error/Vendor/vendorErrorMessage";
import { vendorSuccessMessages } from "../../message/Successful/Vendor/vendorSuccessMessage";
import SUCCESSFUL from "../../message/successfulMessage";

let branchId, userToken;

// Can edit Company Name, State Id, and Company Email using this API
describe("Edit Vendor Application (Company Name, State Id, and Company Email)", () => {

    describe("Without Login", () => {
            
        it('Should throw error message on trying to edit the vendor application', () => {
                    
            editVendorApplication(vendorFakerData, '').then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', vendorErrorMessages.unauthorized);
            });
        
        });
    
    });

    describe("After Login", () => {

        before(() => {
            login(vendorCreateData.appliedEmail, Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                expect(response.body).to.have.property('data');
                expect(response.body.data).to.have.property('token');
                userToken = response.body.data.token;
            });

        });

        it("Should throw error message on leaving company_name empty while editing", () => {
            
            const x = {...vendorFakerData, company_name: ''}

            editVendorApplication(x, userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', vendorErrorMessages.emptyCompanyName);
            });
        });

        it("Should throw error message on leaving state_id empty while editing", () => {
                
            const x = {...vendorFakerData, state_id: ''}

            editVendorApplication(x, userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', vendorErrorMessages.emptyStateId);
            });
        });

        it("Should throw error message on leaving company_email empty while editing", () => {
                                    
            const x = {...vendorFakerData, company_email: ''}
                        
            editVendorApplication(x, userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', vendorErrorMessages.emptyCompanyEmail);
            });     
        });

        it("Should throw error message on entering invalid company_email while editing", () => {
                                                                            
            const x = {...vendorFakerData, company_email: 'invalidemail'}
                                                
            editVendorApplication(x, userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', vendorErrorMessages.invalidCompanyEmail);
            });             
        });

        it("Should successfully edit the application details", () => {
                                                                                        
            editVendorApplication(vendorFakerData, userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', vendorSuccessMessages.vendorApplicationEdited);
            }); 
        });

    });

});

describe("Edit Vendor Application (Landmark, Contact, Longitude, and Latitude)", () => {

    describe("After Login", () => {

        before(() => {
            login(vendorCreateData.appliedEmail, Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                expect(response.body).to.have.property('data');
                expect(response.body.data).to.have.property('token');
                userToken = response.body.data.token;
            });
        });

        it("get details of the application", () => {

            getApplicationDetails(userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data.branch[0]).to.have.property('id');
                branchId = response.body.data.branch[0].id
                cy.log(branchId);
            });
        });

        it("Should throw error message on leaving contact empty while editing", () => {
                    
            const emptyContactEditVendorApplication = {...vendorFakerData2, contact: ''}
            
    
            editVendorApplication2(branchId, emptyContactEditVendorApplication, userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', vendorErrorMessages.emptyContact);
            });         
        });

        it("Should throw error message on leaving longitude empty while editing", () => {
                        
            const emptyLongitudeEditVendorApplication = {...vendorFakerData2, longitude: ''}
        
            editVendorApplication2(branchId, emptyLongitudeEditVendorApplication, userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', vendorErrorMessages.emptyLongitude);
            });             
        });

        it("Should throw error message on leaving latitude empty while editing", () => {
                                
            const emptyLatitudeEditVendorApplication = {...vendorFakerData2, latitude: ''}
                
            editVendorApplication2(branchId, emptyLatitudeEditVendorApplication, userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', vendorErrorMessages.emptyLatitude);
            });                     
        });

        it("Should throw error message on entering invalid contact while editing", () => {
                                            
            const invalidContactEditVendorApplication = {...vendorFakerData2, contact: 'invalidcontact'}
                        
            editVendorApplication2(branchId, invalidContactEditVendorApplication, userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', vendorErrorMessages.invalidContact);
            });                             
        });

        it("Should throw error message on entering invalid longitude while editing", () => {
                                                        
            const invalidLongitudeEditVendorApplication = {...vendorFakerData2, longitude: 'invalidlongitude'}
                            
            editVendorApplication2(branchId, invalidLongitudeEditVendorApplication, userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', vendorErrorMessages.invalidLongitude);
            });                                     
        });

        it("Should throw error message on entering invalid latitude while editing", () => {
                                                                            
            const invalidLatitudeEditVendorApplication = {...vendorFakerData2, latitude: 'invalidlatitude'}
                                            
            editVendorApplication2(branchId, invalidLatitudeEditVendorApplication, userToken).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', vendorErrorMessages.invalidLatitude);
            });                                                 
        });

        it("Should successfully edit the application details", () => {
            const x = {...vendorFakerData2, contact: '3456789012'}

            editVendorApplication2(branchId, x, userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', vendorSuccessMessages.vendorApplicationEdited2);
            });
        });

    });

    describe("Without Login", () => {

        it('Should throw error message on trying to edit the vendor application', () => {
                        
            editVendorApplication2(branchId, vendorFakerData2, '').then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', vendorErrorMessages.unauthorized);
            });

        });
    });

});

describe("Edit Vendor Application (Vendor Resgistration Documentation)", () => {

    describe("Before Login", () => {
            
        it("Should throw error message on trying to edit the vendor application", () => {
    
            cy.fixture('editVendorDocument.jpg', 'binary')
            .then((file) => Cypress.Blob.binaryStringToBlob(file, 'image/jpg'))
            .then((blob) => {

                let formData = new FormData();
                formData.append('registration_document', blob, 'editVendorDocument.jpg');

                editVendorApplication3(formData, '').then((response) => {
                    expect(response.status).to.eq(401);
                });

            });
        });
            
    });

    describe("After Login", () => {

        before(() => {
            login(vendorCreateData.appliedEmail, Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                expect(response.body).to.have.property('data');
                expect(response.body.data).to.have.property('token');
                userToken = response.body.data.token;
            });
        });

        it("Should edit the Vendor Document", () => {
                
            cy.fixture('editVendorDocument.jpg', 'binary')
                .then((file) => Cypress.Blob.binaryStringToBlob(file, 'image/jpg'))
                .then((blob) => {
    
                    let formData = new FormData();
                    formData.append('registration_document', blob, 'editVendorDocument.jpg');
    
                    editVendorApplication3(formData, userToken).then((response) => {
                        expect(response.status).to.eq(200);
                    });
    
            });
        });

    });

});