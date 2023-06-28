import { faker } from "@faker-js/faker";

export const driverRole = {
    appliedDriverEmail: 'nebem35733@camplvad.com',
    approvedDriverEmail: 'hicif13925@soremap.com',
    freshEmail: 'balif60015@aramask.com'
};

export const editDriverApplicationData = {
    work_permit: faker.number.int({ min: 100, max: 10000 }).toString(),
    citizenship_number: faker.finance.accountNumber(),
    vehicle_type: 'Car',
    vehicle_registration: faker.finance.creditCardNumber(),
    license_number: faker.finance.accountNumber(10),
    state_id: faker.airline.recordLocator({ allowNumerics: true }),
};