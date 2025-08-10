const assert = require('node:assert/strict');
const {Given, When, Then} = require('@cucumber/cucumber');
const jwt = require('jsonwebtoken');
const config = require('./config');

Then('the response status code should be {int}', async function(status) {
  //console.log('Response:', JSON.stringify(this.getResponse().data));
  assert.strictEqual(this.getResponse().status, status);
});

Then(
    'the FHIR response body should contain {string} {string}',
    async function(jsonKey, jsonValue) {
      assert.strictEqual(this.getResponse().data[jsonKey], jsonValue);
    },
);

When('a GET request is made to {string}', {timeout: 100000}, async function(url) {
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

When('a POST request is made to {string} with the payload', async function(url) {
  const response = await this.request(url, {
    method: 'POST',
    body: JSON.stringify(this.payload),
  });

  this.setResponse(response);
});

When('a {string} request to {string} is made', async function(method, url) {
  const response = await this.request(url, {
    method,
  });

  this.setResponse(response);
});

When('a {string} request is made to the FHIR API', async function(method) {
  const response = await this.request(this.config.get('fhir.knownResourcePath'), {
    method,
  });

  this.setResponse(response);
});

Then('the response status should be {int}', async function(statusCode) {
  const response = await this.getResponse();
  //console.log(response);
  assert.equal(response.status, statusCode, `Expected status code ${statusCode}, but got ${response.status}`);
});

Given('the request header {string} is empty', function(headerName) {
  this.removeRequestHeader(headerName);
});

Given('the request header {string} set to {string}', function(headerName, headerValue) {
  this.addRequestHeader(headerName, headerValue);
});

Given('the request header {string} not set', function(headerName) {
  this.removeRequestHeader(headerName);
});

Given('the API Consumer requests a client_credentials access token', async function() {
  const scope = config.get('oauth.defaultScope');
  this.addRequestHeader('authorization', `Bearer ${this.getToken(scope) || await this.getOAuthToken(scope)}`);
});

Given('the API Consumer requests a client_credentials access token with scope {string}', async function(scope) {
  this.addRequestHeader('authorization', `Bearer ${this.getToken(scope) || await this.getOAuthToken(scope)}`);
});

Then('the response header {string} should equal {string}', async function(headerName, expectedValue) {
  const response = this.getResponse();
  const headerValue = response.headers[headerName.toLowerCase()];
  assert.strictEqual(headerValue, expectedValue, `Expected header "${headerName}" to be "${expectedValue}", but got
   "${headerValue}"`);
});

Then('the response body should have property {string} containing {string}',
    async function(propertyName, expectedValue) {
      const response = this.getResponse();
      assert.strictEqual(
          response.data[propertyName],
          expectedValue,
          `Expected property "${propertyName}" to contain "${expectedValue}", but got "${response.data[propertyName]}"`,
      );
    });

Then('the response body should have property {string}', async function(propertyName) {
  const response = this.getResponse();
  assert(
      response.data.hasOwnProperty(propertyName),
      `Expected response body to have property "${propertyName}", but it was not found.`,
  );
});
