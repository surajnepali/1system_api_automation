import { faker } from "@faker-js/faker";

export const createOrderData= {
    'total_price': faker.number.int({ min: 50, max: 500 }),
    'pickup_longitude': faker.location.longitude(),
    'pickup_latitude': faker.location.latitude(),
    'dropoff_longitude': faker.location.longitude(),
    'dropoff_latitude': faker.location.latitude(),
    'pickup_time': faker.date.soon(),
    'dropoff_time': faker.date.future(),
    'offering_id': 1,
    'service_id': 1,
    'branch_id': 1,
    'is_self_delivery': faker.datatype.boolean(),   
    'is_self_pickup': faker.datatype.boolean(),
};

export const orderAccessEmails = {
    onlyCustomerEmail: 'lepoha7775@rockdian.com',
    appliedVendorEmail: 'xekag24890@peogi.com',
    approvedVendorEmail: 'pustesotru@gufum.com',
    appliedDriverEmail: 'nebem35733@camplvad.com',
    approvedDriverEmail: 'hicif13925@soremap.com',
};