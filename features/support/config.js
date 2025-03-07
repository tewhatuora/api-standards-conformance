/* eslint-disable max-len */
const path = require('path');
const convict = require('convict');
convict.addFormat(require('convict-format-with-validator').url);

const {ENV} = process.env;
const CONFIG_FILENAME = ENV === 'test' ? 'config.test.json' : 'config.json';
const CONFIG_PATH = path.join(__dirname, `../../${CONFIG_FILENAME}`);

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
})
    .loadFile(CONFIG_PATH)
    .validate({allowed: 'strict'});

console.log(`Loaded configuration from ${CONFIG_PATH}`);

module.exports = config;
