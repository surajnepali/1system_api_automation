import { faker } from "@faker-js/faker";

export const createUserData = {
    'username': faker.finance.accountName(),
    'password': '12345678',
    'otp': '1234',
    'estimated_service_usage': faker.number.int({ min: 24, max: 72 }),
    'landmark': faker.location.secondaryAddress(),
};

export const editUserData = {
    'username': faker.finance.accountName(),
    'password': '12345678',
    'estimated_service_usage': faker.number.int({ min: 24, max: 72 }),
    'landmark': faker.location.secondaryAddress(),
};