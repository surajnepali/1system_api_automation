/// <reference types="Cypress" />

import { createOfferingFakerData, vendorCreateData } from "../../../../api/Vendor_APIs/vendor.data";
import { login, switchRole } from "../../../../api/Auth_APIs/handleAuth.api";
import { createBranchOffering, getAOffering, getAllBranchesOfVendor, getAllOfferingsOfBranch, getServiceTypes } from "../../../../api/Vendor_APIs/handleVendor.api";
import { commonError } from "../../../../message/errorMessage";
import { commonSuccessMessages, vendorSuccessMessages } from "../../../../message/successfulMessage";

let userToken, vendorToken, branchId, serviceId, offeringId;

describe('Create Branch Offering API Testing', () => {

    describe('Without Login', () => {
        
        it('should throw status code of 401', () => {
            createBranchOffering(createOfferingFakerData, '', '1').then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', `${commonError.unauthorized}`);
            });
        });
    });

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

            it('should get all the services of the vendor', () => {
                getServiceTypes(1, 10, vendorToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${vendorSuccessMessages.retrievedServices}`);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('service');
                    cy.log(response.body.data.service);
                    const services = response.body.data.service;
                    const randomIndex = Math.floor(Math.random() * services.length);
                    cy.log('Random Index: ' + randomIndex);
                    const randomService = services[randomIndex];
                    serviceId = randomService.id;
                    cy.log('Service ID: ' + serviceId);
                });
            });

            it('should throw error om leaving price field empty', () => {
                const price = 'price';
                const createOfferWithEmptyPrice = {...createOfferingFakerData, [price] : ''};
                createBranchOffering(createOfferWithEmptyPrice, vendorToken, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${price} ${commonError.empty}`);
                });
            });

            it('should throw error on entering invalid price', () => {
                const price = 'price';
                const createOfferWithInvalidPrice = {...createOfferingFakerData, [price] : 'abc'};
                createBranchOffering(createOfferWithInvalidPrice, vendorToken, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${price} ${commonError.invalid}`);
                });
            });

            it('should throw error on entering negative price', () => {
                const price = 'price';
                const createOfferWithNegativePrice = {...createOfferingFakerData, [price] : -1};
                createBranchOffering(createOfferWithNegativePrice, vendorToken, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${price} ${commonError.lessThan0}`);
                });
            });

            it('should throw error on leaving estimated_hour field empty', () => {
                const estimatedHour = 'estimated_hour';
                const createOfferWithEmptyEstimatedHour = {...createOfferingFakerData, [estimatedHour] : ''};
                createBranchOffering(createOfferWithEmptyEstimatedHour, vendorToken, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${estimatedHour} ${commonError.empty}`);
                });
            });

            it('should throw error on entering invalid estimated_hour', () => {
                const estimatedHour = 'estimated_hour';
                const createOfferWithInvalidEstimatedHour = {...createOfferingFakerData, [estimatedHour] : 'abc'};
                createBranchOffering(createOfferWithInvalidEstimatedHour, vendorToken, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                        expect(response.body).to.have.property('message', `${estimatedHour} ${commonError.mustBeInteger}`);
                });
            });

            it('should throw error on entering negative estimated_hour', () => {
                const estimatedHour = 'estimated_hour';
                const x = {...createOfferingFakerData, [estimatedHour] : -1};
                createBranchOffering(x, vendorToken, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${estimatedHour} ${commonError.lessThan0}`);
                });
            });

            it('should throw error on leaving description field empty', () => {
                const description = 'description';
                const createOfferWithEmptyDescription = {...createOfferingFakerData, [description] : ''};
                createBranchOffering(createOfferWithEmptyDescription, vendorToken, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${description} ${commonError.empty}`);
                });
            });

            it('should throw error on entering invalid description', () => {
                const description = 'description';
                const x = {...createOfferingFakerData, [description] : 'abc'};
                createBranchOffering(x, vendorToken, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${description} ${commonError.lessThan8Characters}`);
                });
            });

            it('should throw error on leaving service_id field empty', () => {
                const serviceId = 'service_id';
                const x = {...createOfferingFakerData, [serviceId] : ''};
                createBranchOffering(x, vendorToken, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${serviceId} ${commonError.empty}`);
                });
            });

            it('should throw error on entering invalid service_id', () => {
                const serviceId = 'service_id';
                const x = {...createOfferingFakerData, [serviceId] : 'abc'};
                createBranchOffering(x, vendorToken, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${serviceId} ${commonError.mustBeInteger}`);
                });
            });

            it('should throw error on entering negative service_id', () => {
                const serviceId = 'service_id';
                const x = {...createOfferingFakerData, [serviceId] : -1};
                createBranchOffering(x, vendorToken, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${serviceId} ${commonError.lessThan0}`);
                });
            });

            it('should successfully create a branch offering', () => {
                const createBranchOffer = {...createOfferingFakerData, service_id : serviceId};
                createBranchOffering(createBranchOffer, vendorToken, branchId).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${vendorSuccessMessages.serviceAdded}`);
                    expect(response.body.data).to.have.property('provides');
                    expect(response.body.data.provides).to.have.property('id');
                    expect(response.body.data.provides).to.have.property('branch_id', branchId);
                    expect(response.body.data.provides).to.have.property('service_id', serviceId);
                    expect(response.body.data.provides).to.have.property('price', createOfferingFakerData.price);
                    expect(response.body.data.provides).to.have.property('estimated_hour', createOfferingFakerData.estimated_hour);
                    expect(response.body.data.provides).to.have.property('description', createOfferingFakerData.description);
                });
            });
    
        }); 

        describe('If user has not applied for the vendor role', () => {

            before(() => {
                login(vendorCreateData.appliedEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });;
            });
                
            it('should throw error on creating a branch offering', () => {
                const createBranchOffer = {...createOfferingFakerData, service_id : serviceId};
                createBranchOffering(createBranchOffer, userToken, branchId).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', `${commonError.forbidden} user mode.`);
                });
            });
                
        });

        describe('If user has applied for the vendor role but not approved yet', () => {
                
                before(() => {
                    login(vendorCreateData.appliedEmail, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                        expect(response.body).to.have.property('data');
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;
                    });;
                });
    
                it('should throw error on creating a branch offering', () => {
                    const createBranchOffer = {...createOfferingFakerData, service_id : serviceId};
                    createBranchOffering(createBranchOffer, userToken, branchId).then((response) => {
                        expect(response.status).to.eq(403);
                        expect(response.body).to.have.property('message', `${commonError.forbidden} user mode.`);
                    });
                });
    
        });

    });
});

