const fs = require('fs');
const yaml = require('yaml');
const path = require('path');

const parseOAS = () => {
  const fileContents = fs.readFileSync('oas.yml', 'utf8');
  const data = yaml.parse(fileContents);

  // Function to resolve references
  const resolveRef = (ref) => {
    const parts = ref.split('/');
    let result = data;
    parts.forEach((part) => {
      if (part !== '#') {
        result = result[part];
      }
    });
    return result;
  };

  const endpoints = [];

  for (const path of Object.keys(data.paths)) {
    for (const verb of Object.keys(data.paths[path])) {
      if (['summary', 'description'].includes(verb)) {
        continue;
      }
      const operation = data.paths[path][verb];
      const body = operation.requestBody ? JSON.stringify(operation.requestBody) : null;

      let processedPath = path;

      const requiredParams = [];
      if (operation.parameters) {
        operation.parameters.forEach((param) => {
          if (param.$ref) {
            param = resolveRef(param.$ref);
          }
          if (param.required) {
            requiredParams.push(param.name);
          }

          if (param.in == 'path' && param.example) {
            processedPath = path.replace(`{${param.name}}`, param.example);
          }
        });
      }

      // Extracting scopes using ES6 features
      const scopes = [];
      if (operation.security && operation.security.length > 0) {
        operation.security.forEach((sec) => {
          Object.keys(sec).forEach((key) => {
            if (data.components?.securitySchemes?.[key]) {
              const {type} = data.components.securitySchemes[key];
              if (type === 'oauth2' || type === 'openIdConnect') {
                Object.keys(sec[key]).forEach((scope) => {
                  if (sec[key][scope]) {
                    scopes.push(scope);
                  }
                });
              }
            }
          });
        });
      }

      endpoints.push({path: processedPath, verb, body, requiredParams, scopes, security: operation.security});
    }
  }

  return endpoints;
};

/**
 * Processes an API endpoint URL by replacing parameterized placeholders with specific values based on
 * matching regex patterns from a configuration object. This function identifies all placeholders within the
 * endpoint URL and attempts to replace them using a set of regex patterns and corresponding replacement values
 * provided for each parameter in the configuration.
 *
 * Each parameter's replacement is determined by regex patterns that are tested against the entire endpoint.
 * If a regex pattern matches, the corresponding replacement value is used. This allows for dynamic and flexible
 * endpoint processing that adapts to various API structures and requirements.
 *
 * @param {string} endpointUrl The API endpoint template, which may include placeholders
 * like "/ResourceType/{rid}/details/{otherId}"
 * @param {Object} context The context object containing the configuration and other data needed for processing
 * @return {string} The processed endpoint with all matched placeholders replaced by their respective values
 *                  from the configuration. If no valid replacement is found for a placeholder, it remains unchanged
 *                  in the returned string.
 */

function processEndpoint(endpointUrl, context) {
  // Regular expression to find placeholder patterns like "{param}"
  const placeholderPattern = /\{(\w+)\}/g;
  let match;
  let newEndpointUrl;

  // Iterate over each placeholder found in the endpoint
  while ((match = placeholderPattern.exec(endpointUrl)) !== null) {
    const paramName = match[1]; // Extract the parameter name from the placeholder

    // Get the mapping of regexes to replacement values for the current parameter
    const paramConfig = context.config.get('paramConfigs')[paramName];

    if (!paramConfig) {
      console.warn(`No configuration found for parameter '${paramName}'. Skipping replacement.`);
      continue;
    }

    // Attempt to replace the placeholder using the configured regexes
    for (const [regex, replacement] of Object.entries(paramConfig)) {
      const regexObj = new RegExp(regex);
      if (regexObj.test(endpointUrl)) {
        newEndpointUrl = endpointUrl.replace(`{${paramName}}`, replacement);
        break;
      }
    }

    if (!newEndpointUrl) {
      console.warn(`No valid replacement found for '${paramName}'. Check your config.`);
    }
  }

  console.log(`Original endpoint URL: ${endpointUrl}`);
  if (newEndpointUrl) console.log(`Processed endpoint URL: ${newEndpointUrl}`);

  return newEndpointUrl || endpointUrl; // Return the processed URL or the original if no replacements were made
}

function loadJsonFile(filename) {
  const filePath = path.join(__dirname, `../../payloads/${filename}`);

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`);
    }
    throw new Error(`Error reading file ${filePath}: ${error.message}`);
  }
}

/**
 * Retrieves the request body configuration for an API endpoint based on regex pattern matching against the
 * endpoint's URL. The function iterates over a configuration object containing regex patterns as keys, each
 * associated with a specific request body.
 *
 * It tests each regex pattern against the provided endpoint URL, and returns the first matching request
 * body configuration.
 *
 * @param {string} endpointUrl The URL of the API endpoint for which to retrieve the body configuration.
 * @param {Object} context The context object containing the configuration and other data needed for processing.
 * @return {Object|null} The request body
 */
const getBodyFromConfig = (endpointUrl, context) => {
  // Iterate over each regex key in the config object to find a match
  for (const regex of Object.keys(context.config.get('resources'))) {
    // Create a RegExp object from the regex string to perform the match
    const pattern = new RegExp(regex);

    // Test the current regex pattern against the endpoint URL
    if (pattern.test(endpointUrl)) {
      // Return the corresponding request body configuration upon first match
      const jsonFile = context.config.get('resources')[regex];

      const json = loadJsonFile(jsonFile);

      return json;
    }
  }
};

async function makeRequestsToAllEndpoints(filter, context) {
  const endpoints = context.oasData.filter(filter);
  const responses = [];
  const createdResources = {};

  for (const endpoint of endpoints) {
    const props = {
      method: endpoint.verb,
    };

    if (['post', 'put'].includes(endpoint.verb)) {
      props.body = getBodyFromConfig(endpoint.path, context); // Ensure the path is correctly passed
    }

    if (endpoint.verb === 'get') {
      /* This should return an object with the query parameters:
      {subject.identifier: 'ZZZ1234', category: {code: "12345", system: "snomed"}}
      */
      props.query = getPropsFromConfig(endpoint.path, context);
    }

    if (endpoint.verb === 'post') {
      if (props.body) delete props.body.id;
    }

    props.body = JSON.stringify(props.body);

    const response = await context.request(endpoint.path, props);

    responses.push(response);

    // Save IDs from POST requests for later use
    if (endpoint.verb === 'post' && response.data && response.data.resourceType && response.data.id) {
      createdResources[response.data.resourceType] = response.data.id;
    }
  }

  context.setResponses(responses);
  return createdResources;
}

function getPropsFromConfig(endpointUrl, context) {
  const queryParams = context.config.get('queryParams');
  const result = {};

  for (const paramName of Object.keys(queryParams)) {
    const paramConfig = queryParams[paramName];

    for (const regex of Object.keys(paramConfig)) {
      const pattern = new RegExp(regex);

      if (pattern.test(endpointUrl)) {
        result[paramName] = paramConfig[regex];
        break;
      }
    }
  }

  return result;
}


module.exports = {
  parseOAS,
  processEndpoint,
  makeRequestsToAllEndpoints,
};
