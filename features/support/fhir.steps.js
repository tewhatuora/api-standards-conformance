const assert = require('node:assert/strict');
const {Given, When, Then} = require('@cucumber/cucumber');
const jwt = require('jsonwebtoken');

Then('the response status code should be {int}', async function(status) {
  assert.strictEqual(this.getResponse().status, status);
});

Then(
    'the FHIR response body should contain {string} {string}',
    async function(jsonKey, jsonValue) {
      assert.strictEqual(this.getResponse().data[jsonKey], jsonValue);
    },
);

When('a GET request is made to {string}', async function(url) {
  const response = await this.request(url, {
    method: 'GET',
  });

  this.setResponse(response);
});

When('a GET request is made to the FHIR API', async function() {
  const response = await this.request(this.config.get('fhir.knownResourcePath'), {
    method: 'GET',
  });

  this.setResponse(response);
});

Then('the request header {string} contains a bearer token', function(string) {
  return assert.equal(
      this.getRequestHeaders().authorization?.match('Bearer') !== false,
      true,
  );
});

Then(
    'the token expiry time should be less than {int} seconds',
    async function(int) {
      const accessToken = this.getToken();
      const decoded = jwt.decode(accessToken);
      const currentTime = Date.now() / 1000;
      const expiryTime = decoded.exp;
      const timeToExpiry = expiryTime - currentTime;
      assert(timeToExpiry < int);
    },
);

Then('the response headers contain {string} key', async function(header) {
  const response = this.getResponse();
  const headerKey = Object.keys(response.headers).find((key) => key.toLowerCase() === header.toLowerCase());
  assert(
      headerKey !== undefined,
      `Expected header "${header}" to be present in the response headers, but it was not found.`,
  );
});

Given('a valid Patient payload', function() {
  this.payload = {
    resourceType: 'Patient',
    identifier: [
      {
        use: 'official',
        system: 'https://standards.digital.health.nz/ns/nhi-id',
        value: 'ZXP7823',
      },
    ],
    active: true,
    name: [
      {
        use: 'official',
        family: 'Carrington',
        given: ['Carey'],
      },
    ],
    gender: 'female',
    birthDate: '1980-09-24',
    address: [
      {
        use: 'home',
        type: 'both',
        text: '534 Erewhon St, Ngaio, Wellington',
        line: [
          '534 Erewhon St',
          'Ngaio',
        ],
        city: 'Wellington',
        postalCode: '3999',
      },
    ],
  };
});

When('a POST request is made to {string} with the payload', async function(url) {
  const response = await this.request(url, {
    method: 'POST',
    body: JSON.stringify(this.payload),
  });

  this.setResponse(response);
});

Then('the response status should be {int}', async function(statusCode) {
  const response = await this.getResponse();
  assert.equal(response.status, statusCode, `Expected status code ${statusCode}, but got ${response.status}`);
});
