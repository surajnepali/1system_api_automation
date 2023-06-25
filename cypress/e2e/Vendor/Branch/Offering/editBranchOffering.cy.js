/// <reference types="Cypress" />

import { editBranchOffering, getAllOfferingsOfBranch } from "../../../../api/Vendor_APIs/branchOffering.api";
import getAllBranchesOfVendorApi from "../../../../api/Vendor_APIs/getAllBranchesOfVendor.api";
import { editOfferingFakerData, vendorCreateData } from "../../../../api/Vendor_APIs/vendor.data";
import loginApi from "../../../../api/login.api";
import switchRoleApi from "../../../../api/switchRole.api";
import vendorErrorMessages from "../../../../message/Error/Vendor/vendorErrorMessage";
import { vendorSuccessMessages } from "../../../../message/Successful/Vendor/vendorSuccessMessage";

let token, branchId, offeringId;

describe('Edit Branch Offering API Testing', () => {

    describe('After Login', () => {

        describe('If user is an approved vendor', () => {
            before(() => {
                loginApi.loginUser(vendorCreateData.approvedVendor, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', vendorSuccessMessages.successfulLogin);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    localStorage.setItem('token', response.body.data.token);
                });
            });

            it('should switch to vendor role', () => {
                switchRoleApi.switchRole('vendor').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', vendorSuccessMessages.switchedToVendor);
                    expect(response.body.data).to.have.property('token');
                    token = response.body.data.token;
                });
            });

            it('should get all the branches of the vendor', () => {
                getAllBranchesOfVendorApi.getAllBranchesOfVendor(token).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', vendorSuccessMessages.retrievedAllBranches);
                    const branches = response.body.data.branches;
                    const randomIndex = Math.floor(Math.random() * branches.length);
                    cy.log('Random Index: ' + randomIndex);
                    const randomBranch = branches[randomIndex];
                    branchId = randomBranch.id;
                    cy.log('Branch ID: ' + branchId);
                });
            });

            it('should get all branch offerings', () => {

                getAllOfferingsOfBranch(token, branchId).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', vendorSuccessMessages.allOfferingsOfBranch);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('offerings');
                    expect(response.body.data.offerings).to.be.an('array');
                    const offerings = response.body.data.offerings;
                    const randomIndex = Math.floor(Math.random() * offerings.length);
                    offeringId = offerings[randomIndex].id;
                });
            });

            it('should throw error on trying to edit leaving price field empty', () => {
                const x = {...editOfferingFakerData, price: null};
                editBranchOffering(x, token, branchId, offeringId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', vendorErrorMessages.priceRequired);
                });
            });

            it('should throw error on trying to edit typing string in price field', () => {
                const x = {...editOfferingFakerData, price: 'abc'};
                editBranchOffering(x, token, branchId, offeringId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', vendorErrorMessages.priceNumeric);
                });
            });

            it('should throw error on trying to edit typing negative value in price field', () => {
                const x = {...editOfferingFakerData, price: -1};
                editBranchOffering(x, token, branchId, offeringId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', vendorErrorMessages.pricePositive);
                });
            });

            it('should throw error on trying to edit leaving estimated_hour field empty', () => {
                const x = {...editOfferingFakerData, estimated_hour: null};
                editBranchOffering(x, token, branchId, offeringId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', vendorErrorMessages.estimatedHourRequired);
                });
            });

            it('should throw error on trying to edit typing string in estimated_hour field', () => {
                const x = {...editOfferingFakerData, estimated_hour: 'abc'};
                editBranchOffering(x, token, branchId, offeringId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', vendorErrorMessages.estimatedHourNumeric);
                });
            });

            it('should throw error on trying to edit typing negative value in estimated_hour field', () => {
                const x = {...editOfferingFakerData, estimated_hour: -1};
                editBranchOffering(x, token, branchId, offeringId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', vendorErrorMessages.estimatedHourPositive);
                });
            });

            it('should throw error on trying to edit leaving description field empty', () => {
                const x = {...editOfferingFakerData, description: null};
                editBranchOffering(x, token, branchId, offeringId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', vendorErrorMessages.descriptionRequired);
                });
            });

            it('should throw error on trying to edit leaving offering id field empty', () => {
                editBranchOffering(editOfferingFakerData, token, branchId, null).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', vendorErrorMessages.noOfferingId);
                });
            });

            it('should successfully edit branch offering', () => {
                editBranchOffering(editOfferingFakerData, token, branchId, offeringId).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', vendorSuccessMessages.offeringEdited);
                    expect(response.body.data).to.have.property('offering');
                    expect(response.body.data.offering[0]).to.have.property('id', offeringId);
                    expect(response.body.data.offering[0]).to.have.property('price', editOfferingFakerData.price);
                    expect(response.body.data.offering[0]).to.have.property('estimated_hour', editOfferingFakerData.estimated_hour);
                    expect(response.body.data.offering[0]).to.have.property('description', editOfferingFakerData.description);
                });
            });

        });

    });

});