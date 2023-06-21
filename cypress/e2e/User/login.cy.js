/// <reference types="cypress" />

import login from "../../api/login.api";
import ERROR from "../../message/errorMessage";
import SUCCESSFUL from "../../message/successfulMessage";

describe('Login', () => {

    it("Can't login with empty email", () => {
        login.loginUser('', Cypress.env('password')).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property('message', ERROR.emptyEmail);
        });
    });

    it("Can't login with empty password", () => {
        login.loginUser(Cypress.env('registeredEmail'), '').then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property('message', ERROR.emptyPassword);
        });
    });

    it("Can't login with invalid email", () => {
        login.loginUser('invalidemail', Cypress.env('password')).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property('message', ERROR.invalidEmail);
        });
    });

    it("Can't login with invalid password", () => {
        login.loginUser(Cypress.env('registeredEmail'), 'invalidpassword').then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property('message', ERROR.notMatchedPassword);
        });
    });

    it("Can't login with unregistered email", () => {
        login.loginUser(Cypress.env('newEmail'), Cypress.env('password')).then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property('message', ERROR.userNotFound);
        });
    });

    it("Can't login with password less than 8 characters", () => {
        login.loginUser(Cypress.env('registeredEmail'), '1234567').then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property('message', ERROR.invalidPassword);
        });
    });

    it("Can login with registered email and password", () => {
        login.loginUser(Cypress.env('registeredEmail'), Cypress.env('password')).then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
        });
    });

});