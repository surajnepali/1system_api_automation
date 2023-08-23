/// <reference types="cypress" />

import { roleEmail } from "../../api/Auth_APIs/auth.data";
import { login } from "../../api/Auth_APIs/handleAuth.api";
import { authErrorMessages, commonError } from "../../message/errorMessage";
import { commonSuccessMessages } from "../../message/successfulMessage";

describe('Login', () => {

    it("Can't login with empty email", () => {
        login('', Cypress.env('password'), 'email').then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property('message', `email ${commonError.empty}`);
        });
    });

    it("Can't login with empty password", () => {
        login(roleEmail.noRoleEmail, '', 'email').then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property('message', `password ${commonError.empty}`);
        });
    });

    it("Can't login with invalid email", () => {
        login('invalidemail', Cypress.env('password'), 'email').then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property('message', `${commonError.invalidEmail}`);
        });
    });

    it("Can't login with invalid password", () => {
        login(roleEmail.noRoleEmail, 'invalidpassword', 'email').then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property('message', `${authErrorMessages.notMatchedPassword}`);
        });
    });

    it("Can't login with unregistered email", () => {
        login('surajjjj@mail.com', Cypress.env('password'), 'email').then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property('message', `${authErrorMessages.userNotFound}`);
        });
    });

    it("Can't login with password less than 8 characters", () => {
        login(roleEmail.noRoleEmail, '1234567', 'email').then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property('message', `password ${authErrorMessages.lessThan8Characters}`);
        });
    });

    it("Can login with registered email and password", () => {
        login(roleEmail.noRoleEmail, Cypress.env('password'), 'email').then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('message', `${commonSuccessMessages.sucessfulLogin}`);
        });
    });

});