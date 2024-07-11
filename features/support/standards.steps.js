const assert = require('node:assert/strict');
const {Given, When, Then} = require('@cucumber/cucumber');
const {ApiStandardsTestAssertionInvalid} = require('./errors');

const noop = () => {};

function getHeaderFromResponse(response, name) {
  const {headers} = response;
  return flattenHeaders(headers)[String(name).toLowerCase().trim()];
}

function flattenHeaders(headers) {
  return Object.keys(headers || {}).reduce(
      (acc, key) => ({...acc, [String(key).toLowerCase().trim()]: headers[key]}),
      {},
  );
}

Given('a noop statement', noop);

When('the request header {string} is set to {string}', function(name, value) {
  this.addRequestHeader(name, value);
});

Then('the response header {string} should contain one of {string}', async function(name, possibleValues) {
  const header = getHeaderFromResponse(this.getResponse(), name);
  const lowerCaseHeader = header.toLowerCase();
  const lowerCasePossibleValues = possibleValues.split(',').map((value) => value.trim().toLowerCase());

  assert(
      lowerCasePossibleValues.some((value) => lowerCaseHeader.includes(value)),
      new ApiStandardsTestAssertionInvalid('Response header did not match', {
        actualValue: header,
        expectedValues: lowerCasePossibleValues,
      }),
  );
});
