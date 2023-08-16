/// <reference types="Cypress" />

import { roleEmail } from "../../api/Auth_APIs/auth.data";
import { login } from "../../api/Auth_APIs/handleAuth.api";
import { editDriverApplicationDocs } from "../../api/Driver_APIs/driver.api";
import { commonSuccessMessages } from "../../message/successfulMessage";

let userToken;

describe('Driver Edit Application Docs API Testing', () => {

    describe('With Login', () => {

        describe('User is an approved Driver ans tries to edit the application docs', () => {

            before(() => {
                login(roleEmail.approvedDriver, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
               });
            });

            it("Should throw error on trying to change the application docs's license_front ", () => {
                cy.fixture('driverBack.jpg', 'binary')
                .then((file) => Cypress.Blob.binaryStringToBlob(file, 'image/jpg'))
                .then((blob) => {
                    let formData = new FormData();
                    formData.append('license_front', blob, 'driverBack.jpg');

                    editDriverApplicationDocs(formData, userToken).then((response) => {
                        expect(response.status).to.eq(400);
                    });
                });
            });

        });

        describe('User has not applied for Driver and tries to edit the application docs', () => {

            before(() => {
                login(roleEmail.noRoleEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });

            it("Should throw error on trying to change the application docs's license_front ", () => {
                cy.fixture('driverBack.jpg', 'binary')
                .then((file) => Cypress.Blob.binaryStringToBlob(file, 'image/jpg'))
                .then((blob) => {
                    let formData = new FormData();
                    formData.append('license_front', blob, 'driverBack.jpg');

                    editDriverApplicationDocs(formData, userToken).then((response) => {
                        expect(response.status).to.eq(400);
                    });
                });
            });

        });

        describe('User has applied for Driver and wants to edit the application', () => {

            before(() => {
                login(roleEmail.driverAppliedEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });

            it('should throw error on trying to edit the application docs license_front that is more than 5MB', () => {
                cy.fixture('sample.jpg', 'binary')
                .then((file) => Cypress.Blob.binaryStringToBlob(file, 'image/jpg'))
                .then((blob) => {
                    let formData = new FormData();
                    formData.append('license_front', blob, 'sample.jpg');

                    editDriverApplicationDocs(formData, userToken).then((response) => {
                        expect(response.status).to.eq(400);
                    });
                });
            });

            it('should throw error on trying to edit the application docs license_back that is more than 5MB', () => {
                cy.fixture('sample.jpg', 'binary')
                .then((file) => Cypress.Blob.binaryStringToBlob(file, 'image/jpg'))
                .then((blob) => {
                    let formData = new FormData();
                    formData.append('license_back', blob, 'sample.jpg');

                    editDriverApplicationDocs(formData, userToken).then((response) => {
                        expect(response.status).to.eq(400);
                    });
                });
            });

            it('should throw error on trying to edit the application docs license_back that is not an image but an pdf', () => {
                cy.fixture('driverBackDocs.pdf', 'binary') // Assuming you have a PDF file named 'driverBack.pdf'
                    .then((file) => Cypress.Blob.binaryStringToBlob(file, 'application/pdf'))
                    .then((blob) => {
                        let formData = new FormData();
                        formData.append('license_back', blob, 'driverBackDocs.pdf');
            
                        editDriverApplicationDocs(formData, userToken).then((response) => {
                            expect(response.status).to.eq(400);
                        });
                    });
            });
            

        });

    });

    describe('Without Login', () => {

        it('should throw error on trying to edit the application docs license_front that is more than 5MB', () => {
            cy.fixture('driverBack.jpg', 'binary')
            .then((file) => Cypress.Blob.binaryStringToBlob(file, 'image/jpg'))
            .then((blob) => {
                let formData = new FormData();
                formData.append('license_front', blob, 'driverBack.jpg');

                editDriverApplicationDocs(formData).then((response) => {
                    expect(response.status).to.eq(401);
                });
            });
        });

        it('should throw error on trying to edit the application docs license_back that is more than 5MB', () => {
            cy.fixture('driverFront.jpg', 'binary')
            .then((file) => Cypress.Blob.binaryStringToBlob(file, 'image/jpg'))
            .then((blob) => {
                let formData = new FormData();
                formData.append('license_back', blob, 'driverFront.jpg');

                editDriverApplicationDocs(formData).then((response) => {
                    expect(response.status).to.eq(401);
                });
            });
        });

        it('should throw error on trying to edit the application docs license_back that is not an image but an pdf', () => {
            cy.fixture('driverBackDocs.pdf', 'binary') // Assuming you have a PDF file named 'driverBack.pdf'
                .then((file) => Cypress.Blob.binaryStringToBlob(file, 'application/pdf'))
                .then((blob) => {
                    let formData = new FormData();
                    formData.append('license_back', blob, 'driverBackDocs.pdf');
        
                    editDriverApplicationDocs(formData).then((response) => {
                        expect(response.status).to.eq(401);
                    });
                });
        });

    });

});