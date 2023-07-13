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
    forbidden: 'You are not allowed to perform this action with user mode.',
    empty: "should not be empty.",
    invalidContact: 'Enter valid',
    lessthan10digit: 'must be longer than or equal to 10 characters.',
    invalid: 'must be a number conforming to the specified constraints.',
    lessThan0: 'must not be less than 0.',
    mustBeInteger: 'must be an integer number.',
    lessThan8Characters: 'must be longer than or equal to 8 characters.',
};