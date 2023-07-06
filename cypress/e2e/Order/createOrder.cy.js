/// <reference types="Cypress" />

import { driverRole } from "../../api/Driver_APIs/driver.data";
import { createOrder } from "../../api/Order_APIs/handleOrder.api";
import { createOrderData, orderAccessEmails } from "../../api/Order_APIs/order.data";
import loginApi from "../../api/login.api";
import { orderErrorMessages } from "../../message/Error/Order/orderErrorMessages";
import switchRoleApi from "../../api/switchRole.api";
import { orderSuccessMessages } from "../../message/Successful/Order/orderSuccessMessages";
import { vendorCreateData } from "../../api/Vendor_APIs/vendor.data";
import getAllBranchesOfVendorApi from "../../api/Vendor_APIs/getAllBranchesOfVendor.api";
import { getAllOfferingsOfBranch } from "../../api/Vendor_APIs/branchOffering.api";

let userToken, vendorToken, driverToken, branchId, serviceId, offeringId;

describe('Create Order', () => {

    describe('Without Login', () => {

        it('should not create order and should throw error 403', ()=> {
            createOrder(createOrderData).then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', orderErrorMessages.unauthorized);
            });
        });
    });

    describe('With Login', () => {

        describe('If user tries to create order after switching to Driver role', () => {

            before(() => {
                loginApi.loginUser(orderAccessEmails.approvedDriverEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', orderSuccessMessages.successfulLogin);
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });

            it('should switch to Driver role', () => {
                switchRoleApi.switchRole('driver', userToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', orderSuccessMessages.switchedToDriverRole);
                    expect(response.body.data).to.have.property('token');
                    driverToken = response.body.data.token;
                });
            });

            it('should not create order and should throw error 403', () => {
                const var1 = 'driver mode';
                createOrder(createOrderData, driverToken).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', `${orderErrorMessages.forbidden} ${var1}.`);
                });
            });

        });

        describe('If user tries to create order after switching to Vendor role', () => {
                
            before(() => {
                loginApi.loginUser(orderAccessEmails.approvedVendorEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', orderSuccessMessages.successfulLogin);
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });
    
            it('should switch to Vendor role', () => {
                switchRoleApi.switchRole('vendor', userToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', orderSuccessMessages.switchedToVendorRole);
                    expect(response.body.data).to.have.property('token');
                    vendorToken = response.body.data.token;
                });
            });

            it('should get all the branches of the vendor', () => {
                getAllBranchesOfVendorApi.getAllBranchesOfVendor(vendorToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', orderSuccessMessages.retrievedAllBranches);
                    const branches = response.body.data.branches;
                    const randomIndex = Math.floor(Math.random() * branches.length);
                    const randomBranch = branches[randomIndex];
                    branchId = randomBranch.id;
                    cy.log(branchId);
                });
            });

            it('should get all branch offerings', () => {
                getAllOfferingsOfBranch(vendorToken, branchId).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', orderSuccessMessages.allOfferingsOfBranch);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('offerings');
                    expect(response.body.data.offerings).to.be.an('array');
                    const offerings = response.body.data.offerings;
                    const randomIndex = Math.floor(Math.random() * offerings.length);
                    serviceId = offerings[randomIndex].service_id;
                    cy.log(serviceId);
                    offeringId = offerings[randomIndex].id;
                    cy.log(offeringId);
                });
            });
    
            it('should not create order and should throw error 403', () => {
                const var1 = 'vendor mode';
                createOrder(createOrderData, vendorToken).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', `${orderErrorMessages.forbidden} ${var1}.`);
                });
            });
                
        });

        describe('If user tries to create order being a Customer', () => {

            before(() => {
                loginApi.loginUser(orderAccessEmails.onlyCustomerEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', orderSuccessMessages.successfulLogin);
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });

            it('should throw error when total is empty', () => {
                const var1 = 'total_price'
                const x = {...createOrderData, [var1]: '', branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${orderErrorMessages.IsRequired}`);
                });
            });

            it('should throw error when total is not a number', () => {
                const var1 = 'total_price'
                const x = {...createOrderData, [var1]: 'abc', branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${orderErrorMessages.MustBeNumber}`);
                });
            });

            it('should throw error when total is negative', () => {
                const var1 = 'total_price'
                const x = {...createOrderData, [var1]: -1, branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${orderErrorMessages.MustBePositive}`);
                });
            });
            
            it('should throw error when pickup longitude is empty', () => {
                const var1 = 'pickup_longitude'
                const x = {...createOrderData, [var1]: '', branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${orderErrorMessages.IsRequired}`);
                });
            });

            it('should throw error when pickup longitude is not a number', () => {
                const var1 = 'pickup_longitude'
                const x = {...createOrderData, [var1]: 'abc', branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${orderErrorMessages.MustBeNumber}`);
                });
            });

            it('should throw error when pickup longitude is less than -180°', () => {
                const var1 = 'pickup_longitude'
                const x = {...createOrderData, [var1]: -181, branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${orderErrorMessages.MustBeValidN180}`);
                });
            });

            it('should throw error when pickup longitude is greater than 180°', () => {
                const var1 = 'pickup_longitude'
                const x = {...createOrderData, [var1]: 181, branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${orderErrorMessages.MustBeValidP180}`);
                });
            });

            it('should throw error when pickup latitude is empty', () => {
                const var1 = 'pickup_latitude'
                const x = {...createOrderData, [var1]: '', branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${orderErrorMessages.IsRequired}`);
                });
            });

            it('should throw error when pickup latitude is not a number', () => {
                const var1 = 'pickup_latitude'
                const x = {...createOrderData, [var1]: 'abc', branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${orderErrorMessages.MustBeNumber}`);
                });
            });

            it('should throw error when pickup latitude is less than -90°', () => {
                const var1 = 'pickup_latitude'
                const x = {...createOrderData, [var1]: -91, branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${orderErrorMessages.MustBeValidN90}`);
                });
            });

            it('should throw error when pickup latitude is greater than 90°', () => {
                const var1 = 'pickup_latitude'
                const x = {...createOrderData, [var1]: 91, branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${orderErrorMessages.MustBeValidP90}`);
                });
            });

            it('should throw error when dropoff longitude is empty', () => {
                const var1 = 'dropoff_longitude'
                const x = {...createOrderData, [var1]: '', branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${orderErrorMessages.IsRequired}`);
                });
            });

            it('should throw error when dropoff longitude is not a number', () => {
                const var1 = 'dropoff_longitude'
                const x = {...createOrderData, [var1]: 'abc', branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => { 
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${orderErrorMessages.MustBeNumber}`);
                });
            });

            it('should throw error when dropoff longitude is less than -180°', () => {
                const var1 = 'dropoff_longitude'
                const x = {...createOrderData, [var1]: -181, branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => { 
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${orderErrorMessages.MustBeValidN180}`);
                });
            });

            it('should throw error when dropoff longitude is greater than 180°', () => {
                const var1 = 'dropoff_longitude'
                const x = {...createOrderData, [var1]: 181, branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => { 
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${orderErrorMessages.MustBeValidP180}`);
                });
            });

            it('should throw error when dropoff latitude is empty', () => {
                const var1 = 'dropoff_latitude'
                const x = {...createOrderData, [var1]: '', branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => { 
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${orderErrorMessages.IsRequired}`);
                });
            });

            it('should throw error when dropoff latitude is not a number', () => {
                const var1 = 'dropoff_latitude'
                const x = {...createOrderData, [var1]: 'abc', branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => { 
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${orderErrorMessages.MustBeNumber}`);
                });
            });

            it('should throw error when dropoff latitude is less than -90°', () => {
                const var1 = 'dropoff_latitude'
                const x = {...createOrderData, [var1]: -91, branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => { 
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${orderErrorMessages.MustBeValidN90}`);
                });
            });

            it('should throw error when dropoff latitude is greater than 90°', () => {
                const var1 = 'dropoff_latitude'
                const x = {...createOrderData, [var1]: 91, branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => { 
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${orderErrorMessages.MustBeValidP90}`);
                });
            });

            it('should throw error when pickup_time is empty and is_self_pickup is false', () => {
                const var1 = 'pickup_time'
                const x = {...createOrderData, [var1]: '', is_self_pickup: false, branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => { 
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${orderErrorMessages.IsRequired}`);
                });
            });

            // Pickup time is sent and displayed in the response body but has no use of it since is_self_pickup is true
            it('should throw error when pickup_time is not empty and is_self_pickup is true', () => {
                const var1 = 'pickup_time'
                const x = {...createOrderData, is_self_pickup: true, branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => { 
                    expect(response.status).to.eq(201);
                    expect(response.body).to.have.property('message', orderSuccessMessages.orderCreatedSuccessfully);
                });
            });

            it('should throw error when pickup_time is not a date', () => {
                const var1 = 'pickup_time'
                const x = {...createOrderData, [var1]: 'abc', branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => { 
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${orderErrorMessages.mustBeValidDate}`);
                });
            });

            it('should throw error when dropoff_time is empty and is_self_delivery is false', () => {
                const var1 = 'dropoff_time'
                const x = {...createOrderData, [var1]: '', is_self_delivery: false, branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => { 
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${orderErrorMessages.IsRequired}`);
                });
            });

            // Dropoff time is sent and displayed in the response body but has no use of it since is_self_delivery is true
            it('should throw error when dropoff_time is not empty and is_self_delivery is true', () => {
                const var1 = 'dropoff_time'
                const x = {...createOrderData, is_self_delivery: true, branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => { 
                    expect(response.status).to.eq(201);
                    expect(response.body).to.have.property('message', orderSuccessMessages.orderCreatedSuccessfully);
                });
            });

            it('should throw error when dropoff_time is not a date', () => {
                const var1 = 'dropoff_time'
                const x = {...createOrderData, [var1]: 'abc', branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => { 
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${orderErrorMessages.mustBeValidDate}`);
                });
            });

            it('should throw error when offering_id is empty', () => {
                const var1 = 'offering_id'
                const x = {...createOrderData, [var1]: '', branch_id: branchId, service_id: serviceId};
                createOrder(x, userToken).then((response) => { 
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${orderErrorMessages.IsRequired}`);
                });
            });

            it('should throw error when offering_id is not a number', () => {
                const var1 = 'offering_id'
                const x = {...createOrderData, [var1]: 'abc', branch_id: branchId, service_id: serviceId};
                createOrder(x, userToken).then((response) => { 
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${orderErrorMessages.mustBeIntegerr}`);
                });
            });

            it('should throw error when offering_id is less than 1', () => {
                const var1 = 'offering_id'
                const x = {...createOrderData, [var1]: 0, branch_id: branchId, service_id: serviceId};
                createOrder(x, userToken).then((response) => { 
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${orderErrorMessages.notExist}`);
                });
            });

            it('should throw error when service_id is empty', () => {
                const var1 = 'service_id'
                const x = {...createOrderData, [var1]: '', branch_id: branchId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => { 
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${orderErrorMessages.IsRequired}`);
                });
            });

            it('should throw error when service_id is not a number', () => {
                const var1 = 'service_id'
                const x = {...createOrderData, [var1]: 'abc', branch_id: branchId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${orderErrorMessages.mustBeIntegerr}`);
                });
            });

            it('should throw error when service_id is less than 1', () => {
                const var1 = 'service_id'
                const x = {...createOrderData, [var1]: 0, branch_id: branchId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${orderErrorMessages.MustBeGreaterThanZero}`);
                });
            });

            it('should throw error when branch_id is empty', () => {
                const var1 = 'branch_id'
                const x = {...createOrderData, [var1]: '', service_id: serviceId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${orderErrorMessages.IsRequired}`);
                });
            });

            it('should throw error when branch_id is not a number', () => {
                const var1 = 'branch_id'
                const x = {...createOrderData, [var1]: 'abc', service_id: serviceId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${var1} ${orderErrorMessages.mustBeIntegerr}`);
                });
            });

            it('should throw error when branch_id is less than 1', () => {
                const var1 = 'branch_id'
                const x = {...createOrderData, [var1]: 0, service_id: serviceId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${orderErrorMessages.notExist}`);
                });
            });

            it('should throw error when is_self_pickup is false but pickup_location is empty', () => {
                const x = {...createOrderData, is_self_pickup: false, pickup_longitude: '', pickup_latitude: '', branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `Must have pickup ${orderErrorMessages.selfAssignedErrorr} pickup.`);
                });
            });

            it('should throw error when is_self_delivery is false but dropoff_location is empty', () => {
                const x = {...createOrderData, is_self_delivery: false, dropoff_longitude: '', dropoff_latitude: '', branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `Must have delivery ${orderErrorMessages.selfAssignedError} delivery.`);
                });
            });

            it('should throw error when is_self_delivery is empty', () => {
                const x = {...createOrderData, is_self_delivery: '', branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => {
                    expect(response.status).to.eq(201);
                    expect(response.body).to.have.property('message', orderSuccessMessages.orderCreatedSuccessfully);
                });
            });

            it('should throw error when is_self_delivery is not a boolean', () => {
                const x = {...createOrderData, is_self_delivery: 'abc', branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => {
                    expect(response.status).to.eq(201);
                    expect(response.body).to.have.property('message', orderSuccessMessages.orderCreatedSuccessfully);
                });
            });

            it('should throw error when is_self_pickup is not a boolean', () => {
                const x = {...createOrderData, is_self_pickup: 'abc', branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => {
                    expect(response.status).to.eq(201);
                    expect(response.body).to.have.property('message', orderSuccessMessages.orderCreatedSuccessfully);
                });
            });

            it('should throw error when is_self_pickup is empty', () => {
                const x = {...createOrderData, is_self_pickup: '', branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => {
                    expect(response.status).to.eq(201);
                    expect(response.body).to.have.property('message', orderSuccessMessages.orderCreatedSuccessfully);
                });
            });

            it('should create order successfully', () => {
                const x = {...createOrderData, branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(x, userToken).then((response) => {
                    expect(response.status).to.eq(201);
                    expect(response.body).to.have.property('message', orderSuccessMessages.orderCreatedSuccessfully);
                    expect(response.body.data).to.have.property('order');
                });
            });

        });

    });

});