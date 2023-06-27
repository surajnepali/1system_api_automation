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