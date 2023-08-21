export const commonError = {
    emptyRole: 'role must be one of the following values: user, driver, vendor.',
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
    mustBeString: 'must be a string.',
    lessThan8Characters: 'must be longer than or equal to 8 characters.',
    lessThanxCharacters: 'must be longer than or equal to ',
    mustBeValidDate: 'must be a valid ISO 8601 date string.',
    userNotExist: 'No info found. Please register.',
    userNotFound: 'User not found. Please register',
    lessThan4Characters: 'must be shorter than or equal to 4 characters.',
    moreThan2Characters: 'must be longer than or equal to 2 characters.',
    moreThan3Characters: 'must be longer than or equal to 3 characters.',
    invalidVehicleType: 'vehicle_type must be one of the following values: bicycle, motorcycle, car, suv, minivan, truck.',
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
    cantPerformAction: "You can't perform this action.",
    cantReAccept: "Can't accept this order at this time.",
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
    alreadyVerified: 'You are already verified for',
    pleaseSwitch: 'Please switch to',
    driverRoleNotApplied: 'You must be driver to switch. Please apply for driver to be driver',
    vendorRoleNotApplied: 'You must be vendor to switch. Please apply for vendor to be vendor',
    notApplied: "Your request can't be proceed. Please submit application for",
};