import ENDPOINTS from "../../constants/endpoints";

describe('describe', () => {
  // it('should send API request with an image', () => {
  //   cy.readFile('cypress/fixtures/sample.jpg', 'binary').then((fileContent) => {
  //     const blob = Cypress.Blob.binaryStringToBlob(fileContent, "application/text");

  //     const headers = {
  //       'Content-Type': 'multipart/form-data',
  //     };
  
  //     const formData = new FormData();
  //       formData.append('email', 'legomat755@aramask.com');
  //       formData.append('name', 'John Doe');
  //       formData.append('password', 'password');
  //       formData.append('otp', '3346');
  //       formData.append('estimated_service_usage', '12');
  //       // formData.append('profile_picture', fileContent[0] );
  //        formData.append('profile_picture', blob , 'sample.jpg');
  
  //     cy.api({
  //       method: 'POST',
  //       url: Cypress.env('apiUrl') + ENDPOINTS.registerCustomer,
  //       body: formData,
  //       headers,
  //     }).then((response) => {
  //       // Add assertions for the API response as needed
  //       expect(response.status).to.equal(200);
  //       expect(response.body).to.deep.equal({ success: true });
  //     });
  //   });
  // });

  it('should send API request with an image', () => {
    cy.fixture("sample.jpg", 'binary')
        .then((file) => Cypress.Blob.binaryStringToBlob(file))
        .then((blob) => {

            var formData = new FormData();
            formData.append('email', 'legomat755@aramask.com');
          formData.append('name', 'John Doe');
          formData.append('password', 'password');
          formData.append('otp', '3346');
        formData.append('estimated_service_usage', '12');
            formData.append("profile_picture", blob, "sample.jpg");

            cy.api({
                url: Cypress.env('apiUrl') + ENDPOINTS.registerCustomer,
                method: "POST",
                headers: {
                    'content-type': 'multipart/form-data'
                },
                body: formData
            }).its('status').should('be.equal', 200)
        })
  });

});
