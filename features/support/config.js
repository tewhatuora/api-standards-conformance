/* eslint-disable max-len */
const path = require('path');
const convict = require('convict');
convict.addFormat(require('convict-format-with-validator').url);

const {ENV} = process.env;
const CONFIG_FILENAME = ENV === 'test' ? 'config.test.json' : 'config.json';
const CONFIG_PATH = path.join(__dirname, `../../${CONFIG_FILENAME}`);

convict.addFormat({
  name: 'anyObject',
  validate: function(val) {
    if (typeof val !== 'object' || Array.isArray(val) || val === null) {
      throw new Error('must be of type Object');
    }
  },
  coerce: function(val) {
    return val;
  },
});

const config = convict({
  baseUrl: {
    doc: 'The base URL of the server under test',
    format: 'url',
    default: null,
    env: 'BASE_URL',
  },
  logLevel: {
    doc: 'The log level to use',
    format: ['error', 'warn', 'info', 'verbose', 'debug', 'silly'],
    default: 'info',
  },
  headers: {
    accept: {
      doc: 'The accept header to send with requests',
      format: String,
      default: 'application/json',
    },
  },
  customHeaders: {
    doc: 'Custom headers and their values. Here, you should add in any custom headers required for a request to succeed',
    format: Object,
    default: {},
  },
  fhir: {
    knownResourcePath: {
      doc: 'The path to a FHIR Resource available on the server, e.g. /Patient/1234 which should return a 200',
      format: String,
      default: '/metadata',
    },
  },
  resources: {
    doc: 'The resources to test',
    format: Object,
    default: {},
  },
  paramConfigs: {
    doc: 'A mapping of parameters to values',
    format: Object,
    default: {},
  },
  oauth: {
    doc: 'OAuth configuration',
    format: 'anyObject',
    default: {},
    tokenEndpoint: {
      doc: 'OAuth token endpoint URL',
      format: 'url',
      default: null,
      env: 'OAUTH_URL',
    },
    defaultScope: {
      doc: 'Default OAuth scope',
      format: String,
      default: '',
    },
    clientId: {
      doc: 'OAuth client ID',
      format: String,
      default: '',
      env: 'OAUTH_CLIENT_ID',
    },
    clientSecret: {
      doc: 'OAuth client secret',
      format: String,
      default: '',
      env: 'OAUTH_CLIENT_SECRET',
      sensitive: true,
    },
  },
  oasFile: {
    doc: 'Path to the OpenAPI/Swagger file',
    format: String,
    default: 'resources/sdhr.yml',
  },
  queryParams: {
    doc: 'Query parameters for requests',
    format: Object,
    default: {},
  },
})
    .loadFile(CONFIG_PATH)
    .validate({allowed: 'warn'});

console.log(`Loaded configuration from ${CONFIG_PATH}`);

console.log(process.env['OAUTH_URL']);

module.exports = config;
