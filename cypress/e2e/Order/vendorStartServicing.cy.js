/// <reference types="Cypress" />

import {
  acceptGig,
  getAllGigs,
  pickGig,
} from '../../api/Driver_APIs/driver.api';
import {
  acceptOrderByVendor,
  createOrder,
  vendorStartServicing,
} from '../../api/Order_APIs/handleOrder.api';
import {
  createOrderData,
  orderAccessEmails,
} from '../../api/Order_APIs/order.data';
import { getAllOfferingsOfBranch } from '../../api/Vendor_APIs/branchOffering.api';
import getAllBranchesOfVendorApi from '../../api/Vendor_APIs/getAllBranchesOfVendor.api';
import { getOrders } from '../../api/Vendor_APIs/getOrders.api';
import loginApi from '../../api/login.api';
import switchRoleApi from '../../api/switchRole.api';
import { orderApiOptions } from '../../constants/apiOptions.constants';
import { orderErrorMessages } from '../../message/Error/Order/orderErrorMessages';
import { driverSuccessMessages } from '../../message/Successful/Driver/driverSuccessMessages';
import { orderSuccessMessages } from '../../message/Successful/Order/orderSuccessMessages';
import { vendorSuccessMessages } from '../../message/Successful/Vendor/vendorSuccessMessage';
import SUCCESSFUL from '../../message/successfulMessage';

let userToken,
  vendorToken,
  driverToken,
  branchId,
  serviceId,
  offeringId,
  gigId,
  orderId;

