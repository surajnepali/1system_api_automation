/// <reference types="Cypress" />

import { adminLogin } from "../../api/Admin_APIs/adminDriver.api";
import { approveVendor, getAllNotVerifiedVendors } from "../../api/Admin_APIs/adminVendor.api";
import { createUserData, randomEmail } from "../../api/Auth_APIs/auth.data";
import { login, registerCustomer, setOTP, switchRole, verifyOTP } from "../../api/Auth_APIs/handleAuth.api";
import { createOrder } from "../../api/Order_APIs/handleOrder.api";
import { createOrderData, orderAccessEmails } from "../../api/Order_APIs/order.data";
import { sofeDeleteUser } from "../../api/User_APIs/handleUser.api";
import { applyForVendor, createBranchOffering, getAllBranchesOfVendor, getAllOfferingsOfBranch } from "../../api/Vendor_APIs/handleVendor.api";
import { createOfferingFakerData, vendorCreateData } from "../../api/Vendor_APIs/vendor.data";
import { orderApiOptions, pageOptions } from "../../constants/apiOptions.constants";
import { commonSuccessMessages, orderSuccessMessages, userSuccessMessages, vendorSuccessMessages } from "../../message/successfulMessage";

let newEmail, otp, userToken, vendorToken, vendorId, adminToken, mainUserToken;
let role, branchId, serviceId, offeringId, priceOfOffering;
let estimatedWeight, estimatedPrice;

newEmail = randomEmail.email;

