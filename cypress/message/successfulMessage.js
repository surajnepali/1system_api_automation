const SUCCESSFUL = {
    otpEmailSent: 'OTP send successfully! Check out your email',
    otpVerified: 'OTP matched',
    customerRegistered: 'successful',
    otpToSetPasswordSent: 'OTP Sent to your email. Please check your inbox.',
    passwordReset: 'Successfully updated. Please login.',
    sucessfulLogin: 'successful',
    driverApplicationInReview: 'You application is in review process. Please wait to login into driver after being verified.',
    vendorApplicationInReview: 'You application is in review process. Please wait to login into vendor after being verified.',
    driverRoleSwitched: 'Successfully switched to driver',
    vendorRoleSwitched: 'Successfully switched to vendor',
    passwordChanged: 'Successfully updated.',
    profileInfo: 'User found',
    profileInfoUpdated: 'Successfully updated',
}

export default SUCCESSFUL;

export const commonSuccessMessages = {
    sucessfulLogin: 'successful',
    switchedTo: 'Successfully switched to',
    updated: 'Successfully updated',
    profileInfo: 'User found',
};

export const vendorSuccessMessages = {
    branchCreated: 'Successfully created new branch',
    retrievedAllBranches: 'All branches of vendor',
    retrievedServices: 'Successfully get service data',
    detailsOfOffering: 'Offering details',
    allOfferingsOfBranch: 'All the Offering from the branch',
    serviceAdded: 'Successfully added service to this vendor',
    offeringEdited: 'Edited successfully.',
};

export const driverSuccessMessages = {
    gigsRetrieved: 'Retrived gigs',
    gigAccepted: 'Gig successfully Picked.',
    gigPicked: 'Successfully picked item.',
    bidPlaced: 'Successfully placed bidding.',
    bidUpdated: 'Successfully updated bidding.',
    bidRetrieved: 'Successfully Retrieve',
};

export const orderSuccessMessages = {
    successful: 'Successfully ',
    orderTracking: 'Order Tracking',
    orderRejectedByVendor: 'Order successfully rejected.',
    getOrdersByVendor: 'Orders',
    isNow: 'This order is now',
};

export const userSuccessMessages = {
    orderRetrieved: 'Retrived Successfully',
    biddingRetrieved: 'Retrived bidding',
    bidAccepted: 'Successfully accepted the bidding'
};