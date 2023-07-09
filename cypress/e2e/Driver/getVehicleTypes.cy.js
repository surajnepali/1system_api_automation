/// <reference types="Cypress" />

import ERROR from "../../message/errorMessage";
import SUCCESSFUL from "../../message/successfulMessage";
import { getVehicleTypes } from "../../api/Driver_APIs/driver.api";
import { login } from "../../api/Auth_APIs/handleAuth.api";

let userToken;

describe('Get Vehicle Types', () => {

    describe('Without Login', () => {
            
        it('Should throw error message on trying to get vehicle types', () => {
    
            getVehicleTypes().then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', ERROR.unauthorized);
            });
    
        });
    
    });

    describe('Get Vehicle Types After Successful Login', () => {

        beforeEach(() => {

            login(Cypress.env('registeredEmail'), Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                expect(response.body).to.have.property('data');
                expect(response.body.data).to.have.property('token');
                userToken = response.body.data.token;
            });
        
        });

        it('Should return all vehicle types', () => {
            getVehicleTypes(userToken).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('data');
                expect(response.body.data).to.have.property('types');
                expect(response.body.data.types).to.be.an('array');
            });
        });

    });

});