describe("Soft User Account Deletion from the 1Sys API Testing", () => {

    describe('GET branchId, OfferingId, serviceId', () => {

        before(() => {
            login(orderAccessEmails.approvedVendorEmail, Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                expect(response.body.data).to.have.property('token');
                userToken = response.body.data.token;
            });
        });

        it('should switch to vendor role', () => {
            role = 'vendor';
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

        it('should get all the offerings of the branch', () => {
            getAllOfferingsOfBranch(vendorToken, branchId).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', `${vendorSuccessMessages.allOfferingsOfBranch}`);
                const offerings = response.body.data.offerings;
                const randomIndex = Math.floor(Math.random() * offerings.length);
                serviceId = offerings[randomIndex].service_id;
                cy.log('Service ID: ' + serviceId);
                const randomOffering = offerings[randomIndex];
                offeringId = randomOffering.id;
                cy.log('Offering ID: ' + offeringId);
                priceOfOffering = randomOffering.price;
                cy.log('Price of Offering: ' + priceOfOffering)
            });
        });

    });

    describe("User Prospective", () => {

        describe("The user has not made any orders yet", () => {

            newEmail = randomEmail.email;
            describe("First the new user is created", () => {

                it("Set OTP", () => {
                    setOTP(newEmail, 'verifyEmail').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.otpEmailSent}`);
                        expect(response.body).to.have.property('data');
                        expect(response.body.data).to.have.property('otp');
                        otp = response.body.data.otp;
                        cy.log(otp);
                    });
                });
        
                it("Verify OTP", () => {
                    verifyOTP(newEmail, 'verifyEmail', otp).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.otpVerified}`);
                    });
                });
        
                it('Can register with valid data', () => {
                    const x = {...createUserData, otp: otp, email: newEmail}
                    registerCustomer(x).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    });
                });

                it("Can login with registered email and password", () => {
                    login(newEmail, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                        userToken = response.body.data.token;
                    });
                });

            });

            describe("Then the user deletes", () => {

                it("should be able to delete an account", () => {
                    sofeDeleteUser(Cypress.env('password'), userToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${userSuccessMessages.userSoftDeleted}`);
                    });
                });
                
            });

        });

        describe("The user has made orders", () => {

            newEmail = randomEmail.email;
            describe("First the new user is created", () => {

                it("Set OTP", () => {
                    setOTP(newEmail, 'verifyEmail').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.otpEmailSent}`);
                        expect(response.body).to.have.property('data');
                        expect(response.body.data).to.have.property('otp');
                        otp = response.body.data.otp;
                        cy.log(otp);
                    });
                });
        
                it("Verify OTP", () => {
                    verifyOTP(newEmail, 'verifyEmail', otp).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.otpVerified}`);
                    });
                });
        
                it('Can register with valid data', () => {
                    const x = {...createUserData, otp: otp, email: newEmail}
                    registerCustomer(x).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    });
                });

                it("Can login with registered email and password", () => {
                    login(newEmail, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                        userToken = response.body.data.token;
                    });
                });

            });

            describe("Second the user makes orders", () => {

                it("successfully creates an order", () => {
                    estimatedWeight = Math.floor(Math.random() * 20) + 1;
                    estimatedPrice = estimatedWeight * priceOfOffering;
                    const x = {...createOrderData, branch_id: branchId, service_id: serviceId, offering_id: offeringId, estimated_weight: estimatedWeight, estimated_price: estimatedPrice};
                    createOrder(x, userToken).then((response) => {
                        expect(response.status).to.eq(201);
                        expect(response.body).to.have.property('message', `${orderSuccessMessages.successful}created`);
                        expect(response.body.data).to.have.property('order');
                        expect(response.body.data.order).to.have.property('id');
                        expect(response.body.data.order).to.have.property('branch_id', branchId);
                        expect(response.body.data.order).to.have.property('service_id', serviceId);
                        expect(response.body.data.order).to.have.property('offering_id', offeringId);
                        expect(response.body.data.order).to.have.property('status', orderApiOptions.INITIALIZED);
                    });
                });

            });

            describe("Then the user tries to delete his account", () => {
                    
                it("should not be able to delete an account", () => {
                    sofeDeleteUser(Cypress.env('password'), userToken).then((response) => {
                        expect(response.status).to.eq(400);
                        expect(response.body).to.have.property('message', `You can't delete your account. Please contact admin.`);
                    });
                });
            });

        });

    });

    describe("Vendor Prospective", () => {

        describe("The user has just applied for the vendor role", () => {

            newEmail = randomEmail.email;
            describe("First the new user is created", () => {

                it("Set OTP", () => {
                    setOTP(newEmail, 'verifyEmail').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.otpEmailSent}`);
                        expect(response.body).to.have.property('data');
                        expect(response.body.data).to.have.property('otp');
                        otp = response.body.data.otp;
                        cy.log(otp);
                    });
                });
        
                it("Verify OTP", () => {
                    verifyOTP(newEmail, 'verifyEmail', otp).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.otpVerified}`);
                    });
                });
        
                it('Can register with valid data', () => {
                    const x = {...createUserData, otp: otp, email: newEmail}
                    registerCustomer(x).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    });
                });

                it("Can login with registered email and password", () => {
                    login(newEmail, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                        userToken = response.body.data.token;
                    });
                });

            });

            describe("Second: Login and Apply for Vendor", () => {

                it("Can login with registered email and password", () => {
                    login(newEmail, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                        expect(response.body).to.have.property('data');
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;
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
                                expect(response.status).to.eq(200);
                            });
                        });
                });
        
            });

            describe("Then the user deletes", () => {

                it("should be able to delete an account", () => {
                    sofeDeleteUser(Cypress.env('password'), userToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${userSuccessMessages.userSoftDeleted}`);
                    });
                });
                
            });

        });

        describe("The vendor has not accepted any orders yet", () => {

            newEmail = randomEmail.email;
            describe("First the new user is created", () => {

                it("Set OTP", () => {
                    setOTP(newEmail, 'verifyEmail').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.otpEmailSent}`);
                        expect(response.body).to.have.property('data');
                        expect(response.body.data).to.have.property('otp');
                        otp = response.body.data.otp;
                        cy.log(otp);
                    });
                });
        
                it("Verify OTP", () => {
                    verifyOTP(newEmail, 'verifyEmail', otp).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.otpVerified}`);
                    });
                });
        
                it('Can register with valid data', () => {
                    const x = {...createUserData, otp: otp, email: newEmail}
                    registerCustomer(x).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    });
                });

                it("Can login with registered email and password", () => {
                    login(newEmail, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                        userToken = response.body.data.token;
                    });
                });

            });

            describe("Second: Login and Apply for Vendor", () => {

                it("Can login with registered email and password", () => {
                    login(newEmail, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                        expect(response.body).to.have.property('data');
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;
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
                                expect(response.status).to.eq(200);
                            });
                        });
                });
        
            });
        
            describe("Third: Admin logs in and approves the application", () => {
                        
                it("Can login with admin email and password", () => {
                    adminLogin(Cypress.env('adminEmail'), Cypress.env('adminPassword')).then((response) => {
                        expect(response.status).to.eq(200);
                        adminToken = response.body.data.token;
                    });
                });
        
                it("Should get all the not verified drivers", () => {
                    getAllNotVerifiedVendors(pageOptions.PAGE, pageOptions.LIMIT, adminToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('data');
                        const data = response.body.data.data;
                        const object = data.find((vendor) => vendor.email === newEmail);
                        cy.log(JSON.stringify(object));
                        vendorId = object.vendor.id
                        cy.log("Driver ID: " + vendorId);
                    });
                });
        
                it("Should approve the driver", () => {
                    approveVendor(vendorId, adminToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', "Successfully accepted");
                    });
                });
        
            });

            // describe("User switches to the vendor account", () => {

            //     it("should switch to vendor role", () => {
            //         switchRole('vendor', userToken).then((response) => {
            //             expect(response.status).to.eq(200);
            //         });
            //     });
        
            // });

            describe("Then the user deletes", () => {

                it("should be able to delete an account", () => {
                    sofeDeleteUser(Cypress.env('password'), userToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${userSuccessMessages.userSoftDeleted}`);
                    });
                });
                
            });

        });

        describe("The vendor has already accepted atleast an order", () => {

            newEmail = randomEmail.email;
            describe("First the new user is created", () => {

                it("Set OTP", () => {
                    setOTP(newEmail, 'verifyEmail').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.otpEmailSent}`);
                        expect(response.body).to.have.property('data');
                        expect(response.body.data).to.have.property('otp');
                        otp = response.body.data.otp;
                        cy.log(otp);
                    });
                });
        
                it("Verify OTP", () => {
                    verifyOTP(newEmail, 'verifyEmail', otp).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.otpVerified}`);
                    });
                });
        
                it('Can register with valid data', () => {
                    const x = {...createUserData, otp: otp, email: newEmail}
                    registerCustomer(x).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    });
                });

                it("Can login with registered email and password", () => {
                    login(newEmail, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                        userToken = response.body.data.token;
                    });
                });

            });

            describe("Second: Login and Apply for Vendor", () => {

                it("Can login with registered email and password", () => {
                    login(newEmail, Cypress.env('password'), 'email').then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                        expect(response.body).to.have.property('data');
                        expect(response.body.data).to.have.property('token');
                        userToken = response.body.data.token;
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
                                expect(response.status).to.eq(200);
                            });
                        });
                });
        
            });
        
            describe("Third: Admin logs in and approves the application", () => {
                        
                it("Can login with admin email and password", () => {
                    adminLogin(Cypress.env('adminEmail'), Cypress.env('adminPassword')).then((response) => {
                        expect(response.status).to.eq(200);
                        adminToken = response.body.data.token;
                    });
                });
        
                it("Should get all the not verified drivers", () => {
                    getAllNotVerifiedVendors(pageOptions.PAGE, pageOptions.LIMIT, adminToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('data');
                        const data = response.body.data.data;
                        const object = data.find((vendor) => vendor.email === newEmail);
                        cy.log(JSON.stringify(object));
                        vendorId = object.vendor.id
                        cy.log("Driver ID: " + vendorId);
                    });
                });
        
                it("Should approve the driver", () => {
                    approveVendor(vendorId, adminToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', "Successfully accepted");
                    });
                });
        
            });

            describe("Fourth: User sets up the Vendor", () => {

                it("should switch to vendor role", () => {
                    switchRole('vendor', userToken).then((response) => {
                        expect(response.status).to.eq(200);
                        vendorToken = response.body.data.token;
                    });
                });

                it("should get all the branches", () => {
                    getAllBranchesOfVendor(vendorToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${vendorSuccessMessages.retrievedAllBranches}`);
                        const branches = response.body.data.branches;
                        const randomIndex = Math.floor(Math.random() * branches.length);
                        cy.log('Random Index: ' + randomIndex);
                        const randomBranch = branches[randomIndex];
                        branchId = randomBranch.id;
                        cy.log('New Branch ID: ' + branchId);
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

                it('should get all the offerings of the branch', () => {
                    getAllOfferingsOfBranch(vendorToken, branchId).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${vendorSuccessMessages.allOfferingsOfBranch}`);
                        const offerings = response.body.data.offerings;
                        const randomIndex = Math.floor(Math.random() * offerings.length);
                        serviceId = offerings[randomIndex].service_id;
                        cy.log('Service ID: ' + serviceId);
                        const randomOffering = offerings[randomIndex];
                        offeringId = randomOffering.id;
                        cy.log('Offering ID: ' + offeringId);
                        priceOfOffering = randomOffering.price;
                        cy.log('Price of Offering: ' + priceOfOffering)
                    });
                });                

            });

            describe("Then the user deletes", () => {

                it("should be able to delete an account", () => {
                    sofeDeleteUser(Cypress.env('password'), userToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${userSuccessMessages.userSoftDeleted}`);
                    });
                });
                
            });

        });

    });

});