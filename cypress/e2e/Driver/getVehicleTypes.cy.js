/// <reference types="Cypress" />

import login from "../../api/login.api";
import getVehicleTypes from "../../api/getVehicleTypes.api";
import ERROR from "../../message/errorMessage";
import SUCCESSFUL from "../../message/successfulMessage";

describe('Get Vehicle Types', () => {

    describe('Without Login', () => {
            
        it('Should throw error message on trying to get vehicle types', () => {
    
            getVehicleTypes.getVehicleTypes().then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', ERROR.unauthorized);
            });
    
        });
    
    });

    describe('Get Vehicle Types After Successful Login', () => {

        beforeEach(() => {

            login.loginUser(Cypress.env('registeredEmail'), Cypress.env('password'), 'email').then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('message', SUCCESSFUL.sucessfulLogin);
                expect(response.body).to.have.property('data');
                expect(response.body.data).to.have.property('token');
                const token = response.body.data.token;
                localStorage.setItem('token', token);
                return token;
            });
        
        });

        it('Should return all vehicle types', () => {
            getVehicleTypes.getVehicleTypes().then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('data');
                expect(response.body.data).to.have.property('types');
                expect(response.body.data.types).to.be.an('array');
            });
        });

    });

});