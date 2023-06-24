/// <reference types="Cypress" />

import editVendorApplication from "../../api/Vendor_APIs/editVendorApplication.api";
import getApplicationDetails from "../../api/Vendor_APIs/getApplicationDetails.api";
import { vendorCreateData, vendorFakerData, vendorFakerData2 } from "../../api/Vendor_APIs/vendor.data";
import login from "../../api/login.api";
import vendorErrorMessages from "../../message/Error/Vendor/vendorErrorMessage";
import { vendorSuccessMessages } from "../../message/Successful/Vendor/vendorSuccessMessage";
import SUCCESSFUL from "../../message/successfulMessage";

let branch;

// Can edit Company Name, State Id, and Company Email using this API
describe("Edit Vendor Application (Company Name, State Id, and Company Email)", () => {

    describe("Without Login", () => {
            
        it('Should throw error message on trying to edit the vendor application', () => {
                    
            editVendorApplication.editVendorApplication(vendorFakerData).then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', vendorErrorMessages.unauthorized);
            });
        
        });
    
    });

    describe("After Login", () => {

        beforeEach(() => {
            login.loginUser(vendorCreateData.appliedEmail, Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                expect(response.body).to.have.property('data');
                expect(response.body.data).to.have.property('token');
                const token = response.body.data.token;
                localStorage.setItem('token', token);
                return token;
            });

        });

        it("Should throw error message on leaving company_name empty while editing", () => {
            
            const x = {...vendorFakerData, company_name: ''}

            editVendorApplication.editVendorApplication(x).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', vendorErrorMessages.emptyCompanyName);
            });
        });

        it("Should throw error message on leaving state_id empty while editing", () => {
                
            const x = {...vendorFakerData, state_id: ''}

            editVendorApplication.editVendorApplication(x).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', vendorErrorMessages.emptyStateId);
            });
        });

        it("Should throw error message on leaving company_email empty while editing", () => {
                                    
            const x = {...vendorFakerData, company_email: ''}
                        
            editVendorApplication.editVendorApplication(x).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', vendorErrorMessages.emptyCompanyEmail);
            });     
        });

        it("Should throw error message on entering invalid company_email while editing", () => {
                                                                            
            const x = {...vendorFakerData, company_email: 'invalidemail'}
                                                
            editVendorApplication.editVendorApplication(x).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', vendorErrorMessages.invalidCompanyEmail);
            });             
        });

        it("Should successfully edit the application details", () => {
                                                                                        
            editVendorApplication.editVendorApplication(vendorFakerData).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', vendorSuccessMessages.vendorApplicationEdited);
            }); 
        });

    });

});

describe("Edit Vendor Application (Landmark, Contact, Longitude, and Latitude)", () => {

    describe("After Login", () => {

        beforeEach(() => {
            login.loginUser(vendorCreateData.appliedEmail, Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                expect(response.body).to.have.property('data');
                expect(response.body.data).to.have.property('token');
                const token = response.body.data.token;
                localStorage.setItem('token', token);
                return token;
            });
        });

        it("get details of the application", () => {

            getApplicationDetails.getApplicationDetails().then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data.branch[0]).to.have.property('id');
                branch = response.body.data.branch[0].id
                cy.log(branch);
            });
        });

        it("Should throw error message on leaving contact empty while editing", () => {
                    
            const x = {...vendorFakerData2, contact: ''}
    
            editVendorApplication.editVendorApplication2(branch, x).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', vendorErrorMessages.emptyContact);
            });         
        });

        it("Should throw error message on leaving longitude empty while editing", () => {
                        
            const x = {...vendorFakerData2, longitude: ''}
        
            editVendorApplication.editVendorApplication2(branch, x).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', vendorErrorMessages.emptyLongitude);
            });             
        });

        it("Should throw error message on leaving latitude empty while editing", () => {
                                
            const x = {...vendorFakerData2, latitude: ''}
                
            editVendorApplication.editVendorApplication2(branch, x).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', vendorErrorMessages.emptyLatitude);
            });                     
        });

        it("Should throw error message on entering invalid contact while editing", () => {
                                            
            const x = {...vendorFakerData2, contact: 'invalidcontact'}
                        
            editVendorApplication.editVendorApplication2(branch, x).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', vendorErrorMessages.invalidContact);
            });                             
        });

        it("Should throw error message on entering invalid longitude while editing", () => {
                                                        
            const x = {...vendorFakerData2, longitude: 'invalidlongitude'}
                            
            editVendorApplication.editVendorApplication2(branch, x).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', vendorErrorMessages.invalidLongitude);
            });                                     
        });

        it("Should throw error message on entering invalid latitude while editing", () => {
                                                                            
            const x = {...vendorFakerData2, latitude: 'invalidlatitude'}
                                            
            editVendorApplication.editVendorApplication2(branch, x).then((response) => {
                expect(response.status).to.eq(400);
                expect(response.body).to.have.property('message', vendorErrorMessages.invalidLatitude);
            });                                                 
        });

        it("Should successfully edit the application details", () => {
            const x = {...vendorFakerData2, contact: '3456789012'}

            editVendorApplication.editVendorApplication2(branch, x).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', vendorSuccessMessages.vendorApplicationEdited2);
            });
        });

    });

    describe("Without Login", () => {

        it('Should throw error message on trying to edit the vendor application', () => {
                        
            editVendorApplication.editVendorApplication2(branch, vendorFakerData2).then((response) => {
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
                formData.append('document', blob, 'editVendorDocument.jpg');

                editVendorApplication.editVendorApplication3(formData).then((response) => {
                    expect(response.status).to.eq(401);
                });

            });
        });
            
    });

    describe("After Login", () => {

        beforeEach(() => {
            login.loginUser(vendorCreateData.appliedEmail, Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                expect(response.body).to.have.property('data');
                expect(response.body.data).to.have.property('token');
                const token = response.body.data.token;
                localStorage.setItem('token', token);
                return token;
            });
        });

        it("Should edit the Vendor Document", () => {
                
            cy.fixture('editVendorDocument.jpg', 'binary')
                .then((file) => Cypress.Blob.binaryStringToBlob(file, 'image/jpg'))
                .then((blob) => {
    
                    let formData = new FormData();
                    formData.append('document', blob, 'editVendorDocument.jpg');
    
                    editVendorApplication.editVendorApplication3(formData).then((response) => {
                        expect(response.status).to.eq(200);
                    });
    
            });
        });

    });

});