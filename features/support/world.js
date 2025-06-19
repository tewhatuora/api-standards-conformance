require('dotenv').config();
const {setWorldConstructor, World, Before, BeforeAll} = require('@cucumber/cucumber');
const {v4} = require('uuid');
const {getModuleLogger, request, getOAuthToken} = require('./helpers');
const config = require('./config');
const {parseOAS} = require('./oas');

class ApiStandardsWorld extends World {
  constructor(options) {
    super(options);

    this.scenarioId = v4();
    this.testStartMs = Date.now();
    this.config = config;
    this.token = null;

    this.logger = getModuleLogger('api-standards-conformance', this.scenarioId);

    // Record of API responses
    this.responseHistory = [];
    this.response = null;

    this.request = request.bind(this);
    this.getOAuthToken = getOAuthToken.bind(this);

    // Requests
    this.requestHeaders = {};
  }
  setResponse(response) {
    this.response = response;
    this.responseHistory.push(response);

    return this.response;
  }

  getResponse() {
    return this.response;
  }

  setResponses(responses) {
    this.responses = responses;
  }

  getResponses() {
    return this.responses;
  }
  setToken(token) {
    this.token = token;
  }

  getToken() {
    return this.token;
  }

  addRequestHeader(name, value) {
    this.requestHeaders[name] = value;
  }

  getRequestHeaders() {
    return this.requestHeaders;
  }

  removeRequestHeader(name, value) {
    delete this.requestHeaders[name];
  }

  setResourceIds(ids) {
    this.resourceIds = ids;
  }

  getResourceIds() {
    return this.resourceIds;
  }
}

setWorldConstructor(ApiStandardsWorld);


let oasData;
// eslint-disable-next-line new-cap
BeforeAll(async () => {
  // Parse the OAS file once before all scenarios
  oasData = parseOAS();
});

// eslint-disable-next-line new-cap
Before(function() {
  // Ensure each scenario can access the parsed data through the world object
  this.oasData = oasData;
});
