import { faker } from "@faker-js/faker";

export const vendorCreateData = {
    vendorName: "Vendor 1",
    vendorEmail: "random@gmail.com",
    vendorStateId: "1234",
    vendorPlaceId: "1234",
    vendorContact: "1234567890",
    vendorLandmark: "3rd Floor of the Avengers building",
    vendorLongitude: "23.73647",
    vendorLatitude: "89.1973",
    applyForVendorEmail: "nebem35733@camplvad.com",
    notAppliedEmail: "cacoto8214@soremap.com",
    appliedEmail: "habiri9567@onlcool.com",
    approvedVendor: "kemoja5763@peogi.com"
};

export const vendorEditData = {
    editVendorName: "Vendor 2",
    editVendorEmail: "random2@gmail.com",
    editVendorStateId: "12345",
    editVendorPlaceId: "12345",
    editVendorContact: "1234567891",
    editVendorLandmark: "4th Floor of the Avengers building",
    editVendorLongitude: "33.73648",
    editVendorLatitude: "79.1974",
};

export const vendorFakerData = {
    company_name :faker.company.name(),
    state_id :'28YHUJHJ1',
    company_email :faker.internet.email(),
};

export const vendorFakerData2 = {
    landmark :faker.location.secondaryAddress(),
    contact :faker.phone.imei(),
    longitude :faker.location.longitude(),
    latitude :faker.location.latitude(),
};

export const branchFakerData = {
    name :faker.company.name(),
    landmark :faker.location.secondaryAddress(),
    contact :faker.phone.number('415#######'),
    longitude :faker.location.longitude(),
    latitude :faker.location.latitude(),
    place_id :'1234',
};

export const editBranchFakerData = {
    landmark :faker.location.secondaryAddress(),
    contact :faker.phone.number('415#######'),
    longitude :faker.location.longitude(),
    latitude :faker.location.latitude(),
    place_id :'1234567',
}; 

export const createOfferingFakerData = {
    price :456765,
    estimated_hour :48,
    description :faker.lorem.sentence(),
    service_id :'1',
};

export const editOfferingFakerData = {
    price :678,
    estimated_hour :35,
    description :faker.lorem.sentence(),
    service_id : '2',
};

export const createBranchFakerData = {
    name :faker.company.name(),
    landmark :faker.location.secondaryAddress(),
    contact :faker.phone.number('415#######'),
    longitude :faker.location.longitude(),
    latitude :faker.location.latitude(),
    place_id :'1234',
};