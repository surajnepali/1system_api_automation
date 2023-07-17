/// <reference types="Cypress" />

import { login, switchRole } from "../../../api/Auth_APIs/handleAuth.api";
import { orderAccessEmails } from "../../../api/Order_APIs/order.data";
import { getOrderByFilter, getOrderTrackingById } from "../../../api/User_APIs/handleUser.api";
import { orderApiOptions, pageOptions } from "../../../constants/apiOptions.constants";
import { commonError } from "../../../message/errorMessage";
import { commonSuccessMessages, orderSuccessMessages, userSuccessMessages } from "../../../message/successfulMessage";

let userToken, vendorToken, driverToken, role;
let orderId;

describe('Get Order Tracking API Testing', () => {

    describe('After Login', () => {

        describe('When user is in customer mode', () => {

            before(() => {
                login(orderAccessEmails.onlyCustomerEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });

            describe('When user gets all the orders of order tab ready', () => {

                let initializedOrderId, acceptedOrderId;
                it('should display all the orders of order tab ready', () => {
                    getOrderByFilter(orderApiOptions.READY, pageOptions.PAGE, pageOptions.LIMIT, userToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${userSuccessMessages.orderRetrieved}`);
                        expect(response.body).to.have.property('data');
                    
                        const orders = response.body.data.orders;
                    
                        // The filter method is used to create new arrays containing only the orders with the desired status.
                        // The map method is used to extract the id values from those filtered arrays.
                        const initializedOrderIds = orders.filter(order => order.status === orderApiOptions.INITIALIZED).map(order => order.id);

                        const acceptedOrderIds = orders.filter(order => order.status === orderApiOptions.ACCEPTED).map(order => order.id);

                        initializedOrderId = initializedOrderIds[Math.floor(Math.random() * initializedOrderIds.length)];

                        acceptedOrderId = acceptedOrderIds[Math.floor(Math.random() * acceptedOrderIds.length)];
                    
                        cy.log("Initialized Order ID:", initializedOrderId);
                        cy.log("Accepted Order ID:", acceptedOrderId);
                        orderId = initializedOrderId;
                    });
                    
                });

                it('should display the order tracking using order id having status initialized', () => {
                    getOrderTrackingById(initializedOrderId, userToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${orderSuccessMessages.orderTracking}`);
                        expect(response.body.data.order_tracking).to.have.property('order_timeline_current_index', 0);
                    });
                });

                it('should display the order tracking using order id having status accepted', () => {
                    getOrderTrackingById(acceptedOrderId, userToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${orderSuccessMessages.orderTracking}`);
                        expect(response.body.data.order_tracking).to.have.property('order_timeline_current_index', 1);
                    });
                });
            
            });

            describe('When user gets all the orders of order tab picking', () => {

                let pickedAssignedId, pickedOrderId;
                it('should display all the orders of order tab picking', () => {
                    getOrderByFilter(orderApiOptions.PICKING, pageOptions.PAGE, pageOptions.LIMIT, userToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${userSuccessMessages.orderRetrieved}`);
                        expect(response.body).to.have.property('data');
                    
                        const orders = response.body.data.orders;
                    
                        // The filter method is used to create new arrays containing only the orders with the desired status.
                        // The map method is used to extract the id values from those filtered arrays.
                        const pickedAssignedIds = orders.filter(order => order.status === orderApiOptions.PICKUP_ASSIGNED).map(order => order.id);

                        const pickedOrderIds = orders.filter(order => order.status === orderApiOptions.PICKEDUP).map(order => order.id);

                        pickedAssignedId = pickedAssignedIds[Math.floor(Math.random() * pickedAssignedIds.length)];

                        pickedOrderId = pickedOrderIds[Math.floor(Math.random() * pickedOrderIds.length)];

                        cy.log("Picked Assigned ID:", pickedAssignedId);
                        cy.log("Picked Order ID:", pickedOrderId);
                    });
                    
                });

                it('should display the order tracking using order id having status pickup assigned', () => {
                    getOrderTrackingById(pickedAssignedId, userToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${orderSuccessMessages.orderTracking}`);
                        expect(response.body.data.order_tracking).to.have.property('order_timeline_current_index', 2);
                    });
                });

                it('should display the order tracking using order id having status picked', () => {
                    getOrderTrackingById(pickedOrderId, userToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${orderSuccessMessages.orderTracking}`);
                        expect(response.body.data.order_tracking).to.have.property('order_timeline_current_index', 3);
                    });
                });
            
            });

            describe('When user gets all the orders of order tab processing', () => {

                let servicingOrderId, readyOrderId, selfPickServicing, selfPickReady;
                it('should display all the orders of order tab processing', () => {
                    getOrderByFilter(orderApiOptions.PROCESSING, pageOptions.PAGE, pageOptions.LIMIT, userToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${userSuccessMessages.orderRetrieved}`);
                        expect(response.body).to.have.property('data');
                        const orders = response.body.data.orders;
                        
                        const servicingOrderIds = orders.filter( order => order.status === orderApiOptions.SERVICING).map(order => order.id);

                        const readyOrderIds = orders.filter( order => order.status === orderApiOptions.READY).map(order => order.id);

                        servicingOrderId = servicingOrderIds[Math.floor(Math.random() * servicingOrderIds.length)];

                        selfPickServicing = orders.find(order => order.id === servicingOrderId).is_self_pickup;

                        cy.log("Self Pickup Status of Servicing Order:", selfPickServicing);

                        readyOrderId = readyOrderIds[Math.floor(Math.random() * readyOrderIds.length)];

                        selfPickReady = orders.find(order => order.id === readyOrderId).is_self_pickup;

                        cy.log("Self Pickup Status Reeady Order:", selfPickReady);

                        cy.log("Servicing Order ID:", servicingOrderId);
                        cy.log("Ready Order ID:", readyOrderId);
                    });
                    
                });

                it('should display the order tracking using order id having status servicing', () => {
                    if(selfPickServicing === false) {
                        getOrderTrackingById(servicingOrderId, userToken).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${orderSuccessMessages.orderTracking}`);
                            expect(response.body.data.order_tracking).to.have.property('order_timeline_current_index', 4);
                        });
                    } else {
                        getOrderTrackingById(servicingOrderId, userToken).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${orderSuccessMessages.orderTracking}`);
                            expect(response.body.data.order_tracking).to.have.property('order_timeline_current_index', 2);
                        });
                    }
                });

                it('should display the order tracking using order id having status ready', () => {
                    if(selfPickReady === false) {
                        getOrderTrackingById(readyOrderId, userToken).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${orderSuccessMessages.orderTracking}`);
                            expect(response.body.data.order_tracking).to.have.property('order_timeline_current_index', 5);
                        });
                    } else {
                        getOrderTrackingById(readyOrderId, userToken).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${orderSuccessMessages.orderTracking}`);
                            expect(response.body.data.order_tracking).to.have.property('order_timeline_current_index', 3);
                        });
                    }
                });

            });

            describe('When user gets all the orders of order tab delivering', () => {

                let deliveringAssginedId, deliveringOrderId, selfPickDeliveryAssigned, selfPickDropping;
                it('should display all the orders of order tab delivering', () => {
                    getOrderByFilter(orderApiOptions.DROPPING, pageOptions.PAGE, pageOptions.LIMIT, userToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${userSuccessMessages.orderRetrieved}`);
                        expect(response.body).to.have.property('data');
                    
                        const orders = response.body.data.orders;
                    
                        // The filter method is used to create new arrays containing only the orders with the desired status.
                        // The map method is used to extract the id values from those filtered arrays.
                        const deliveringAssignedIds = orders.filter(order => order.status === orderApiOptions.DELIVERY_ASSIGNED).map(order => order.id);

                        const deliveringOrderIds = orders.filter(order => order.status === orderApiOptions.DROPPING).map(order => order.id);

                        deliveringAssginedId = deliveringAssignedIds[Math.floor(Math.random() * deliveringAssignedIds.length)];

                        selfPickDeliveryAssigned = orders.find(order => order.id === deliveringAssginedId).is_self_pickup;

                        cy.log("Self Pickup Status of Delivering Assigned Order:", selfPickDeliveryAssigned);

                        deliveringOrderId = deliveringOrderIds[Math.floor(Math.random() * deliveringOrderIds.length)];

                        selfPickDropping = orders.find(order => order.id === deliveringOrderId).is_self_pickup;

                        cy.log("Self Pickup Status of Delivering Order:", selfPickDropping);

                        cy.log("Delivering Assigned ID:", deliveringAssginedId);
                        cy.log("Delivering Order ID:", deliveringOrderId);
                    });
                });

                it('should display the order tracking using order id having status delivering assigned', () => {
                    if(selfPickDeliveryAssigned === false) {
                        getOrderTrackingById(deliveringAssginedId, userToken).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${orderSuccessMessages.orderTracking}`);
                            expect(response.body.data.order_tracking).to.have.property('order_timeline_current_index', 6);
                        });
                    } else {
                        getOrderTrackingById(deliveringAssginedId, userToken).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${orderSuccessMessages.orderTracking}`);
                            expect(response.body.data.order_tracking).to.have.property('order_timeline_current_index', 4);
                        });
                    }
                });

                it('should display the order tracking using order id having status delivered', () => {
                    if(selfPickDropping === false) {
                        getOrderTrackingById(deliveringOrderId, userToken).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${orderSuccessMessages.orderTracking}`);
                            expect(response.body.data.order_tracking).to.have.property('order_timeline_current_index', 7);
                        });
                    } else {
                        getOrderTrackingById(deliveringOrderId, userToken).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${orderSuccessMessages.orderTracking}`);
                            expect(response.body.data.order_tracking).to.have.property('order_timeline_current_index', 5);
                        });
                    }
                });

            });

            describe('When user gets all the orders of order tab completed', () => {

                let completedOrderId, selfPickDelivered, selfDeliveryDelivered;
                it('should display all the orders of order tab completed', () => {
                    getOrderByFilter(orderApiOptions.COMPLETED, pageOptions.PAGE, pageOptions.LIMIT, userToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${userSuccessMessages.orderRetrieved}`);
                        expect(response.body).to.have.property('data');
                    
                        const orders = response.body.data.orders;
                    
                        // The filter method is used to create new arrays containing only the orders with the desired status.
                        // The map method is used to extract the id values from those filtered arrays.
                        const completedOrderIds = orders.filter(order => order.status === orderApiOptions.COMPLETED).map(order => order.id);

                        completedOrderId = completedOrderIds[Math.floor(Math.random() * completedOrderIds.length)];

                        selfPickDelivered = orders.find(order => order.id === completedOrderId).is_self_pickup;

                        cy.log("Self Pickup Status of Delivered Order:", selfPickDelivered);

                        selfDeliveryDelivered = orders.find(order => order.id === completedOrderId).is_self_delivery;

                        cy.log("Self Delivery Status of Delivered Order:", selfDeliveryDelivered);

                        cy.log("Delivered Order ID:", completedOrderId);
                    });
                });

                it('should display the order tracking using order id having status delivered', () => {
                    if(selfPickDelivered === false && selfDeliveryDelivered === false) {
                        getOrderTrackingById(completedOrderId, userToken).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${orderSuccessMessages.orderTracking}`);
                            expect(response.body.data.order_tracking).to.have.property('order_timeline_current_index', 8);
                        });
                    }else if(selfPickDelivered === true && selfDeliveryDelivered === false) {
                        getOrderTrackingById(completedOrderId, userToken).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${orderSuccessMessages.orderTracking}`);
                            expect(response.body.data.order_tracking).to.have.property('order_timeline_current_index', 6);
                        });
                    }else if(selfPickDelivered === false && selfDeliveryDelivered === true) {
                        getOrderTrackingById(completedOrderId, userToken).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${orderSuccessMessages.orderTracking}`);
                            expect(response.body.data.order_tracking).to.have.property('order_timeline_current_index', 6);
                        });
                    }else if(selfPickDelivered === true && selfDeliveryDelivered === true) {
                        getOrderTrackingById(completedOrderId, userToken).then((response) => {
                            expect(response.status).to.eq(200);
                            expect(response.body).to.have.property('message', `${orderSuccessMessages.orderTracking}`);
                            expect(response.body.data.order_tracking).to.have.property('order_timeline_current_index', 5);
                        });
                    }
                });

            });

            describe('When user gets all the orders of order tab declined', () => {
                
                let cancledOrderId, rejectedOrderId;
                it('should display all the orders of order tab declined', () => {
                    getOrderByFilter(orderApiOptions.DECLINED, pageOptions.PAGE, pageOptions.LIMIT, userToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${userSuccessMessages.orderRetrieved}`);
                        expect(response.body).to.have.property('data');
                    
                        const orders = response.body.data.orders;
                    
                        // The filter method is used to create new arrays containing only the orders with the desired status.
                        // The map method is used to extract the id values from those filtered arrays.
                        const canceledOrderIds = orders.filter(order => order.status === orderApiOptions.CANCELLED).map(order => order.id);

                        const rejectedOrderIds = orders.filter(order => order.status === orderApiOptions.REJECTED).map(order => order.id);

                        cancledOrderId = canceledOrderIds[Math.floor(Math.random() * canceledOrderIds.length)];

                        rejectedOrderId = rejectedOrderIds[Math.floor(Math.random() * rejectedOrderIds.length)];

                        cy.log("Cancelled Order ID:", cancledOrderId);
                        cy.log("Rejected Order ID:", rejectedOrderId);
                    });
                });

                it('should display the order tracking using order id having status cancelled', () => {
                    getOrderTrackingById(cancledOrderId, userToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${orderSuccessMessages.orderTracking}`);
                        expect(response.body.data.order_tracking).to.have.property('order_timeline_current_index', -1);
                    });
                });

                it('should display the order tracking using order id having status rejected', () => {
                    getOrderTrackingById(rejectedOrderId, userToken).then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body).to.have.property('message', `${orderSuccessMessages.orderTracking}`);
                        expect(response.body.data.order_tracking).to.have.property('order_timeline_current_index', -1);
                    });
                });

            });

        });

        describe('When user is in vendor mode', () => {

            before(() => {
                login(orderAccessEmails.approvedVendorEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body).to.have.property('data');
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

            it('should throw error on trying to ge the order tracking', () => {
                getOrderTrackingById(orderId, vendorToken).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', `${commonError.forbidden} vendor mode.`);
                });
            });

        });

        describe('When user is in driver mode', () => {

            before(() => {
                login(orderAccessEmails.approvedDriverEmail, Cypress.env('password'), 'email').then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
                    expect(response.body).to.have.property('data');
                    expect(response.body.data).to.have.property('token');
                    userToken = response.body.data.token;
                });
            });

            it('should switch to driver role', () => {
                role = 'driver';
                switchRole(role, userToken).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body).to.have.property('message', `${commonSuccessMessages.switchedTo} ${role}`);
                    expect(response.body.data).to.have.property('token');
                    driverToken = response.body.data.token;
                });
            });

            it('should throw error on trying to ge the order tracking', () => {
                getOrderTrackingById(orderId, driverToken).then((response) => {
                    expect(response.status).to.eq(403);
                    expect(response.body).to.have.property('message', `${commonError.forbidden} driver mode.`);
                });
            });
            
        });

    });

    describe('Without Login', () => {
            
        it('should throw error message of unauthorized', () => {
            getOrderTrackingById(orderId, '').then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', `${commonError.unauthorized}`);
            });
        });
    
    });

});