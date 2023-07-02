/// <reference types="Cypress" />

import createBranch from "../../../api/Vendor_APIs/createBranch.api";
import { branchFakerData, vendorCreateData } from "../../../api/Vendor_APIs/vendor.data";
import login from "../../../api/login.api";
import switchRole from "../../../api/switchRole.api";
import vendorErrorMessages from "../../../message/Error/Vendor/vendorErrorMessage";
import { vendorSuccessMessages } from "../../../message/Successful/Vendor/vendorSuccessMessage";
import SUCCESSFUL from "../../../message/successfulMessage";

let userToken, vendorToken;

describe('Create Branch', () => {

    describe('Without Login', () => {
            
        it('should throw status code of 401', () => {
            createBranch.createBranch(branchFakerData).then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', vendorErrorMessages.unauthorized);
            });
        });
    
    });

    describe('After Login', () => {

        describe('If user has not applied for the vendor', () => {

            beforeEach(() => {
                login.loginUser(vendorCreateData.notAppliedEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });

            it('should throw status code of 403', () => {
                createBranch.createBranch(branchFakerData, userToken).then((response) => {
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
                    userToken = response.body.data.token;
                });
            });
    
            it('should throw status code of 403', () => {
                createBranch.createBranch(branchFakerData, userToken).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', vendorErrorMessages.forbiddenFromUserMode);
                });
            }); 
        });

        describe('If user has been approved as a vendor', () => {
                    
            before(() => {
                login.loginUser(vendorCreateData.approvedVendor, Cypress.env('password'), 'email')
                    .then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                        expect(response.body).to.have.property('data');
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;
                    });
            });

            it("should switch to vendor's mode", () => {
                switchRole.switchRole('vendor', userToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', vendorSuccessMessages.switchedToVendor);
                    expect(response.body.data).to.have.property('token');
                    vendorToken = response.body.data.token;
                });
            });
      
            it('should throw error on trying to create new branch leaving landmark', () => {

                const x = {...branchFakerData, landmark: ''};
                createBranch.createBranch(x, vendorToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', vendorErrorMessages.emptyLandmark);
                });
            });

            it('should throw error on trying to create new branch leaving contact', () => {
                    
                const x = {...branchFakerData, contact: ''};
                createBranch.createBranch(x, vendorToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', vendorErrorMessages.emptyContact);
                });
            });

            it('should throw error on trying to create new branch entering invalid contact', () => {
                        
                const x = {...branchFakerData, contact: '123456789'};
                createBranch.createBranch(x, vendorToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', vendorErrorMessages.incompleteContact);
                });
            });

            it('should throw error on trying to create new branch entering invalid contact', () => {
                                
                const x = {...branchFakerData, contact: '1234567891111'};
                createBranch.createBranch(x, vendorToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', vendorErrorMessages.invalidContact);
                }); 
            });

            it('should throw error on trying to create new branch leaving longitutde field empty', () => {
                                        
                const x = {...branchFakerData, longitude: ''};
                createBranch.createBranch(x, vendorToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', vendorErrorMessages.emptyLongitude);
                }); 
            });

            it('should throw error on trying to create new branch entering invalid longitude', () => {
                                                    
                const x = {...branchFakerData, longitude: 'abcd'};
                createBranch.createBranch(x, vendorToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', vendorErrorMessages.invalidLongitude);
                });     
            });

            it('should throw error on trying to create new branch leaving latitude field empty', () => {
                                                        
                const x = {...branchFakerData, latitude: ''};
                createBranch.createBranch(x, vendorToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', vendorErrorMessages.emptyLatitude);
                });         
            });

            it('should throw error on trying to create new branch entering invalid latitude', () => {
                                                                    
                const x = {...branchFakerData, latitude: 'abcd'};
                createBranch.createBranch(x, vendorToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', vendorErrorMessages.invalidLatitude);
                });             
            });

            it('should throw error on trying to create new branch leaving place_id field empty', () => {
                                                                                    
                const x = {...branchFakerData, place_id: ''};
                    createBranch.createBranch(x, vendorToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', vendorErrorMessages.emptyPlaceId);
                });                     
            });

            it('should create new branch successfully', () => {
                createBranch.createBranch(branchFakerData, vendorToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', vendorSuccessMessages.branchCreated);
                    expect(response.body.data).to.have.property('branch');
                    expect(response.body.data.branch).to.have.property('landmark', branchFakerData.landmark);
                    expect(response.body.data.branch).to.have.property('contact', branchFakerData.contact);
                    // expect(response.body.data.branch.location.coordinates[0]).to.have.property('longitude', branchFakerData.longitude);
                    // expect(response.body.data.branch.location.coordinates[1]).to.have.property('latitude', branchFakerData.latitude);
                    expect(response.body.data.branch).to.have.property('place_id', branchFakerData.place_id);
                });
            });

        });

    });

});