describe('Get All Offering of a Branch API Testing', () => {

    describe('Without Login', () => {
            
        it('should throw error on getting all branch offerings', () => {
            getAllOfferingsOfBranch('', branchId).then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', `${commonError.unauthorized}`);
            });
        });
            
    });

    describe('With Login', () => {

        describe('If user has not applied for the vendor role', () => {
                
            before(() => {
                login(vendorCreateData.appliedEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });
                    
            it('should throw error on getting all branch offerings', () => {
                getAllOfferingsOfBranch(userToken, branchId).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', `${commonError.forbidden} user mode.`);
                });
            });
                    
        });

        describe('If user has applied for the vendor role but not approved yet', () => {
                        
            before(() => {
                login(vendorCreateData.appliedEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });
    
            it('should throw error on getting all branch offerings', () => {
                getAllOfferingsOfBranch(userToken, branchId).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', `${commonError.forbidden} user mode.`);
                });
            });
                
        });

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

            it('should switch to vendor mode', () => {
                const role = 'vendor';
                switchRole(role, userToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.switchedTo} ${role}`);
                    vendorToken = response.body.data.token;
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

        });

    });

});

describe('Get details of a service offered API Testing', () => {

    describe('Without Login', () => {
                
        it('should throw error on getting details of a service offered', () => {
            getAOffering('', branchId, offeringId).then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', `${commonError.unauthorized}`);
            });
        });

    });

    describe('With Login', () => {

        describe('If user has not applied for the vendor role', () => {
                    
            before(() => {
                login(vendorCreateData.notAppliedEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });
                        
            it('should throw error on getting details of a service offered', () => {
                getAOffering(userToken, branchId, offeringId).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', `${commonError.forbidden} user mode.`);
                });
            });
                        
        });

        describe('If user has applied for the vendor role but not approved yet', () => {

            before(() => {
                login(vendorCreateData.appliedEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });

            it('should throw error on getting details of a service offered', () => {
                getAOffering(userToken, branchId, offeringId).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', `${commonError.forbidden}user mode.`);
                });
            });

        });

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
    
            it('should switch to vendor mode', () => {
                const role = 'vendor';
                switchRole(role, userToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.switchedTo} ${role}`);
                    vendorToken = response.body.data.token;
                });
            });
    
            it('should get details of a service offered', () => {
                getAOffering(vendorToken, branchId, offeringId).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${vendorSuccessMessages.detailsOfOffering}`);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('offering');
                    expect(response.body.data.offering).to.be.an('object');
                });
            });
    
        });

    });

});