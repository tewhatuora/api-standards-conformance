const {createLogger, format, transports} = require('winston');
const Fhir = require('fhir').Fhir;
const config = require('./config');

const fhir = new Fhir();

const DEFAULT_TIMEOUT = 30000;

function lowercaseKeys(obj) {
  const result = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key.toLowerCase()] = obj[key];
    }
  }

  return result;
}

// Function to request OAuth token
async function getOAuthToken() {
  const tokenEndpoint = process.env['OAUTH_URL'];
  const clientCredentials = {
    client_id: process.env['OAUTH_CLIENT_ID'],
    client_secret: process.env['OAUTH_CLIENT_SECRET'],
    grant_type: 'client_credentials',
    scope: 'scope/cinc',
  };

  // Prepare the body of the POST request
  const searchParams = new URLSearchParams(clientCredentials);

  try {
    const tokenResponse = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: searchParams,
    });
    const responseData = await tokenResponse.json(); // assuming JSON response
    if (!tokenResponse.ok) {
      throw new Error(`HTTP error! status: ${tokenResponse.status}`);
    }
    this.setToken(responseData.access_token);
    return responseData.access_token;
  } catch (error) {
    console.error('Error in sending data:', error);
  }
}

async function request(
    url,
    {method, body, headers: requestHeaders, ...options},
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    this.logger.error('Request timed out', {
      url,
      DEFAULT_TIMEOUT,
      method,
      body,
      requestHeaders,
    });
    controller.abort();
  }, DEFAULT_TIMEOUT);

  this.addRequestHeader('content-type', 'application/json');

  // Add a bearer token if creds are present, unless instructed not to
  if (process.env['OAUTH_URL'] && options.skipAuth !== true) {
    this.addRequestHeader('authorization', `Bearer ${this.getToken() || await this.getOAuthToken()}`);
  }

  // Add an API key if present, unless instructed not to
  if (process.env['API_KEY'] && options.skipApiKey !== true) {
    this.addRequestHeader('x-api-key', process.env['API_KEY']);
    // If API key is present, request-context should also be
    this.addRequestHeader('request-context', process.env['REQUEST_CONTEXT']);
  }

  const headers = lowercaseKeys({
    ...requestHeaders,
    ...config.get('customHeaders'),
    ...config.get('headers'),
    ...this.getRequestHeaders(),
  });

  const fetchOptions = {
    method,
    headers,
    body,
    signal: controller.signal,
  };

  const fetchUrl = url.match(/^http/) ? url : `${config.get('baseUrl')}${url}`;

  this.logger.debug('Making request', {
    fetchUrl,
    method,
    headers,
    body,
  });

  return fetch(fetchUrl, fetchOptions)
      .then(async (response) => {
        const {status, ok} = response;
        const responseHeaders = Object.fromEntries(response.headers.entries());

        const DEFAULT_RESULT = {
          ok,
          status,
          headers: responseHeaders,
          config: {
            url,
            method,
            body,
            headers,
          },
        };

        if (String(responseHeaders['content-type']).includes('json')) {
          return {
            ...DEFAULT_RESULT,
            data: await response.json().catch((err) => {
              this.logger.error('Could not parse json response', {
                response,
                err,
              });
              return null;
            }),
          };
        }

        if (String(responseHeaders['content-type']).includes('fhir+xml')) {
          return {
            ...DEFAULT_RESULT,
            data: await response
                .text()
                .then((text) => {
                  return JSON.parse(fhir.xmlToJson(text));
                })
                .catch((err) => {
                  this.logger.error('Could not parse xml response', {
                    response,
                    err,
                  });
                  return null;
                }),
          };
        }

        return {
          ...DEFAULT_RESULT,
          data: await response.text(),
        };
      })
      .catch((err) => {
        this.logger.error('Error making http request', {
          url,
          fetchOptions,
          err,
        });
        throw err;
      })
      .finally(() => clearTimeout(timeout));
}

const {combine, timestamp, label, printf, splat} = format;

const myFormat = printf(({level, message, label, timestamp, ...meta}) => {
  const additionalInfo = Object.keys(meta).length ?
    JSON.stringify(meta, null, 2) :
    '';
  return `\n${timestamp} [${label}] ${level}: ${message}: \n${additionalInfo}`;
});

function getModuleLogger(moduleName, scenarioId) {
  return createLogger({
    level: config.get('logLevel'),
    format: combine(
        label({label: scenarioId}),
        timestamp(),
        splat(),
        myFormat,
    ),
    defaultMeta: {service: moduleName},
    transports: [new transports.Console()],
  });
}

module.exports = {
  request,
  getOAuthToken,
  getModuleLogger,
};
