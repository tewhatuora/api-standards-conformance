require('dotenv').config();
const {setWorldConstructor, World, BeforeAll, Before, setDefaultTimeout} = require('@cucumber/cucumber');
const {v4} = require('uuid');
const {getModuleLogger, request, getOAuthToken} = require('./helpers');
const config = require('./config');
const {parseOAS} = require('./oas');

setDefaultTimeout(60 * 1000);

class ApiStandardsWorld extends World {
  constructor(options) {
    super(options);

    this.scenarioId = v4();
    this.testStartMs = Date.now();
    this.config = config;
    this.tokens = {};

    this.logger = getModuleLogger('api-standards-conformance', this.scenarioId);

    // Record of API responses
    this.responseHistory = [];
    this.response = null;

    this.request = request.bind(this);
    this.getOAuthToken = getOAuthToken.bind(this);

    // Requests
    this.requestHeaders = {};

    // Resource IDs
    this.resourceIds = {};
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

  setToken(token, scope) {
    // Ensure the scope is defined, then set the token and current time
    if (!scope) {
      throw new Error('Scope must be provided');
    }
    this.tokens[scope] = {
      token: token,
      setTime: Date.now(), // Store the current time when token is set
    };
  }

  getToken(scope) {
    if (!scope) {
      throw new Error('Scope must be provided');
    }
    const tokenInfo = this.tokens[scope];
    if (tokenInfo) {
      // Check if the current time exceeds the token lifetime (10 minutes)
      if (Date.now() - tokenInfo.setTime > 600000) { // 600000 milliseconds equals 10 minutes
        this.tokens[scope] = null; // Expire the token
        return null;
      }
      return tokenInfo.token;
    }
    return null; // Return null if no token is found for the given scope
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
let createdIds;

BeforeAll(async () => {
  // Parse the OAS file once before all scenarios
  oasData = parseOAS(config.get('oasFile'));
});

Before(function() {
  // Ensure each scenario can access the parsed data through the world object
  this.oasData = oasData;
  this.setResourceIds(createdIds);
});
