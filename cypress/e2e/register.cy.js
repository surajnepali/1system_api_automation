/// reference types="cypress" />

import register from "../api/register.api"
import ERROR from "../message/errorMessage"
import SUCCESSFUL from "../message/successfulMessage"

let otp;

describe('Register', () => {
  
  describe('setOTP', () => {
    it("Can't send otp to already registered email", () => {
      register.setOTP(Cypress.env('registeredEmail'), 'verifyEmail').then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body).to.have.property('message', 'User with email ' + Cypress.env('registeredEmail') + ' already exist. Login with email')
      })
    })

    it("Can't send otp to empty email", () => {
      register.setOTP('', 'verifyEmail').then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body).to.have.property('message', ERROR.emptyEmail)
      })
    })

    it("Can't send otp to invalid email", () => {
      register.setOTP('invalidemail', 'verifyEmail').then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body).to.have.property('message', ERROR.invalidEmail)
      })
    })

    it("Can't send otp to email with invalid purpose", () => {
      register.setOTP(Cypress.env('newEmail'), 'invalidPurpose').then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body).to.have.property('message', ERROR.invalidPurpose)
      })
    })

    it("Can't send otp to email with empty purpose", () => {
      register.setOTP(Cypress.env('newEmail'), '').then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body).to.have.property('message', ERROR.emptyPurpose)
      })
    })

    it("Can't send otp to empty email and purpose", () => {
      register.setOTP('', '').then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body).to.have.property('message', ERROR.emptyEmail)
      })
    })


    it("Can send otp to new email", () => {
      register.setOTP(Cypress.env('newEmail'), 'verifyEmail').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('message', SUCCESSFUL.otpEmailSent)
        expect(response.body).to.have.property('data')
        expect(response.body.data).to.have.property('otp')
        otp = response.body.data.otp
        cy.log(otp)
      })
    })

  })

  describe('verifyOTP', () => {
  
    it("Can't verify otp with invalid email", () => {
      register.verifyOTP('invalidemail', 'verifyEmail', otp).then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body).to.have.property('message', ERROR.invalidEmail)
      })
    })

    it("Can't verify otp with empty email", () => {
      register.verifyOTP('', 'verifyEmail', otp).then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body).to.have.property('message', ERROR.emptyEmail)
      })
    })

    it("Can't verify otp with invalid purpose", () => {
      register.verifyOTP(Cypress.env('newEmail'), 'invalidPurpose', otp).then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body).to.have.property('message', ERROR.invalidPurpose)
      })
    })

    it("Can't verify otp with empty purpose", () => {
      register.verifyOTP(Cypress.env('newEmail'), '', otp).then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body).to.have.property('message', ERROR.emptyPurpose)
      })
    })
  
    it("Can't verify otp with invalid otp", () => {
      register.verifyOTP(Cypress.env('newEmail'), 'verifyEmail', 'invalidotp').then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body).to.have.property('message', ERROR.invalidOtp)
      })
    })

    it("Can't verify otp with empty otp", () => {
      register.verifyOTP(Cypress.env('newEmail'), 'verifyEmail', '').then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body).to.have.property('message', ERROR.emptyOtp)
      })
    })

    it("Can verify otp with valid otp", () => {
      register.verifyOTP(Cypress.env('newEmail'), 'verifyEmail', otp).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('message', SUCCESSFUL.otpVerified)
      })
    })

  })

  describe('registerCustomer', () => {
  
    it("Can't register with invalid email", () => {
      register.registerCustomer('invalidemail', 'username', 'password', otp, '12').then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body).to.have.property('message', ERROR.invalidEmail)
      })
    });

    it("Can't register with empty email", () => {
      register.registerCustomer('', 'username', 'password', otp, '12').then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body).to.have.property('message', ERROR.emptyEmail)
      })
    });

    it("Can't register with invalid username", () => {
      register.registerCustomer(Cypress.env('newEmail'), 'username123', 'password', otp, '12').then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body).to.have.property('message', ERROR.invalidUsername)
      })
    });

    it("Can't register with empty username", () => {
      register.registerCustomer(Cypress.env('newEmail'), '', 'password', otp, '12').then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body).to.have.property('message', ERROR.emptyUsername)
      })
    });

    it("Can't register with empty password", () => {
      register.registerCustomer(Cypress.env('newEmail'), 'username', '', otp, '12').then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body).to.have.property('message', ERROR.emptyPassword)
      })
    });

    it("Can't register with invalid otp", () => {
      register.registerCustomer(Cypress.env('newEmail'), 'username', 'password', 'invalidotp', '12').then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body).to.have.property('message', ERROR.invalidOtp)
      })
    });

    it("Can't register with empty otp", () => {
      register.registerCustomer(Cypress.env('newEmail'), 'username', 'password', '', '12').then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body).to.have.property('message', ERROR.emptyOtp)
      })
    });

    it("Can't register with invalid estimated_service_usage", () => {
      register.registerCustomer(Cypress.env('newEmail'), 'username', 'password', otp, 'invalidestimated_service_usage').then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body).to.have.property('message', ERROR.invalidEstimatedServiceUsage)
      })
    });

    it("Can't register with empty estimated_service_usage", () => {
      register.registerCustomer(Cypress.env('newEmail'), 'username', 'password', otp, '').then((response) => {
        expect(response.status).to.eq(400)
        expect(response.body).to.have.property('message', ERROR.emptyEstimatedServiceUsage)
      })
    });

    // it("Can't register with image file with size more than 5 MB", () => {
    //   cy.fixture('sample.jpg').as('sampleImage');
    //   cy.get('@sampleImage').then((imageData) => {
    //     cy.api({
    //       method: 'POST',
    //       url: Cypress.env('apiUrl') + ENDPOINTS.registerCustomer,
    //       body: {
    //         email: Cypress.env('newEmail'),
    //         username: 'username',
    //         password: 'password',
    //         otp: otp,
    //         estimated_service_usage: '12',
    //         file: imageData
    //       },
    //       failOnStatusCode: false,
    //     }).then((response) => {
    //       expect(response.status).to.eq(400)
    //       expect(response.body).to.have.property('message', ERROR.imageSize)
    //     })
    //   })
    // });

    it("Can register with valid data", () => {
      register.registerCustomer(Cypress.env('newEmail'), 'username', 'password', otp, '12').then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('message', SUCCESSFUL.customerRegistered)
      })
    });

  })

})