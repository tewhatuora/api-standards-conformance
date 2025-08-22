const assert = require('node:assert/strict');
const {Given, When, Then} = require('@cucumber/cucumber');
const {jsonPath} = require('jsonpath-plus');
const jwt = require('jsonwebtoken');
const config = require('./config');
// const {set} = require('./helpers');
const {set} = require('lodash');

Then('the response status code should be {int}', async function(status) {
  // console.log('Response:', JSON.stringify(this.getResponse().data));
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

When('a GET request is made to {string} with the response body ID', {timeout: 100000}, async function(url) {
  const responseBody = this.getResponse();
  const id = responseBody.data.id;
  const requestUrl = url + '/' + id;
  const response = await this.request(requestUrl, {
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
  // console.log('Payload:', JSON.stringify(this.payload, null, 2));
  const response = await this.request(url, {
    method: 'POST',
    body: JSON.stringify(this.payload),
  });
  this.setResponse(response);
  // Wait for indexing
  await new Promise((resolve) => setTimeout(resolve, 5000));
});

When(
    'a PUT request is made to {string} with the saved ID and the payload',
    async function(url) {
      if (!this.savedId) {
        throw new Error('No saved ID found. Please ensure the response has been saved before making a PUT request.');
      }
      url = `${url}/${this.savedId}`;
      console.log('Making PUT request with Payload:', JSON.stringify(this.payload, null, 2));
      const response = await this.request(url, {
        method: 'PUT',
        body: JSON.stringify(this.payload),
      });
      this.setResponse(response);
    },
);

Given(
    'the property {string} is set to {string}',
    async function(propertyName, value) {
      const path = propertyName.replace(/\[(\d+)\]/g, '.$1');
      set(this.payload, path, value);
      return this.payload;
    },
);

When(
    'the response body is updated with:',
    async function(dataTable) {
      const rows = dataTable.hashes(); // array of { propertyName, value }
      const updated = {...this.getResponse().data};
      for (const row of rows) {
        const path = row.propertyName.replace(/\[(\d+)\]/g, '.$1');
        set(updated, path, row.value);
      }
      return this.payload = this.getResponse().data;
    },
);


// async function (dataTable) {
//   const rows = dataTable.hashes(); // array of { propertyName, value }
//   const updated = { ...this.getResponse().data };

//   for (const row of rows) {
//     const path = row.propertyName.replace(/\[(\d+)\]/g, '.$1');
//     set(updated, path, row.value);


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
  // console.log(response);
  // console.log(response);
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

Given('the API Consumer requests a new client_credentials access token with scope {string}', async function(scope) {
  this.addRequestHeader('authorization', `Bearer ${await this.getOAuthToken(scope)}`);
});

Then('the response header {string} should equal {string}', async function(headerName, expectedValue) {
  const response = this.getResponse();
  const headerValue = response.headers[headerName.toLowerCase()];
  assert.strictEqual(headerValue, expectedValue, `Expected header "${headerName}" to be "${expectedValue}", but got
   "${headerValue}"`);
});

Then('the response body should have property {string} containing {string}',
    async function(jsonPath, expectedValue) {
      const response = this.getResponse();
      const path = jsonPath.startsWith('$') ? jsonPath : `$.${jsonPath}`;
      const actualValue = jsonPath({path, json: response.data, wrap: false});
      assert.strictEqual(
          String(actualValue),
          expectedValue,
          `Expected property at path "${jsonPath}" to be "${expectedValue}", but got "${actualValue}"`,
      );
    });

Then('the search response body should have entry with property {string} containing {string}',
    async function(jsonPath, expectedValue) {
      const response = this.getResponse();
      const path = jsonPath.startsWith('$') ? jsonPath : `$.${jsonPath}`;
      const entries = jsonPath({path: '$.entry[*]', json: response.data, wrap: false});
      const found = entries?.some((entry) => {
        const value = jsonPath({path, json: entry.resource, wrap: false});
        return String(value) === expectedValue;
      });
      assert(found, `Expected to find an entry with property "${jsonPath}" containing "${expectedValue}" - response data: ${JSON.stringify(response.data, null, 2)}`);
    });


Then('the search response body should not have any entry with property {string} containing {string}',
    async function(jsonPath, expectedValue) {
      const response = this.getResponse();
      const path = jsonPath.startsWith('$') ? jsonPath : `$.${jsonPath}`;
      const entries = jsonPath({path: '$.entry[*]', json: response.data, wrap: false});
      const found = entries?.some((entry) => {
        const value = jsonPath({path, json: entry.resource, wrap: false});
        return String(value) === expectedValue;
      });
      assert(!found, `Expected not to find any entry with property "${jsonPath}" containing "${expectedValue}"`);
    });


Then('the response body should have property {string}', async function(propertyName) {
  const response = this.getResponse();
  const path = `$.${propertyName}`;
  const result = jsonPath({path, json: response.data});
  assert(
      result.length > 0,
      `Expected response body to have property "${propertyName}", but it was not found.`,
  );
});

Then(
    'the API Consumer saves the response id',
    async function() {
      const response = this.getResponse();
      const id = response?.data?.id;
      if (id) {
        this.savedId = id;
      } else {
        throw new Error('Response does not contain an id');
      }
    },
);

Given(
    'the response body should have property id containing the saved ID',
    async function() {
      const response = this.getResponse();
      const actualValue = response?.data?.id;
      const expectedValue = this.savedId;
      assert.strictEqual(
          String(actualValue),
          expectedValue,
          `Expected property "id:" to be "${expectedValue}", but got "${actualValue}"`,
      );
    },
);
