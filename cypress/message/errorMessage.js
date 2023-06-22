const ERROR = {
    invalidEmail: 'email must be an email.',
    invalidPurpose: 'purpose must be one of the following values: verifyEmail, forgotpassword.',
    invalidOtp: 'otp must be shorter than or equal to 4 characters.',
    invalidUsername: 'username can not contains other than letters or space.',
    invalidPassword: 'password must be longer than or equal to 8 characters.',
    notMatchedPassword: 'Password not matched.',
    invalidEstimatedServiceUsage: 'estimated_service_usage must be an integer number.',
    emptyEmail: 'email should not be empty.',
    emptyPurpose: 'purpose must be longer than or equal to 2 characters.',
    emptyOtp: 'otp should not be empty.',
    emptyUsername: 'username must be longer than or equal to 3 characters.',
    emptyPassword: 'password must be longer than or equal to 8 characters.',
    emptyEstimatedServiceUsage: 'estimated_service_usage must be an integer number.',
    userNotExist: 'No info found. Please register.',
    userNotFound: 'User not found. Please register',
    driverRoleNotApplied: 'Cannot switch to driver. You must submit application for driver before switching.',
    vendorRoleNotApplied: 'Cannot switch to vendor. You must submit application for vendor before switching.',
    emptyRole: 'role must be one of the following values: user, driver, vendor.',
    oldInvalidPassword: "Old Password don't matched",
    newPasswordSame: 'You must enter different password to change password.',

}

export default ERROR;