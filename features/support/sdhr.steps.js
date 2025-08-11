const assert = require('node:assert/strict');
const { Given, Then } = require('@cucumber/cucumber');
const { randomUUID } = require('crypto');
const path = require('path');
const fs = require('fs');


const TEST_NHI = 'ZMW0002';
const TEST_CONDITION_ID = '63e3c5c7-c938-4cf8-8815-900fc5781d8e';

const setupStandardConditionResource = (nhi, metaSecurity, facilityId, localResourceId) => {
  const filePath = path.join(__dirname, `../../payloads/Condition.json`);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const payload = JSON.parse(fileContent);
  payload.subject.reference = `https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/${nhi}`;
  //payload.id = TEST_NHI;
  if (metaSecurity) {
    payload.meta.security = [metaSecurity];
  }
  if (facilityId) {
    payload.meta.source = `https://api.hip.digital.health.nz/fhir/nhi/v1/Location/${facilityId}`;
  }
  if (localResourceId) {
    payload.identifier[0].value = localResourceId;
  }
  return payload;
};

const setupConsentResource = (guid, nhi, action) => {
  const filePath = path.join(__dirname, `../../payloads/Consent.json`);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const payload = JSON.parse(fileContent);
  payload.patient.reference = `https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/${nhi}`;
  payload.id = guid;
  payload.provision = {
    'period': {
      'start': (new Date()).toISOString().split('T')[0],
      'end': (new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 10)).toISOString().split('T')[0],
    },
    'type': action,
    'action': [
      {
        'coding': [
          {
            'code': 'access',
          },
        ],
      },
    ],
  };
  return payload;
};

const setupParticipateParametersResource = (nhi, facilityId, participationIndicator, reasonCode, reasonCodeDisplay, resourceType, localResourceId) => {
  const payload = {
    'resourceType': 'Parameters',
    'parameter': [
      {
        'name': 'patient',
        'valueReference': {
          'reference': `https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/${nhi}`,
          'type': 'Patient',
        },
      },
      {
        'name': 'facilityId',
        'valueReference': {
          'reference': `https://api.hip.digital.health.nz/fhir/nhi/v1/Location/${facilityId}`,
        },
      },
      {
        'name': 'reasonCode',
        'valueCodeableConcept': {
          'coding': [
            {
              'system': 'https://fhir-ig.digital.health.nz/sdhr/CodeSystem/sdhr-participation-reason',
              'code': reasonCode,
              'display': reasonCodeDisplay,
            },
          ],
        },
      },
    ],
  };
  if (participationIndicator != 'null') {
    payload.parameter.push({
      'name': 'participationIndicator',
      'valueCode': participationIndicator,
    });
  }
  if (resourceType != 'null') {
    payload.parameter.push({
      'name': 'resourceType',
      'valueString': resourceType,
    });
  }
  if (localResourceId != 'null') {
    payload.parameter.push({
      'name': 'localResourceId',
      'valueString': localResourceId,
    });
  }
  return payload;
}

