require('dotenv').config(); const {setWorldConstructor, World} = require('@cucumber/cucumber');
const {v4} = require('uuid');
const {getModuleLogger, request, getOAuthToken} = require('./helpers');
const config = require('./config');


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
}

setWorldConstructor(ApiStandardsWorld);
