/// <reference types="Cypress" />

import { login, switchRole } from "../../../api/Auth_APIs/handleAuth.api";
import { createBranch } from "../../../api/Vendor_APIs/handleVendor.api";
import { branchFakerData, vendorCreateData } from "../../../api/Vendor_APIs/vendor.data";
import { commonError } from "../../../message/errorMessage";
import { commonSuccessMessages, vendorSuccessMessages } from "../../../message/successfulMessage";

let userToken, vendorToken;

describe('Create Branch', () => {

    describe('Without Login', () => {
            
        it('should throw status code of 401', () => {
            createBranch(branchFakerData).then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', commonError.unauthorized);
            });
        });
    
    });

    describe('After Login', () => {

        describe('If user has not applied for the vendor', () => {

            before(() => {
                login(vendorCreateData.notAppliedEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', commonSuccessMessages.sucessfulLogin);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });

            it('should throw status code of 403', () => {
                createBranch(branchFakerData, userToken).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', commonError.forbidden);
                });
            });

        });

        describe('If user has applied for the vendor', () => {
                
            before(() => {
                login(vendorCreateData.appliedEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', commonSuccessMessages.sucessfulLogin);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });
    
            it('should throw status code of 403', () => {
                createBranch(branchFakerData, userToken).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', commonError.forbidden);
                });
            }); 
        });

        describe('If user has been approved as a vendor', () => {
                    
            before(() => {
                login(vendorCreateData.approvedVendor, Cypress.env('password'), 'email')
                    .then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', commonSuccessMessages.sucessfulLogin);
                        expect(response.body).to.have.property('data');
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;
                    });
            });

            it("should switch to vendor's mode", () => {
                const vendorMode = 'vendor';
                switchRole(vendorMode, userToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.switchedTo} ${vendorMode}`);
                    expect(response.body.data).to.have.property('token');
                    vendorToken = response.body.data.token;
                });
            });
      
            it('should throw error on trying to create new branch leaving landmark', () => {
                const landmark = 'landmark';
                const createBranchWithEmptyLandmark = {...branchFakerData, [landmark]: ''};
                createBranch(createBranchWithEmptyLandmark, vendorToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${landmark} ${commonError.empty}`);
                });
            });

            it('should throw error on trying to create new branch leaving contact', () => {
                const contact = 'contact';
                const createBranchWithEmptyContact = {...branchFakerData, [contact]: ''};
                createBranch(createBranchWithEmptyContact, vendorToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${contact} ${commonError.empty}`);
                });
            });

            it('should throw error on trying to create new branch entering invalid contact', () => {
                const contact = 'contact';
                const createBranchWithInvalidContact = {...branchFakerData, [contact]: '123456789'};
                createBranch(createBranchWithInvalidContact, vendorToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${contact} ${commonError.lessthan10digit}`);
                });
            });

            it('should throw error on trying to create new branch entering invalid contact', () => {
                const longPhoneNumber = 'contact';  
                const createBranchWithInvalidContact = {...branchFakerData, [longPhoneNumber]: '1234567891111'};
                createBranch(createBranchWithInvalidContact, vendorToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${commonError.invalidContact} phone number.`);
                }); 
            });

            it('should throw error on trying to create new branch leaving longitutde field empty', () => {
                const longitude = 'longitude';
                const createBranchWithEmptyLongitude = {...branchFakerData, [longitude]: ''};
                createBranch(createBranchWithEmptyLongitude, vendorToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${longitude} ${commonError.empty}`);
                }); 
            });

            it('should throw error on trying to create new branch entering invalid longitude', () => {
                const longitude = 'longitude';               
                const createBranchWithInvalidLongitude = {...branchFakerData, [longitude]: 'abcd'};
                createBranch(createBranchWithInvalidLongitude, vendorToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${longitude} ${commonError.invalid}`);
                });     
            });

            it('should throw error on trying to create new branch leaving latitude field empty', () => {
                const latitude = 'latitude';                                                            
                const createBranchWithEmptyLatitude = {...branchFakerData, [latitude]: ''};
                createBranch(createBranchWithEmptyLatitude, vendorToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${latitude} ${commonError.empty}`);
                });         
            });

            it('should throw error on trying to create new branch entering invalid latitude', () => {
                const latitude = 'latitude';                                                
                const createBranchWithInvalidLatitude = {...branchFakerData, [latitude]: 'abcd'};
                createBranch(createBranchWithInvalidLatitude, vendorToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${latitude} ${commonError.invalid}`);
                });             
            });

            it('should throw error on trying to create new branch leaving place_id field empty', () => {
                const placeId = 'place_id';                                                              
                const createBranchWithEmptyLatitude = {...branchFakerData, [placeId]: ''};
                    createBranch(createBranchWithEmptyLatitude, vendorToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${placeId} ${commonError.empty}`);
                });                     
            });

            it('should create new branch successfully', () => {
                createBranch(branchFakerData, vendorToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', vendorSuccessMessages.branchCreated);
                    expect(response.body.data).to.have.property('branch');
                    expect(response.body.data.branch).to.have.property('name', branchFakerData.name);
                    expect(response.body.data.branch).to.have.property('landmark', branchFakerData.landmark);
                    expect(response.body.data.branch).to.have.property('contact', branchFakerData.contact);
                    expect(response.body.data.branch).to.have.property('place_id', branchFakerData.place_id);
                });
            });

        });

    });

});