Given('a standard Condition resource for NHI {string} exists',
  { timeout: 10000 },
  async function (nhi) {
    // Add a bearer token if creds are present, unless instructed not to
    this.addRequestHeader('authorization', `Bearer ${this.getToken() || await this.getOAuthToken()}`);
    const payload = setupStandardConditionResource(nhi, null);
    const response = await this.request(`/Condition`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    // Wait for the resource to be indexed and available
    await new Promise((resolve) => setTimeout(resolve, 3000));
    this.setResponse(response);
    if (response.status !== 201 || response.status == 200 && response.data.isssue) {
      throw new Error(`Failed to create Condition resource: ${response.status} - ${JSON.stringify(response.data)}`);
    } else {
      console.log('Condition resource created Condition/' + response.data.id);
    }
  });

Given('a Condition resource for NHI {string} with no meta.security tags exists',
  { timeout: 10000 },
  async function (nhi) {
    // Add a bearer token if creds are present, unless instructed not to
    this.addRequestHeader('authorization', `Bearer ${this.getToken() || await this.getOAuthToken()}`);
    const payload = setupStandardConditionResource(nhi, null);
    const response = await this.request(`/Condition/${TEST_CONDITION_ID}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    // Wait for the resource to be indexed and available
    await new Promise((resolve) => setTimeout(resolve, 3000));
    this.setResponse(response);
    if (response.status !== 201 || response.status == 200 && response.data.isssue) {
      throw new Error(`Failed to create Condition resource: ${response.status} - ${JSON.stringify(response.data)}`);
    } else {
      console.log('Condition resource created /Condition/' + response.data.id);
    }
  });
Given(
  /^a Condition resource for NHI "(?<nhi>\w+)" with meta\.security tag (?<security>{.+}) exists$/,
  { timeout: 10000 },
  async function (nhi, security) {
    const parsedTag = JSON.parse(security);

    const payload = setupStandardConditionResource(nhi, parsedTag);
    const response = await this.request(`/Condition/${TEST_CONDITION_ID}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    this.setResponse(response);

    // Wait for the resource to be indexed and available
    await new Promise((resolve) => setTimeout(resolve, 3000));
  },
);


Given('a valid Condition payload for NHI {string} at facility {string} with local ID {string}', function (nhi, facilityId, localResourceId) {
  this.payload = setupStandardConditionResource(nhi, null, facilityId, localResourceId);
});

Then('the response bundle should contain {int} entries', async function (entries) {
  const response = this.getResponse();
  assert.strictEqual(response.data.entry.length, entries);
});

Then('the response bundle should contain more than 0 entries', async function () {
  const response = this.getResponse();
  assert.ok(
    Array.isArray(response.data.entry) && response.data.entry.length > 0,
    `Expected more than 0 entries, but got ${response.data.entry?.length ?? 'undefined'}`,
  );
});

Then('the response bundle should contain 1 entry', async function () {
  const response = this.getResponse();
  assert.strictEqual(response.data.entry.length, 1);
});

Then(/^the response bundle should include a meta\.security tag (.+)$/, async function (security) {
  const response = this.getResponse();
  const tags = response.data?.meta?.security ?? [];
  const parsedTag = JSON.parse(security);
  const { code, system } = parsedTag;
  const match = tags.find((tag) => tag.code === code && tag.system === system);
  assert(match, `Expected a meta.security tag with code "${code}" and system "${system}", but none was found`);
});


Then('the OperationOutcome should contain the message {string}', async function (message) {
  const response = this.getResponse();
  const operationOutcome = response.data;
  assert.strictEqual(operationOutcome.resourceType, 'OperationOutcome');
  assert.strictEqual(operationOutcome.issue[0].diagnostics, message);
});

Given('a health sector user {string} elects to participate in sdhr', async function (nhi) {
  // Essentially a no-op step to allow the step to pass - in this case there is no action to take.
  return true;
});

Given('a health sector user {string} elects not to participate in sdhr',
  async function (nhi) {
    setupConsentForNHI(nhi, 'deny').call(this);
  });

Given('a health sector user {string} elects not to participate in sdhr by contacting their practice', async function (nhi) {
  // Essentially a no-op step to allow the step to pass - in this case there is no action to take.
  return true;
});

Given('a patient {string} notifies {string} of participation {string}',
  async function (nhi, facilityId, participationIndicator) {
    // Placeholder
    return true;
  });

Given('a patient {string} has not notified {string} of participation preferences',
  async function (nhi, facilityId) {
    // Placeholder for a patient who has not notified any facility of participation preferences
    return true;
  });

Given('a health practitioner sets {string} record {string} record to {string}',
  async function (resourceType, localResourceId, participationIndicator) {
    // Placeholder for setting a record to a specific participation indicator
    return true;
  });

Then('the response body should not have property {string} containing {string}',
  async function (propertyName, expectedValue) {
    const response = this.getResponse();
    assert(!response.data.hasOwnProperty(propertyName) || response.data[propertyName] !== expectedValue,
      `Expected response body not to have property "${propertyName}" containing "${expectedValue}", but it was found.`,
    );
  });


Then('the API consumer invokes the {string} opertaion with:', async function (operation, dataTable) {
  const operationName = operation.toLowerCase();
  const data = dataTable.hashes()[0];
  const nhi = data.patient;
  const facilityId = data.facilityId;
  const participationIndicator = data.participationIndicator;
  const reasonCode = data.reasonCode;
  const reasonCodeDisplay = data.reasonCodeDisplay;
  const resourceType = data.resourceType;
  const localResourceId = data.localResourceId;

  await invokeParticipateOperation(operationName, nhi, facilityId, participationIndicator, reasonCode, reasonCodeDisplay, resourceType, localResourceId).call(this);
  console.log(`Response from invoking ${operationName} operation:`, JSON.stringify(this.getResponse().data, null, 2));
  assert.ok(
    this.getResponse().status === 200,
    `Expected response status 200, but got ${this.getResponse().status}`
  );
  const response = this.getResponse();
  assert.strictEqual(response.data.resourceType, 'OperationOutcome', 'Expected response resourceType to be "OperationOutcome"');
  assert.strictEqual(response.data.code, 'sdhr-operation-success', 'Expected response code to be "sdhr-operation-success"');
});

const setupConsentForNHI = (nhi, action) => async function () {
  // {
  //   // Add a bearer token if creds are present, unless instructed not to
  //   this.addRequestHeader('authorization', `Bearer ${this.getToken() || await this.getOAuthToken()}`);

  //   // Get existing consent

  //   const consentResponse = await this.request(`/Consent?patient=https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/${nhi}`, {
  //     method: 'GET',
  //   });

  //   if (consentResponse.data?.total > 0) {
  //     // Consent already exists, update it
  //     const consent = consentResponse.data.entry[0].resource;
  //     const guid = consent.id;

  //     const payload = setupConsentResource(guid, nhi, action);

  //     const response = await this.request(`/Consent/${guid}`, {
  //       method: 'PUT',
  //       body: JSON.stringify(payload),
  //     });

  //     // Wait for the resource to be indexed and available
  //     await new Promise((resolve) => setTimeout(resolve, 30000));
  //     this.setResponse(response);
  //   } else {
  //     const guid = randomUUID();

  //     // If no consent exists, create a new one
  //     // console.log('No existing consent found, creating a new one');
  //     const payload = setupConsentResource(guid, nhi, action);
  //     // console.log('Payload for new consent:', JSON.stringify(payload, null, 2));
  //     const response = await this.request('/Consent', {
  //       method: 'POST',
  //       body: JSON.stringify(payload),
  //       debug: true,
  //     });

  //     if (response.status !== 201 || (response.status == 200 && response.data.isssue)) {
  //       throw new Error(`Failed to create Consent resource: ${response.status} - ${JSON.stringify(response.data)}`);
  //     } else {
  //       console.log('Consent resource created Consent/' + response.data.id);
  //     }

  //     console.log('Response from creating new consent:', JSON.stringify(response.data, null, 2));
  //     // Wait for the resource to be indexed and available
  //     await new Promise((resolve) => setTimeout(resolve, 30000));
  //     this.setResponse(response);
  //   }
  // }

  //TODO: Replace this with $participate operation
  return true;
};

const invokeParticipateOperation = (operationName, nhi, facilityId, participationIndicator, reasonCode, reasonCodeDisplay, resourceType, localResourceId) => async function () {
  this.addRequestHeader('authorization', `Bearer ${this.getToken() || await this.getOAuthToken()}`);

  const payload = setupParticipateParametersResource(nhi, facilityId, participationIndicator, reasonCode, reasonCodeDisplay, resourceType, localResourceId);

  console.log(`Invoking ${operationName} operation`); // with payload:`, JSON.stringify(payload, null, 2));

  const response = await this.request(`/${operationName}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  // Wait for the resource to be indexed and available
  await new Promise((resolve) => setTimeout(resolve, 3000));
  this.setResponse(response);
};

