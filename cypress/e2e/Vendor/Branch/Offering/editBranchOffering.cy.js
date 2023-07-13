/// <reference types="Cypress" />

import { login, switchRole } from "../../../../api/Auth_APIs/handleAuth.api";
import { editBranchOffering, getAllBranchesOfVendor, getAllOfferingsOfBranch } from "../../../../api/Vendor_APIs/handleVendor.api";
import { editOfferingFakerData, vendorCreateData } from "../../../../api/Vendor_APIs/vendor.data";
import { commonError } from "../../../../message/errorMessage";
import { commonSuccessMessages, vendorSuccessMessages } from "../../../../message/successfulMessage";

let userToken, vendorToken, branchId, offeringId;

describe('Edit Branch Offering API Testing', () => {

    describe('After Login', () => {

        describe('If user is an approved vendor', () => {
            before(() => {
                login(vendorCreateData.approvedVendor, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });

            it('should switch to vendor role', () => {
                const role = 'vendor';
                switchRole(role, userToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.switchedTo} ${role}`);
                    expect(response.body.data).to.have.property('token');
                    vendorToken = response.body.data.token;
                });
            });

            it('should get all the branches of the vendor', () => {
                getAllBranchesOfVendor(vendorToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${vendorSuccessMessages.retrievedAllBranches}`);
                    const branches = response.body.data.branches;
                    const randomIndex = Math.floor(Math.random() * branches.length);
                    cy.log('Random Index: ' + randomIndex);
                    const randomBranch = branches[randomIndex];
                    branchId = randomBranch.id;
                    cy.log('Branch ID: ' + branchId);
                });
            });

            it('should get all branch offerings', () => {

                getAllOfferingsOfBranch(vendorToken, branchId).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${vendorSuccessMessages.allOfferingsOfBranch}`);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('offerings');
                    expect(response.body.data.offerings).to.be.an('array');
                    const offerings = response.body.data.offerings;
                    const randomIndex = Math.floor(Math.random() * offerings.length);
                    offeringId = offerings[randomIndex].id;
                });
            });

            it('should throw error on trying to edit leaving price field empty', () => {
                const price = 'price';
                const editBranchOfferingWithEmptyPrice = {...editOfferingFakerData, [price]: ''};
                editBranchOffering(editBranchOfferingWithEmptyPrice, vendorToken, branchId, offeringId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${price} ${commonError.empty}`);
                });
            });

            it('should throw error on trying to edit typing string in price field', () => {
                const price = 'price';
                const editBranchOfferingWithInvalidPrice = {...editOfferingFakerData, [price]: 'abc'};
                editBranchOffering(editBranchOfferingWithInvalidPrice, vendorToken, branchId, offeringId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${price} ${commonError.invalid}`);
                });
            });

            it('should throw error on trying to edit typing negative value in price field', () => {
                const price = 'price';
                const editBranchOfferingWithNegativePrice = {...editOfferingFakerData, [price]: -1};
                editBranchOffering(editBranchOfferingWithNegativePrice, vendorToken, branchId, offeringId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${price} ${commonError.lessThan0}`);
                });
            });

            it('should throw error on trying to edit leaving estimated_hour field empty', () => {
                const estimatedHour = 'estimated_hour';
                const editBranchOfferingWithEmptyEstimatedHour = {...editOfferingFakerData, [estimatedHour]: ''};
                editBranchOffering(editBranchOfferingWithEmptyEstimatedHour, vendorToken, branchId, offeringId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${estimatedHour} ${commonError.empty}`);
                });
            });

            it('should throw error on trying to edit typing string in estimated_hour field', () => {
                const estimatedHour = 'estimated_hour';
                const editBranchOfferingWithInvalidEstimatedHour = {...editOfferingFakerData, [estimatedHour]: 'abc'};
                editBranchOffering(editBranchOfferingWithInvalidEstimatedHour, vendorToken, branchId, offeringId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${estimatedHour} ${commonError.invalid}`);
                });
            });

            it('should throw error on trying to edit typing negative value in estimated_hour field', () => {
                const estimatedHour = 'estimated_hour';
                const editBranchOfferingWithNegativeEstimatedHour = {...editOfferingFakerData, [estimatedHour]: -1};
                editBranchOffering(editBranchOfferingWithNegativeEstimatedHour, vendorToken, branchId, offeringId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${estimatedHour} ${commonError.lessThan0}`);
                });
            });

            it('should throw error on trying to edit leaving description field empty', () => {
                const description = 'description';
                const editBranchOfferingWithEmptyDescription = {...editOfferingFakerData, [description]: ''};
                editBranchOffering(editBranchOfferingWithEmptyDescription, vendorToken, branchId, offeringId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${description} ${commonError.empty}`);
                });
            });

            it('should successfully edit branch offering', () => {
                editBranchOffering(editOfferingFakerData, vendorToken, branchId, offeringId).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${vendorSuccessMessages.offeringEdited}`);
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