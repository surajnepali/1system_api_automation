/// <reference types="cypress" />

import { login } from "../../api/Auth_APIs/handleAuth.api";
import ERROR from "../../message/errorMessage";
import SUCCESSFUL from "../../message/successfulMessage";

describe('Login', () => {

    it("Can't login with empty email", () => {
        login('', Cypress.env('password'), 'email').then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property('message', ERROR.emptyEmail);
        });
    });

    it("Can't login with empty password", () => {
        login(Cypress.env('registeredEmail'), '', 'email').then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property('message', ERROR.emptyPassword);
        });
    });

    it("Can't login with invalid email", () => {
        login('invalidemail', Cypress.env('password'), 'email').then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property('message', ERROR.invalidEmail);
        });
    });

    it("Can't login with invalid password", () => {
        login(Cypress.env('registeredEmail'), 'invalidpassword', 'email').then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property('message', ERROR.notMatchedPassword);
        });
    });

    it("Can't login with unregistered email", () => {
        login(Cypress.env('newEmail'), Cypress.env('password'), 'email').then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property('message', ERROR.userNotFound);
        });
    });

    it("Can't login with password less than 8 characters", () => {
        login(Cypress.env('registeredEmail'), '1234567', 'email').then((response) => {
            expect(response.status).to.eq(400);
            expect(response.body).to.have.property('message', ERROR.invalidPassword);
        });
    });

    it("Can login with registered email and password", () => {
        login(Cypress.env('registeredEmail'), Cypress.env('password'), 'email').then((response) => {
            expect(response.status).to.eq(200);
            expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
        });
    });

});