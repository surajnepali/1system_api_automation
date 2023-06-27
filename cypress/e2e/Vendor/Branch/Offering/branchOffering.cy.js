/// <reference types="Cypress" />

import { createOfferingFakerData, vendorCreateData } from "../../../../api/Vendor_APIs/vendor.data";
import { createBranchOffering, getAOffering, getAllOfferingsOfBranch } from "../../../../api/Vendor_APIs/branchOffering.api";
import loginApi from "../../../../api/login.api";
import vendorErrorMessages from "../../../../message/Error/Vendor/vendorErrorMessage";
import switchRoleApi from "../../../../api/switchRole.api";
import { vendorSuccessMessages } from "../../../../message/Successful/Vendor/vendorSuccessMessage";
import getAllBranchesOfVendorApi from "../../../../api/Vendor_APIs/getAllBranchesOfVendor.api";
import getServiceTypesApi from "../../../../api/Vendor_APIs/getServiceTypes.api";
import { use } from "chai";

let userToken, vendorToken, branchId, serviceId, offeringId;

describe('Create Branch Offering API Testing', () => {

    describe('Without Login', () => {
        
        it('should throw status code of 401', () => {
            createBranchOffering(createOfferingFakerData, '', '1').then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', vendorErrorMessages.unauthorized);
            });
        });
    });

    describe('After Login', () => {
            
        describe('If user is an approved vendor', () => {
    
            before(() => {
                loginApi.loginUser(vendorCreateData.approvedVendor, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', vendorSuccessMessages.successfulLogin);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });
    
            it('should switch to vendor role', () => {
                switchRoleApi.switchRole('vendor', userToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', vendorSuccessMessages.switchedToVendor);
                    expect(response.body.data).to.have.property('token');
                    vendorToken = response.body.data.token;
                });
            });
    
            it('should get all the branches of the vendor', () => {
                getAllBranchesOfVendorApi.getAllBranchesOfVendor(vendorToken).then((response) => {
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

            it('should get all the services of the vendor', () => {
                getServiceTypesApi.getServiceTypes(1, 10, vendorToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', vendorSuccessMessages.retrievedServices);
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
                const x = {...createOfferingFakerData, price : ''};
                createBranchOffering(x, vendorToken, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', vendorErrorMessages.emptyPrice);
                });
            });

            it('should throw error on entering invalid price', () => {
                const x = {...createOfferingFakerData, price : 'abc'};
                createBranchOffering(x, vendorToken, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', vendorErrorMessages.invalidPrice);
                });
            });

            it('should throw error on entering negative price', () => {
                const x = {...createOfferingFakerData, price : -1};
                createBranchOffering(x, vendorToken, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', vendorErrorMessages.negativePrice);
                });
            });

            it('should throw error on leaving estimated_hour field empty', () => {
                const x = {...createOfferingFakerData, estimated_hour : ''};
                createBranchOffering(x, vendorToken, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', vendorErrorMessages.emptyEstimatedHour);
                });
            });

            it('should throw error on entering invalid estimated_hour', () => {
                const x = {...createOfferingFakerData, estimated_hour : 'abc'};
                createBranchOffering(x, vendorToken, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                        expect(response.body).to.have.property('message', vendorErrorMessages.invalidEstimatedHour);
                });
            });

            it('should throw error on entering negative estimated_hour', () => {
                const x = {...createOfferingFakerData, estimated_hour : -1};
                createBranchOffering(x, vendorToken, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', vendorErrorMessages.negativeEstimatedHour);
                });
            });

            it('should throw error on leaving description field empty', () => {
                const x = {...createOfferingFakerData, description : ''};
                createBranchOffering(x, vendorToken, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', vendorErrorMessages.emptyDescription);
                });
            });

            it('should throw error on entering invalid description', () => {
                const x = {...createOfferingFakerData, description : 'abc'};
                createBranchOffering(x, vendorToken, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', vendorErrorMessages.invalidDescription);
                });
            });

            it('should throw error on leaving service_id field empty', () => {
                const x = {...createOfferingFakerData, service_id : ''};
                createBranchOffering(x, vendorToken, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', vendorErrorMessages.emptyServiceId);
                });
            });

            it('should throw error on entering invalid service_id', () => {
                const x = {...createOfferingFakerData, service_id : 'abc'};
                createBranchOffering(x, vendorToken, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', vendorErrorMessages.invalidServiceId);
                });
            });

            it('should throw error on entering negative service_id', () => {
                const x = {...createOfferingFakerData, service_id : -1};
                createBranchOffering(x, vendorToken, branchId).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', vendorErrorMessages.negativeServiceId);
                });
            });

            it('should successfully create a branch offering', () => {
                const x = {...createOfferingFakerData, service_id : serviceId};
                createBranchOffering(x, vendorToken, branchId).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', vendorSuccessMessages.serviceAdded);
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
                loginApi.loginUser(vendorCreateData.appliedEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', vendorSuccessMessages.successfulLogin);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });;
            });
                
            it('should throw error on creating a branch offering', () => {
                const x = {...createOfferingFakerData, service_id : serviceId};
                createBranchOffering(x, userToken, branchId).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', vendorErrorMessages.forbiddenFromUserMode);
                });
            });
                
        });

        describe('If user has applied for the vendor role but not approved yet', () => {
                
                before(() => {
                    loginApi.loginUser(vendorCreateData.appliedEmail, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', vendorSuccessMessages.successfulLogin);
                        expect(response.body).to.have.property('data');
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;
                    });;
                });
    
                it('should throw error on creating a branch offering', () => {
                    const x = {...createOfferingFakerData, service_id : serviceId};
                    createBranchOffering(x, userToken, branchId).then((response) => {
                        expect(response.status).to.eq(403);
                        expect(response.body).to.have.property('message', vendorErrorMessages.forbiddenFromUserMode);
                    });
                });
    
        });

    });
});