describe('Vendor Start Servicing API Testing', () => {
  describe('After Login', () => {
    describe('User is an approved Vendor tries to start servicing', () => {
    //   describe('When user is switched to vendor role', () => {
    //     before(() => {
    //       loginApi
    //         .loginUser(
    //           orderAccessEmails.approvedVendorEmail,
    //           Cypress.env('password'),
    //           'email'
    //         )
    //         .then((response) => {
    //           expect(response.status).to.eq(200);
    //           expect(response.body).to.have.property(
    //             'message',
    //             SUCCESSFUL.sucessfulLogin
    //           );
    //           expect(response.body.data).to.have.property('token');
    //           userToken = response.body.data.token;
    //         });
    //     });

    //     it('should switch to vendor role', () => {
    //       switchRoleApi.switchRole('vendor', userToken).then((response) => {
    //         expect(response.status).to.eq(200);
    //         expect(response.body).to.have.property(
    //           'message',
    //           vendorSuccessMessages.switchedToVendor
    //         );
    //         expect(response.body.data).to.have.property('token');
    //         vendorToken = response.body.data.token;
    //       });
    //     });

    //     it('should get all the branches of the vendor', () => {
    //       getAllBranchesOfVendorApi
    //         .getAllBranchesOfVendor(vendorToken)
    //         .then((response) => {
    //           expect(response.status).to.eq(200);
    //           expect(response.body).to.have.property(
    //             'message',
    //             vendorSuccessMessages.retrievedAllBranches
    //           );
    //           const branches = response.body.data.branches;
    //           const randomIndex = Math.floor(Math.random() * branches.length);
    //           cy.log('Random Index: ' + randomIndex);
    //           const randomBranch = branches[randomIndex];
    //           branchId = randomBranch.id;
    //           cy.log('Branch ID: ' + branchId);
    //         });
    //     });

    //     it('should get all the offerings of the branch', () => {
    //       getAllOfferingsOfBranch(vendorToken, branchId).then((response) => {
    //         expect(response.status).to.eq(200);
    //         expect(response.body).to.have.property(
    //           'message',
    //           vendorSuccessMessages.allOfferingsOfBranch
    //         );
    //         const offerings = response.body.data.offerings;
    //         const randomIndex = Math.floor(Math.random() * offerings.length);
    //         serviceId = offerings[randomIndex].service_id;
    //         cy.log(serviceId);
    //         const randomOffering = offerings[randomIndex];
    //         offeringId = randomOffering.id;
    //         cy.log('Offering ID: ' + offeringId);
    //       });
    //     });

    //     it('should login with the customer email', () => {
    //       loginApi
    //         .loginUser(
    //           orderAccessEmails.onlyCustomerEmail,
    //           Cypress.env('password'),
    //           'email'
    //         )
    //         .then((response) => {
    //           expect(response.status).to.eq(200);
    //           expect(response.body).to.have.property(
    //             'message',
    //             SUCCESSFUL.sucessfulLogin
    //           );
    //           expect(response.body.data).to.have.property('token');
    //           userToken = response.body.data.token;
    //         });
    //     });

    //     it('should create order successfully', () => {
    //       const x = {
    //         ...createOrderData,
    //         branch_id: branchId,
    //         service_id: serviceId,
    //         offering_id: offeringId,
    //         pickup_time: '2022-06-30 01:05:00.099',
    //         dropoff_time: '2022-07-01 01:05:00.099',
    //       };
    //       createOrder(x, userToken).then((response) => {
    //         expect(response.status).to.eq(201);
    //         expect(response.body).to.have.property(
    //           'message',
    //           orderSuccessMessages.orderCreatedSuccessfully
    //         );
    //         expect(response.body.data).to.have.property('order');
    //         expect(response.body.data.order).to.have.property('id');
    //         expect(response.body.data.order).to.have.property(
    //           'branch_id',
    //           branchId
    //         );
    //         expect(response.body.data.order).to.have.property(
    //           'service_id',
    //           serviceId
    //         );
    //         expect(response.body.data.order).to.have.property(
    //           'offering_id',
    //           offeringId
    //         );
    //         orderId = response.body.data.order.id;
    //         expect(response.body.data.order).to.have.property(
    //           'status',
    //           'initialized'
    //         );
    //         cy.log('Order Status: ', response.body.data.order.status);
    //       });
    //     });

    //     it('Vendor should accept the order', () => {
    //       acceptOrderByVendor(orderId, vendorToken).then((response) => {
    //         expect(response.status).to.eq(200);
    //         expect(response.body).to.have.property(
    //           'message',
    //           orderSuccessMessages.orderAcceptedByVendor
    //         );
    //         expect(response.body.data.order[0]).to.have.property(
    //           'status',
    //           'accepted'
    //         );
    //         cy.log('Order Status: ', response.body.data.order[0].status);
    //       });
    //     });

    //     it('should login with the driver email', () => {
    //       loginApi
    //         .loginUser(
    //           orderAccessEmails.approvedDriverEmail,
    //           Cypress.env('password'),
    //           'email'
    //         )
    //         .then((response) => {
    //           expect(response.status).to.eq(200);
    //           expect(response.body).to.have.property(
    //             'message',
    //             SUCCESSFUL.sucessfulLogin
    //           );
    //           expect(response.body.data).to.have.property('token');
    //           userToken = response.body.data.token;
    //         });
    //     });

    //     it('should switch to driver role', () => {
    //       switchRoleApi.switchRole('driver', userToken).then((response) => {
    //         expect(response.status).to.eq(200);
    //         expect(response.body).to.have.property(
    //           'message',
    //           driverSuccessMessages.roleSwitched
    //         );
    //         expect(response.body.data).to.have.property('token');
    //         driverToken = response.body.data.token;
    //       });
    //     });

    //     it('should get all the gigs', () => {
    //       getAllGigs(driverToken, 1, 140).then((response) => {
    //         expect(response.status).to.eq(200);
    //         expect(response.body).to.have.property(
    //           'message',
    //           driverSuccessMessages.gigsRetrieved
    //         );
    //         expect(response.body.data).to.have.property('gigs');
    //         expect(response.body.data.gigs).to.be.an('array');
    //         const gigs = response.body.data.gigs;
    //         for (let i = 0; i < gigs.length; i++) {
    //           if (gigs[i].order_id !== orderId) {
    //             continue;
    //           }
    //           gigId = gigs[i].gig_id;
    //           cy.log('Gig ID: ' + gigId);
    //           break;
    //         }
    //       });
    //     });

    //     it('should accept the gig', () => {
    //       acceptGig(driverToken, gigId).then((response) => {
    //         expect(response.status).to.eq(200);
    //         expect(response.body).to.have.property(
    //           'message',
    //           driverSuccessMessages.gigAccepted
    //         );
    //       });
    //     });

    //     it('should pick the gig', () => {
    //       pickGig(driverToken, gigId).then((response) => {
    //         expect(response.status).to.eq(200);
    //         expect(response.body).to.have.property(
    //           'message',
    //           driverSuccessMessages.gigPicked
    //         );
    //       });
    //     });

    //     it('should get order from the gig', () => {
    //       getOrders(
    //         vendorToken,
    //         1,
    //         100,
    //         orderApiOptions.PICKING,
    //         branchId
    //       ).then((response) => {
    //         expect(response.status).to.eq(200);
    //         expect(response.body).to.have.property(
    //           'message',
    //           orderSuccessMessages.getOrdersByVendor
    //         );
    //         expect(response.body.data).to.have.property('orders');
    //         expect(response.body.data.orders).to.be.an('array');
    //         let dataLength = response.body.data.orders.length;
    //         if (dataLength === 0) {
    //           cy.log('No orders found');
    //         } else {
    //           cy.log(
    //             'Order Length from Vendor with multiple order tabs: ' +
    //               dataLength
    //           );
    //         }
    //       });
    //     });

    //     it('should start servicing by the vendor', () => {
    //       vendorStartServicing(orderId, vendorToken).then((response) => {
    //         expect(response.status).to.eq(200);
    //         expect(response.body).to.have.property(
    //           'message',
    //           orderSuccessMessages.isNowServicing
    //         );
    //       });
    //     });
    //   });

      describe('Unappropriate vendor is trying to start servicing', () => {
        before(() => {
          loginApi
            .loginUser(
              orderAccessEmails.approvedVendorEmail,
              Cypress.env('password'),
              'email'
            )
            .then((response) => {
              expect(response.status).to.eq(200);
              expect(response.body).to.have.property(
                'message',
                SUCCESSFUL.sucessfulLogin
              );
              expect(response.body.data).to.have.property('token');
              userToken = response.body.data.token;
            });
        });

        it('should switch to vendor role', () => {
          switchRoleApi.switchRole('vendor', userToken).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property(
              'message',
              vendorSuccessMessages.switchedToVendor
            );
            expect(response.body.data).to.have.property('token');
            vendorToken = response.body.data.token;
          });
        });

        it('should get all the branches of the vendor', () => {
          getAllBranchesOfVendorApi
            .getAllBranchesOfVendor(vendorToken)
            .then((response) => {
              expect(response.status).to.eq(200);
              expect(response.body).to.have.property(
                'message',
                vendorSuccessMessages.retrievedAllBranches
              );
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
            expect(response.body).to.have.property(
              'message',
              vendorSuccessMessages.allOfferingsOfBranch
            );
            const offerings = response.body.data.offerings;
            const randomIndex = Math.floor(Math.random() * offerings.length);
            serviceId = offerings[randomIndex].service_id;
            cy.log(serviceId);
            const randomOffering = offerings[randomIndex];
            offeringId = randomOffering.id;
            cy.log('Offering ID: ' + offeringId);
          });
        });

        it('should login with the customer email', () => {
          loginApi
            .loginUser(
              orderAccessEmails.onlyCustomerEmail,
              Cypress.env('password'),
              'email'
            )
            .then((response) => {
              expect(response.status).to.eq(200);
              expect(response.body).to.have.property(
                'message',
                SUCCESSFUL.sucessfulLogin
              );
              expect(response.body.data).to.have.property('token');
              userToken = response.body.data.token;
            });
        });

        it('should create order successfully', () => {
          const x = {
            ...createOrderData,
            branch_id: branchId,
            service_id: serviceId,
            offering_id: offeringId,
            pickup_time: '2022-06-30 01:05:00.099',
            dropoff_time: '2022-07-01 01:05:00.099',
          };
          createOrder(x, userToken).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body).to.have.property(
              'message',
              orderSuccessMessages.orderCreatedSuccessfully
            );
            expect(response.body.data).to.have.property('order');
            expect(response.body.data.order).to.have.property('id');
            expect(response.body.data.order).to.have.property(
              'branch_id',
              branchId
            );
            expect(response.body.data.order).to.have.property(
              'service_id',
              serviceId
            );
            expect(response.body.data.order).to.have.property(
              'offering_id',
              offeringId
            );
            orderId = response.body.data.order.id;
            expect(response.body.data.order).to.have.property(
              'status',
              'initialized'
            );
            cy.log('Order Status: ', response.body.data.order.status);
          });
        });

        it('Vendor should accept the order', () => {
          acceptOrderByVendor(orderId, vendorToken).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property(
              'message',
              orderSuccessMessages.orderAcceptedByVendor
            );
            expect(response.body.data.order[0]).to.have.property(
              'status',
              'accepted'
            );
            cy.log('Order Status: ', response.body.data.order[0].status);
          });
        });

        it('should login with the driver email', () => {
          loginApi
            .loginUser(
              orderAccessEmails.approvedDriverEmail,
              Cypress.env('password'),
              'email'
            )
            .then((response) => {
              expect(response.status).to.eq(200);
              expect(response.body).to.have.property(
                'message',
                SUCCESSFUL.sucessfulLogin
              );
              expect(response.body.data).to.have.property('token');
              userToken = response.body.data.token;
            });
        });

        it('should switch to driver role', () => {
          switchRoleApi.switchRole('driver', userToken).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property(
              'message',
              driverSuccessMessages.roleSwitched
            );
            expect(response.body.data).to.have.property('token');
            driverToken = response.body.data.token;
          });
        });

        it('should get all the gigs', () => {
          getAllGigs(driverToken, 1, 140).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property(
              'message',
              driverSuccessMessages.gigsRetrieved
            );
            expect(response.body.data).to.have.property('gigs');
            expect(response.body.data.gigs).to.be.an('array');
            const gigs = response.body.data.gigs;
            for (let i = 0; i < gigs.length; i++) {
              if (gigs[i].order_id !== orderId) {
                continue;
              }
              gigId = gigs[i].gig_id;
              cy.log('Gig ID: ' + gigId);
              break;
            }
          });
        });

        it('should accept the gig', () => {
          acceptGig(driverToken, gigId).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property(
              'message',
              driverSuccessMessages.gigAccepted
            );
          });
        });

        it('should pick the gig', () => {
          pickGig(driverToken, gigId).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property(
              'message',
              driverSuccessMessages.gigPicked
            );
          });
        });

        it('should get order from the gig', () => {
          getOrders(
            vendorToken,
            1,
            100,
            orderApiOptions.PICKING,
            branchId
          ).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property(
              'message',
              orderSuccessMessages.getOrdersByVendor
            );
            expect(response.body.data).to.have.property('orders');
            expect(response.body.data.orders).to.be.an('array');
            let dataLength = response.body.data.orders.length;
            if (dataLength === 0) {
              cy.log('No orders found');
            } else {
              cy.log(
                'Order Length from Vendor with multiple order tabs: ' +
                  dataLength
              );
            }
          });
        });

        it('should login with any other vendor email', () => {
            loginApi
                .loginUser(
                Cypress.env('userWithBothRolesApproved'),
                Cypress.env('password'),
                'email'
                )
                .then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property(
                    'message',
                    SUCCESSFUL.sucessfulLogin
                );
                expect(response.body.data).to.have.property('token');
                userToken = response.body.data.token;
                });
        });

        it('should switch to vendor role', () => {
            switchRoleApi.switchRole('vendor', userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property(
                'message',
                vendorSuccessMessages.switchedToVendor
                );
                expect(response.body.data).to.have.property('token');
                vendorToken = response.body.data.token;
            });
        });

        it('should start servicing by the vendor', () => {
          vendorStartServicing(orderId, vendorToken).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property(
              'message',
              orderErrorMessages.cantChangeStatus
            );
          });
        });
      });
    });
  });
});
