const assert = require('node:assert/strict');
const {When, Then} = require('@cucumber/cucumber');
const {makeRequestsToAllEndpoints} = require('./oas');

When(
    'a request is made to every {string} endpoint in the OAS',
    async function(method) {
      return makeRequestsToAllEndpoints((ep) => ep.verb === method.toLowerCase(), this);
    },
);

When(
    'a request is made to every {string} endpoint in the OAS requiring authorisation',
    async function(method) {
      return makeRequestsToAllEndpoints((ep) => ep.verb === method.toLowerCase() && ep.security, this);
    },
);

async function assertEach(responses, assertFunction) {
  const errorMessages = [];

  for (const response of responses) {
    try {
      assertFunction(response);
    } catch (error) {
      errorMessages.push(error.message);
    }
  }

  if (errorMessages.length > 0) {
    throw new Error(`Test results: \n${errorMessages.join('\n')}`);
  }
}

// Custom assertion to check the status code
function assertStatusCode(response, expectedStatusCode) {
  assert.equal(
      response.status,
      expectedStatusCode,
      `${response.config.fetchUrl}: Expected status code ${expectedStatusCode}, but got ${response.status} instead`,
  );
}

// Custom assertion to check if a property contains a specific value
function assertPropertyContains(response, propertyName, expectedValue) {
  assert.strictEqual(
      response.data[propertyName],
      expectedValue,
      `Expected property "${propertyName}" to contain "${expectedValue}", but got "${response.data[propertyName]}"`,
  );
}

// Custom assertion to check if a property exists
function assertPropertyExists(response, propertyName) {
  assert.ok(
      propertyName in response.data,
      `Expected property "${propertyName}" to exist, but it was not found.`,
  );
}

// Usage in Cucumber steps
Then('every response should have status {int}', async function(statusCode) {
  const responses = this.getResponses();
  await assertEach(responses, (response) =>
    assertStatusCode(response, statusCode),
  );
});

Then(
    'every response body should have property {string} containing {string}',
    async function(propertyName, expectedValue) {
      const responses = this.getResponses();
      await assertEach(responses, (response) =>
        assertPropertyContains(response, propertyName, expectedValue),
      );
    },
);

Then(
    'every response body should have property {string}',
    async function(propertyName, expectedValue) {
      const responses = this.getResponses();
      await assertEach(responses, (response) =>
        assertPropertyExists(response, propertyName),
      );
    },
);

Then('every response should have header {string}', async function(headerName) {
  const responses = this.getResponses();
  await assertEach(responses, (response) => {
    const headerKey = Object.keys(response.headers).find((key) => key.toLowerCase() === headerName.toLowerCase());
    assert.ok(
        headerKey !== undefined,
        `${response.config.fetchUrl}: Expected header "${headerName}" to exist, but it was not found.`,
    );
  });
});
