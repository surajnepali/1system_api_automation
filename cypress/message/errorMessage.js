const ERROR = {
    invalidEmail: 'email must be an email.',
    invalidPurpose: 'purpose must be one of the following values: verifyEmail, forgotpassword, changeLoginMethod.',
    invalidOtp: 'otp must be shorter than or equal to 4 characters.',
    invalidUsername: 'username can not contains other than letters or space.',
    invalidPassword: 'password must be longer than or equal to 8 characters.',
    invalidAddress: 'address must be longer than or equal to 2 characters.',
    invalidLongitude: 'longitude must be a number conforming to the specified constraints.',
    invalidLatitude: 'latitude must be a number conforming to the specified constraints.',
    invalidContact: 'Enter valid phone number.',
    notMatchedPassword: 'Password not matched.',
    invalidEstimatedServiceUsage: 'estimated_service_usage must be an integer number.',
    emptyEmail: 'email should not be empty.',
    emptyPurpose: 'purpose must be longer than or equal to 2 characters.',
    emptyOtp: 'otp should not be empty.',
    emptyUsername: 'username must be longer than or equal to 3 characters.',
    emptyPassword: 'password should not be empty.',
    emptyCurrentPassword: 'current_password should not be empty.',
    emptyAddress: 'address must be longer than or equal to 2 characters.',
    emptyLongitude: 'longitude should not be empty.',
    emptyLatitude: 'latitude should not be empty.',
    emptyContact: 'contact should not be empty.',
    emptyEstimatedServiceUsage: 'estimated_service_usage must be an integer number.',
    userNotExist: 'No info found. Please register.',
    userNotFound: 'User not found. Please register',
    driverRoleNotApplied: 'You must be driver to switch. Please apply for driver to be driver',
    vendorRoleNotApplied: 'You must be vendor to switch. Please apply for vendor to be vendor',
    emptyRole: 'role must be one of the following values: user, driver, vendor.',
    oldInvalidPassword: "Old Password don't matched",
    notMatchedPassword: "Password not matched.",
    newPasswordSame: 'You must enter different password to change password.',
    unauthorized: 'Unauthorized access',
    // contactEmpty: 'contact must be longer than or equal to 10 characters.'

}

export default ERROR;

export const commonError = {
    unauthorized: 'Unauthorized access',
    newPasswordSame: 'You must enter different password to change password.',
    forbidden: 'You are not allowed to perform this action with',
    empty: "should not be empty.",
    invalidContact: 'Enter valid',
    invalidEmail: 'email must be an email.',
    lessthan10digit: 'must be longer than or equal to 10 characters.',
    invalid: 'must be a number conforming to the specified constraints.',
    lessThan0: 'must not be less than 0.',
    lessThan1: 'must not be less than 1.',
    lessThan: 'must not be less than',
    greaterThan: 'must not be greater than',
    mustBeInteger: 'must be an integer number.',
    mustBeEmail: 'must be an email.',
    lessThan8Characters: 'must be longer than or equal to 8 characters.',
    lessThanxCharacters: 'must be longer than or equal to ',
    mustBeValidDate: 'must be a valid ISO 8601 date string.',
    userNotExist: 'No info found. Please register.',
    userNotFound: 'User not found. Please register',
    lessThan4Characters: 'must be shorter than or equal to 4 characters.',
    moreThan2Characters: 'must be longer than or equal to 2 characters.',
    moreThan3Characters: 'must be longer than or equal to 3 characters.',
};

export const orderErrorMessages = {
    alreadyCompleted: "You can't perform any action to this order.",
    selfAssignedErrorr: 'location & time if you are not self assigned for',
    selfAssignedError: 'location and time if you are not self assigned for',
    detailsNotFound: "Can't find the order details.",
    cantServiceThisOrder: "You can't service this order at this time.",
    cantChangeStatus: "You can't change status from this vendor.",
    cantAcceptBid: "Can't accept bidding right now.",
    nothingToReject: 'No order found to reject',
    couldNotCancel: "You cann't cancel your order at this point.",
};

export const driverErrorMessages = {
    noOrderFound: 'No order found',
    noGigFound: 'No Gig found.',
    notAssignedGig: 'You are not assigned to this gig.'
};

export const authErrorMessages = {
    oldInvalidPassword: "Old Password don't matched",
    notMatchedPassword: "Password not matched.",
    userNotExist: 'No info found. Please register.',
    userNotFound: 'User not found. Please register',
    lessThan8Characters: 'must be longer than or equal to 8 characters.',
    invalidOtp: 'otp must be shorter than or equal to 4 characters.',
    invalidEmail: 'email must be an email.',
    invalidPurpose: 'purpose must be one of the following values: verifyEmail, forgotpassword, changeLoginMethod.',
    invalidUsername: 'username can not contains other than letters or space.',
};

export const userErrorMessages = {
    notAppliedYet: 'Please apply for',
};