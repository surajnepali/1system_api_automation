/// <reference types="Cypress" />

import { createOrder } from "../../api/Order_APIs/handleOrder.api";
import { createOrderData, orderAccessEmails } from "../../api/Order_APIs/order.data";
import { login, switchRole } from "../../api/Auth_APIs/handleAuth.api";
import { getAllBranchesOfVendor, getAllOfferingsOfBranch } from "../../api/Vendor_APIs/handleVendor.api";
import { commonError, orderErrorMessages } from "../../message/errorMessage";
import { commonSuccessMessages, orderSuccessMessages, vendorSuccessMessages } from "../../message/successfulMessage";

let userToken, vendorToken, driverToken, branchId, serviceId, offeringId, role, selfPickup, selfDelivery;

describe('Create Order', () => {

    describe('Without Login', () => {

        it('should not create order and should throw error 403', ()=> {
            createOrder(createOrderData).then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', `${commonError.unauthorized}`);
            });
        });
    });

    describe('With Login', () => {

        describe('If user tries to create order after switching to Driver role', () => {

            before(() => {
                login(orderAccessEmails.approvedDriverEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });

            it('should switch to Driver role', () => {
                role = 'driver';
                switchRole(role, userToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.switchedTo} ${role}`);
                    expect(response.body.data).to.have.property('token');
                    driverToken = response.body.data.token;
                });
            });

            it('should not create order and should throw error 403', () => {
                createOrder(createOrderData, driverToken).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', `${commonError.forbidden} ${role} mode.`);
                });
            });

        });

        describe('If user tries to create order after switching to Vendor role', () => {
                
            before(() => {
                login(orderAccessEmails.approvedVendorEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });
    
            it('should switch to Vendor role', () => {
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
                    const randomBranch = branches[randomIndex];
                    branchId = randomBranch.id;
                    cy.log(branchId);
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
                    serviceId = offerings[randomIndex].service_id;
                    cy.log(serviceId);
                    offeringId = offerings[randomIndex].id;
                    cy.log(offeringId);
                });
            });
    
            it('should not create order and should throw error 403', () => {
                role = 'vendor mode';
                createOrder(createOrderData, vendorToken).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', `${commonError.forbidden} ${role}.`);
                });
            });
                
        });

        describe('If user tries to create order being a Customer', () => {

            before(() => {
                login(orderAccessEmails.onlyCustomerEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });

            it('should throw error when total is empty', () => {
                const estimatedPrice = 'estimated_price'
                const createOrderWithEmptyTotalPrice = {...createOrderData, [estimatedPrice]: '', branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(createOrderWithEmptyTotalPrice, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${estimatedPrice} ${commonError.empty}`);
                });
            });

            it('should throw error when total is not a number', () => {
                const estimatedPrice = 'estimated_price'
                const createOrderWithInvalidTotalPrice = {...createOrderData, [estimatedPrice]: 'abc', branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(createOrderWithInvalidTotalPrice, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${estimatedPrice} ${commonError.invalid}`);
                });
            });

            it('should throw error when total is negative', () => {
                const estimatedPrice = 'estimated_price'
                const createOrderWithNegativeTotalPrice = {...createOrderData, [estimatedPrice]: -1, branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(createOrderWithNegativeTotalPrice, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${estimatedPrice} ${commonError.lessThan} 0.`);
                });
            });
            
            it('should throw error when pickup longitude is empty', () => {
                const pickupLongitude = 'pickup_longitude'
                const createOrderWithEmptyPickupLongitude = {...createOrderData, [pickupLongitude]: '', branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(createOrderWithEmptyPickupLongitude, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${pickupLongitude} ${commonError.empty}`);
                });
            });

            it('should throw error when pickup longitude is not a number', () => {
                const pickupLongitude = 'pickup_longitude'
                const createOrderWithInvalidPickupLongitude = {...createOrderData, [pickupLongitude]: 'abc', branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(createOrderWithInvalidPickupLongitude, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${pickupLongitude} ${commonError.invalid}`);
                });
            });

            it('should throw error when pickup longitude is less than -180°', () => {
                const pickupLongitude = 'pickup_longitude'
                const createOrderWithLessThanNeg180PickupLongitude = {...createOrderData, [pickupLongitude]: -181, branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(createOrderWithLessThanNeg180PickupLongitude, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${pickupLongitude} ${commonError.lessThan} -180.`);
                });
            });

            it('should throw error when pickup longitude is greater than 180°', () => {
                const pickupLongitude = 'pickup_longitude'
                const createOrderWithGreatThan180PickupLongitude = {...createOrderData, [pickupLongitude]: 181, branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(createOrderWithGreatThan180PickupLongitude, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${pickupLongitude} ${commonError.greaterThan} 180.`);
                });
            });

            it('should throw error when pickup latitude is empty', () => {
                const pickupLatitude = 'pickup_latitude'
                const createOrderWithEmptyPickupLatitude = {...createOrderData, [pickupLatitude]: '', branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(createOrderWithEmptyPickupLatitude, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${pickupLatitude} ${commonError.empty}`);
                });
            });

            it('should throw error when pickup latitude is not a number', () => {
                const pickupLatitude = 'pickup_latitude'
                const createOrderWithInvalidPickupLatitude = {...createOrderData, [pickupLatitude]: 'abc', branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(createOrderWithInvalidPickupLatitude, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${pickupLatitude} ${commonError.invalid}`);
                });
            });

            it('should throw error when pickup latitude is less than -90°', () => {
                const pickupLatitude = 'pickup_latitude'
                const createOrderWithLessThanNeg90PickupLatitude = {...createOrderData, [pickupLatitude]: -91, branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(createOrderWithLessThanNeg90PickupLatitude, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${pickupLatitude} ${commonError.lessThan} -90.`);
                });
            });

            it('should throw error when pickup latitude is greater than 90°', () => {
                const pickupLatitude = 'pickup_latitude'
                const createOrderWithGreatThan90PickupLatitude = {...createOrderData, [pickupLatitude]: 91, branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(createOrderWithGreatThan90PickupLatitude, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${pickupLatitude} ${commonError.greaterThan} 90.`);
                });
            });

            it('should throw error when dropoff longitude is empty', () => {
                const dropoffLongitude = 'dropoff_longitude'
                const createOrderWithEmptyDropoffLongitude = {...createOrderData, [dropoffLongitude]: '', branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(createOrderWithEmptyDropoffLongitude, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${dropoffLongitude} ${commonError.empty}`);
                });
            });

            it('should throw error when dropoff longitude is not a number', () => {
                const dropoffLongitude = 'dropoff_longitude'
                const createOrderWithInvalidDropoffLongitude = {...createOrderData, [dropoffLongitude]: 'abc', branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(createOrderWithInvalidDropoffLongitude, userToken).then((response) => { 
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${dropoffLongitude} ${commonError.invalid}`);
                });
            });

            it('should throw error when dropoff longitude is less than -180°', () => {
                const dropoffLongitude = 'dropoff_longitude'
                const createOrderWithLessThanNeg180DropoffLongitude = {...createOrderData, [dropoffLongitude]: -181, branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(createOrderWithLessThanNeg180DropoffLongitude, userToken).then((response) => { 
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${dropoffLongitude} ${commonError.lessThan} -180.`);
                });
            });

            it('should throw error when dropoff longitude is greater than 180°', () => {
                const dropoffLongitude = 'dropoff_longitude'
                const createOrderWithGreatThan180DropoffLongitude = {...createOrderData, [dropoffLongitude]: 181, branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(createOrderWithGreatThan180DropoffLongitude, userToken).then((response) => { 
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${dropoffLongitude} ${commonError.greaterThan} 180.`);
                });
            });

            it('should throw error when dropoff latitude is empty', () => {
                const dropoffLatitude = 'dropoff_latitude'
                const createOrderWithEmptyDropoffLatitude = {...createOrderData, [dropoffLatitude]: '', branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(createOrderWithEmptyDropoffLatitude, userToken).then((response) => { 
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${dropoffLatitude} ${commonError.empty}`);
                });
            });

            it('should throw error when dropoff latitude is not a number', () => {
                const dropoffLatitude = 'dropoff_latitude'
                const createOrderWithInvalidDropoffLatitude = {...createOrderData, [dropoffLatitude]: 'abc', branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(createOrderWithInvalidDropoffLatitude, userToken).then((response) => { 
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${dropoffLatitude} ${commonError.invalid}`);
                });
            });

            it('should throw error when dropoff latitude is less than -90°', () => {
                const dropoffLatitude = 'dropoff_latitude'
                const createOrderWithLessThanNeg90DropoffLatitude = {...createOrderData, [dropoffLatitude]: -91, branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(createOrderWithLessThanNeg90DropoffLatitude, userToken).then((response) => { 
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${dropoffLatitude} ${commonError.lessThan} -90.`);
                });
            });

            it('should throw error when dropoff latitude is greater than 90°', () => {
                const dropoffLatitude = 'dropoff_latitude'
                const createOrderWithGreatThan90DropoffLatitude = {...createOrderData, [dropoffLatitude]: 91, branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(createOrderWithGreatThan90DropoffLatitude, userToken).then((response) => { 
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${dropoffLatitude} ${commonError.greaterThan} 90.`);
                });
            });

            it('should throw error when pickup_time is empty and is_self_pickup is false', () => {
                const pickupTime = 'pickup_time'
                const pickupTimeEmptyWhenFalse = {...createOrderData, [pickupTime]: '', is_self_pickup: false, branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(pickupTimeEmptyWhenFalse, userToken).then((response) => { 
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${pickupTime} ${commonError.empty}`);
                });
            });

            // Pickup time is sent and displayed in the response body but has no use of it since is_self_pickup is true
            it('should throw error when pickup_time is not empty and is_self_pickup is true', () => {
                const pickupTimeNotEmptyWhenTrue = {...createOrderData, is_self_pickup: true, branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(pickupTimeNotEmptyWhenTrue, userToken).then((response) => { 
                    expect(response.status).to.eq(201);
                    expect(response.body).to.have.property('message', `${orderSuccessMessages.successful}created`);
                });
            });

            it('should throw error when pickup_time is not a date', () => {
                const pickupTime = 'pickup_time'
                const createOrderWithInvalidData = {...createOrderData, [pickupTime]: 'abc', branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(createOrderWithInvalidData, userToken).then((response) => { 
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${pickupTime} ${commonError.mustBeValidDate}`);
                });
            });

            it('should throw error when dropoff_time is empty and is_self_delivery is false', () => {
                const dropoffTime = 'dropoff_time'
                const dropoffEmptyWhenFalse = {...createOrderData, [dropoffTime]: '', is_self_delivery: false, branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(dropoffEmptyWhenFalse, userToken).then((response) => { 
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${dropoffTime} ${commonError.empty}`);
                });
            });

            // Dropoff time is sent and displayed in the response body but has no use of it since is_self_delivery is true
            it('should throw error when dropoff_time is not empty and is_self_delivery is true', () => {
                const dropoffNotEmptyWhenTrue = {...createOrderData, is_self_delivery: true, branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(dropoffNotEmptyWhenTrue, userToken).then((response) => { 
                    expect(response.status).to.eq(201);
                    expect(response.body).to.have.property('message', `${orderSuccessMessages.successful}created`);
                });
            });

            it('should throw error when dropoff_time is not a date', () => {
                const dropoffTime = 'dropoff_time'
                const createOrderWithInvalidDropoffData = {...createOrderData, [dropoffTime]: 'abc', branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(createOrderWithInvalidDropoffData, userToken).then((response) => { 
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${dropoffTime} ${commonError.mustBeValidDate}`);
                });
            });

            it('should throw error when offering_id is empty', () => {
                const offeringID = 'offering_id'
                const createOrderWithEmptyOfferingId = {...createOrderData, [offeringID]: '', branch_id: branchId, service_id: serviceId};
                createOrder(createOrderWithEmptyOfferingId, userToken).then((response) => { 
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${offeringID} ${commonError.empty}`);
                });
            });

            it('should throw error when offering_id is not a number', () => {
                const offeringID = 'offering_id'
                const createOrderWithInvalidOfferingId = {...createOrderData, [offeringID]: 'abc', branch_id: branchId, service_id: serviceId};
                createOrder(createOrderWithInvalidOfferingId, userToken).then((response) => { 
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${offeringID} ${commonError.mustBeInteger}`);
                });
            });

            it('should throw error when offering_id is less than 1', () => {
                const offeringID = 'offering_id'
                const createOrderWithLassThan1OfferingId = {...createOrderData, [offeringID]: 0, branch_id: branchId, service_id: serviceId};
                createOrder(createOrderWithLassThan1OfferingId, userToken).then((response) => { 
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${offeringID} ${commonError.lessThan} 1.`);
                });
            });

            it('should throw error when service_id is empty', () => {
                const serviceID = 'service_id'
                const createOrderWithEmptyServiceId = {...createOrderData, [serviceID]: '', branch_id: branchId, offering_id: offeringId};
                createOrder(createOrderWithEmptyServiceId, userToken).then((response) => { 
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${serviceID} ${commonError.empty}`);
                });
            });

            it('should throw error when service_id is not a number', () => {
                const serviceID = 'service_id'
                const createOrderWithInvalidServiceId = {...createOrderData, [serviceID]: 'abc', branch_id: branchId, offering_id: offeringId};
                createOrder(createOrderWithInvalidServiceId, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${serviceID} ${commonError.mustBeInteger}`);
                });
            });

            it('should throw error when service_id is less than 1', () => {
                const serviceID = 'service_id'
                const createOrderWithLassThan1ServiceId = {...createOrderData, [serviceID]: 0, branch_id: branchId, offering_id: offeringId};
                createOrder(createOrderWithLassThan1ServiceId, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${serviceID} ${commonError.lessThan} 1.`);
                });
            });

            it('should throw error when branch_id is empty', () => {
                const branchID = 'branch_id'
                const createOrderWithEmptyBranchId = {...createOrderData, [branchID]: '', service_id: serviceId, offering_id: offeringId};
                createOrder(createOrderWithEmptyBranchId, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${branchID} ${commonError.empty}`);
                });
            });

            it('should throw error when branch_id is not a number', () => {
                const branchID = 'branch_id'
                const createOrderWithInvalidBranchId = {...createOrderData, [branchID]: 'abc', service_id: serviceId, offering_id: offeringId};
                createOrder(createOrderWithInvalidBranchId, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${branchID} ${commonError.mustBeInteger}`);
                });
            });

            it('should throw error when branch_id is less than 1', () => {
                const branchID = 'branch_id'
                const createOrderWithLassThan1BranchId = {...createOrderData, [branchID]: 0, service_id: serviceId, offering_id: offeringId};
                createOrder(createOrderWithLassThan1BranchId, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `${branchID} ${commonError.lessThan} 1.`);
                });
            });

            it('should throw error when is_self_pickup is false but pickup_location is empty', () => {
                const pickupEmptyWhenSelfPickupFalse = {...createOrderData, is_self_pickup: false, pickup_longitude: '', pickup_latitude: '', branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(pickupEmptyWhenSelfPickupFalse, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `Must have pickup ${orderErrorMessages.selfAssignedErrorr} pickup.`);
                });
            });

            it('should throw error when is_self_delivery is false but dropoff_location is empty', () => {
                const DropoffEmptyWhenSelfDeliveryFalse = {...createOrderData, is_self_delivery: false, dropoff_longitude: '', dropoff_latitude: '', branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(DropoffEmptyWhenSelfDeliveryFalse, userToken).then((response) => {
                    expect(response.status).to.eq(400);
                    expect(response.body).to.have.property('message', `Must have delivery ${orderErrorMessages.selfAssignedError} delivery.`);
                });
            });

            it('should throw error when is_self_delivery is empty', () => {
                const createOrderWithEmptySelfDelivery = {...createOrderData, is_self_delivery: '', branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(createOrderWithEmptySelfDelivery, userToken).then((response) => {
                    expect(response.status).to.eq(201);
                    expect(response.body).to.have.property('message', `${orderSuccessMessages.successful}created`);
                });
            });

            it('should throw error when is_self_delivery is not a boolean', () => {
                const createOrderWithInvalidSelfDelivery = {...createOrderData, is_self_delivery: 'abc', branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(createOrderWithInvalidSelfDelivery, userToken).then((response) => {
                    expect(response.status).to.eq(201);
                    expect(response.body).to.have.property('message', `${orderSuccessMessages.successful}created`);
                });
            });

            it('should throw error when is_self_pickup is not a boolean', () => {
                const createOrderWithInvalidSelfPickup = {...createOrderData, is_self_pickup: 'abc', branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(createOrderWithInvalidSelfPickup, userToken).then((response) => {
                    expect(response.status).to.eq(201);
                    expect(response.body).to.have.property('message', `${orderSuccessMessages.successful}created`);
                });
            });

            it('should throw error when is_self_pickup is empty', () => {
                const createOrderWithEmptySelfPickup = {...createOrderData, is_self_pickup: '', branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(createOrderWithEmptySelfPickup, userToken).then((response) => {
                    expect(response.status).to.eq(201);
                    expect(response.body).to.have.property('message', `${orderSuccessMessages.successful}created`);
                });
            });

            it('should create order successfully', () => {
                const createOrderSuccessfully = {...createOrderData, branch_id: branchId, service_id: serviceId, offering_id: offeringId};
                createOrder(createOrderSuccessfully, userToken).then((response) => {
                    expect(response.status).to.eq(201);
                    expect(response.body).to.have.property('message', `${orderSuccessMessages.successful}created`);
                    expect(response.body.data).to.have.property('order');
                });
            });

        });

    });

});