describe('Get All Offering of a Branch API Testing', () => {

    describe('Without Login', () => {
            
        it('should throw error on getting all branch offerings', () => {
            getAllOfferingsOfBranch(branchId).then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', vendorErrorMessages.unauthorized);
            });
        });
            
    });

    describe('With Login', () => {

        describe('If user has not applied for the vendor role', () => {
                
            before(() => {
                loginApi.loginUser(vendorCreateData.appliedEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', vendorSuccessMessages.successfulLogin);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });
                    
            it('should throw error on getting all branch offerings', () => {
                getAllOfferingsOfBranch(userToken, branchId).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', vendorErrorMessages.forbiddenFromUserMode);
                });
            });
                    
        });

        describe('If user has applied for the vendor role but not approved yet', () => {
                        
            before(() => {
                loginApi.loginUser(vendorCreateData.appliedEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', vendorSuccessMessages.successfulLogin);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });
    
            it('should throw error on getting all branch offerings', () => {
                getAllOfferingsOfBranch(userToken, branchId).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', vendorErrorMessages.forbiddenFromUserMode);
                });
            });
                
        });

        describe('If user is an approved vendor', () => {

            before(() => {
                loginApi.loginUser(vendorCreateData.approvedVendor, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', vendorSuccessMessages.successfulLogin);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });

            it('should switch to vendor mode', () => {
                switchRoleApi.switchRole('vendor', userToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', vendorSuccessMessages.switchedToVendor);
                    vendorToken = response.body.data.token;
                });
            });

            it('should get all branch offerings', () => {

                getAllOfferingsOfBranch(vendorToken, branchId).then((response) => {
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

        });

    });

});

describe('Get details of a service offered API Testing', () => {

    describe('Without Login', () => {
                
        it('should throw error on getting details of a service offered', () => {
            getAOffering('', branchId, offeringId).then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', vendorErrorMessages.unauthorized);
            });
        });

    });

    describe('With Login', () => {

        describe('If user has not applied for the vendor role', () => {
                    
            before(() => {
                loginApi.loginUser(vendorCreateData.notAppliedEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', vendorSuccessMessages.successfulLogin);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });
                        
            it('should throw error on getting details of a service offered', () => {
                getAOffering(userToken, branchId, offeringId).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', vendorErrorMessages.forbiddenFromUserMode);
                });
            });
                        
        });

        describe('If user has applied for the vendor role but not approved yet', () => {

            before(() => {
                loginApi.loginUser(vendorCreateData.appliedEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', vendorSuccessMessages.successfulLogin);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });

            it('should throw error on getting details of a service offered', () => {
                getAOffering(userToken, branchId, offeringId).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', vendorErrorMessages.forbiddenFromUserMode);
                });
            });

        });

        describe('If user is an approved vendor', () => {
                
            before(() => {
                loginApi.loginUser(vendorCreateData.approvedVendor, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', vendorSuccessMessages.successfulLogin);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });
    
            it('should switch to vendor mode', () => {
                switchRoleApi.switchRole('vendor', userToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', vendorSuccessMessages.switchedToVendor);
                    vendorToken = response.body.data.token;
                });
            });
    
            it('should get details of a service offered', () => {
                getAOffering(vendorToken, branchId, offeringId).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', vendorSuccessMessages.detailsOfOffering);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('offering');
                    expect(response.body.data.offering).to.be.an('object');
                });
            });
    
        });

    });

});