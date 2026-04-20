const assert = require('node:assert/strict');
const {Given, When, Then} = require('@cucumber/cucumber');
const path = require('path');
const fs = require('fs');
const {setDefaultTimeout} = require('@cucumber/cucumber');
setDefaultTimeout(30 * 1000);
const {evaluate, r4Model} = require('fhirpath');

const TEST_CONDITION_ID = '63e3c5c7-c938-4cf8-8815-900fc5781d8e';
const DEFAULT_WAIT_SECONDS = 90;
const LINKING_FIXTURE_PATIENTS = ['ZZZ0016', 'ZZZ0024', 'ZZZ0032'];
const LINKING_FIXTURE_PAIRS = [
  ['ZZZ0016', 'ZZZ0024'],
  ['ZZZ0016', 'ZZZ0032'],
  ['ZZZ0024', 'ZZZ0032'],
];
const INVALID_NHI_PREFIX = 'ZMW';

const buildParticipateArgs = ({
  operationName,
  nhi,
  facilityId = 'null',
  participationIndicator = 'null',
  reasonCode = 'null',
  reasonCodeDisplay = 'null',
  resourceType = 'null',
  localResourceId = 'null',
}) => ({
  operationName,
  nhi,
  facilityId,
  participationIndicator,
  reasonCode,
  reasonCodeDisplay,
  resourceType,
  localResourceId,
});

const setupStandardConditionResource = (
    nhi,
    metaSecurity,
    facilityId,
    localResourceId,
) => {
  const filePath = path.join(__dirname, `../../payloads/Condition.json`);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const payload = JSON.parse(fileContent);
  payload.subject.reference = `https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/${nhi}`;
  // payload.id = TEST_NHI;
  if (metaSecurity) {
    payload.meta.security = [metaSecurity];
  }
  if (facilityId) {
    payload.meta.source = `https://api.hip.digital.health.nz/fhir/hpi/v1/Location/${facilityId}`;
  }
  if (localResourceId) {
    payload.identifier[0].value = localResourceId;
  }
  return payload;
};

const setupStandardAllergyIntoleranceResource = (
    nhi,
    metaSecurity,
    facilityId,
    localResourceId,
) => {
  const filePath = path.join(__dirname, `../../payloads/AllergyIntolerance.json`);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const payload = JSON.parse(fileContent);
  payload.patient.reference = `https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/${nhi}`;
  if (metaSecurity) {
    payload.meta.security = [metaSecurity];
  }
  if (facilityId) {
    payload.meta.source = `https://api.hip.digital.health.nz/fhir/hpi/v1/Location/${facilityId}`;
  }
  if (localResourceId) {
    payload.identifier[0].value = localResourceId;
  }
  return payload;
};

const setupStandardEncounterResource = (
    nhi,
    metaSecurity,
    facilityId,
    localResourceId,
) => {
  const filePath = path.join(__dirname, `../../payloads/Encounter.json`);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const payload = JSON.parse(fileContent);
  payload.subject.reference = `https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/${nhi}`;
  if (metaSecurity) {
    payload.meta.security = [metaSecurity];
  }
  if (facilityId) {
    payload.meta.source = `https://api.hip.digital.health.nz/fhir/hpi/v1/Location/${facilityId}`;
  }
  if (localResourceId) {
    payload.identifier[0].value = localResourceId;
  }
  return payload;
};

const setupStandardObservationResource = (
    nhi,
    metaSecurity,
    facilityId,
    localResourceId,
) => {
  const filePath = path.join(__dirname, `../../payloads/Observation.json`);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const payload = JSON.parse(fileContent);
  payload.subject.reference = `https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/${nhi}`;
  if (metaSecurity) {
    payload.meta.security = [metaSecurity];
  }
  if (facilityId) {
    payload.meta.source = `https://api.hip.digital.health.nz/fhir/hpi/v1/Location/${facilityId}`;
  }
  if (localResourceId) {
    payload.identifier[0].value = localResourceId;
  }
  return payload;
};

const setupParticipateParametersResource = (
    operationName,
    nhi,
    facilityId,
    participationIndicator,
    reasonCode,
    reasonCodeDisplay,
    resourceType,
    localResourceId,
) => {
  const payload = {
    resourceType: 'Parameters',
    parameter: [
      {
        name: 'patient',
        valueReference: {
          reference: `https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/${nhi}`,
          type: 'Patient',
        },
      },
    ],
  };

  if (operationName !== '$hnz-participate' && facilityId != 'null') {
    payload.parameter.push(
        {
          name: 'facilityId',
          valueReference: {
            reference: `https://api.hip.digital.health.nz/fhir/hpi/v1/Location/${facilityId}`,
          },
        });

    payload.parameter.push({
      name: 'enrolledPatient',
      valueBoolean: true,
    });
  }

  if (reasonCode != 'null') {
    payload.parameter.push({
      name: 'reasonCode',
      valueCodeableConcept: {
        coding: [
          {
            system:
              'https://fhir-ig-uat.digital.health.nz/sdhr/CodeSystem/sdhr-participation-reason',
            code: reasonCode,
            display: reasonCodeDisplay,
          },
        ],
      },
    });
  }

  if (participationIndicator != 'null') {
    payload.parameter.push({
      name:
        operationName === '$hnz-participate' ?
          'hnzParticipationIndicator' :
          'participationIndicator',
      valueBoolean: participationIndicator === 'true',
    });
  }
  if (resourceType != 'null') {
    payload.parameter.push({
      name: 'resourceType',
      valueString: resourceType,
    });
  }
  if (localResourceId != 'null') {
    payload.parameter.push({
      name: 'localResourceId',
      valueString: localResourceId,
    });
  }
  return payload;
};

const setupLinkParametersResource = (
    activeNhi,
    dormantNhi,
) => ({
  resourceType: 'Parameters',
  parameter: [
    {
      name: 'activePatient',
      valueReference: {
        reference: `https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/${activeNhi}`,
        type: 'Patient',
      },
    },
    {
      name: 'dormantPatient',
      valueReference: {
        reference: `https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/${dormantNhi}`,
        type: 'Patient',
      },
    },
  ],
});

Given(
    'a standard Condition resource for NHI {string} exists',
    {timeout: 30000},
    async function(nhi) {
    // Add a bearer token if creds are present, unless instructed not to
      this.addRequestHeader(
          'authorization',
          `Bearer ${this.getToken() || (await this.getOAuthToken())}`,
      );
      const payload = setupStandardConditionResource(nhi, null);
      const response = await this.request(`/Condition`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // Wait for the resource to be indexed and available
      await new Promise((resolve) => setTimeout(resolve, 5000));
      this.setResponse(response);
      if (
        response.status !== 201 ||
      (response.status == 200 && response.data.isssue)
      ) {
        throw new Error(
            `Failed to create Condition resource: ${response.status} - ${JSON.stringify(response.data)}`,
        );
      } else {
        console.log('Condition resource created Condition/' + response.data.id);
      }
    },
);

Given(
    'a Condition resource for NHI {string} with no meta.security tags exists',
    {timeout: 30000},
    async function(nhi) {
    // Add a bearer token if creds are present, unless instructed not to
      this.addRequestHeader(
          'authorization',
          `Bearer ${this.getToken() || (await this.getOAuthToken())}`,
      );
      const payload = setupStandardConditionResource(nhi, null);
      const response = await this.request(`/Condition/${TEST_CONDITION_ID}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      // Wait for the resource to be indexed and available
      await new Promise((resolve) => setTimeout(resolve, 5000));
      this.setResponse(response);
      if (
        response.status !== 201 ||
      (response.status == 200 && response.data.isssue)
      ) {
        throw new Error(
            `Failed to create Condition resource: ${response.status} - ${JSON.stringify(response.data)}`,
        );
      } else {
        console.log('Condition resource created /Condition/' + response.data.id);
      }
    },
);

Given('the security tag {string} with display {string} is added to the payload', function(code, display) {
  this.payload.meta = this.payload.meta || {};
  this.payload.meta.security = [];
  this.payload.meta.security.push({
    code: code,
    system: 'http://terminology.hl7.org/CodeSystem/v3-Confidentiality',
    display: display,
  });
});

Given(
    'a valid {string} payload for NHI {string} at facility {string} with local ID {string}',
    function(resourceType, nhi, facilityId, localResourceId) {
      switch (resourceType.toLowerCase()) {
        case 'condition':
          this.payload = setupStandardConditionResource(
              nhi,
              null,
              facilityId,
              localResourceId,
          );
          break;
        case 'allergyintolerance':
          this.payload = setupStandardAllergyIntoleranceResource(
              nhi,
              null,
              facilityId,
              localResourceId,
          );
          break;
        case 'encounter':
          this.payload = setupStandardEncounterResource(
              nhi,
              null,
              facilityId,
              localResourceId,
          );
          break;
        case 'observation':
          this.payload = setupStandardObservationResource(
              nhi,
              null,
              facilityId,
              localResourceId,
          );
          break;
        default:
          throw new Error(`Unsupported resource type: ${resourceType}`);
      };
    },
);

Then(
    'the response bundle should contain {int} entries',
    async function(entries) {
      const response = this.getResponse();
      assert.strictEqual(response.data.entry.length, entries);
    },
);

Then(
    'the response bundle should contain more than 0 entries',
    async function() {
      const response = this.getResponse();
      assert.ok(
          Array.isArray(response.data.entry) && response.data.entry.length > 0,
          `Expected more than 0 entries, but got ${response.data.entry?.length ?? 'undefined'}`,
      );
    },
);

Then('the response bundle should contain 1 entry', async function() {
  const response = this.getResponse();
  assert.strictEqual(response.data.entry.length, 1);
});

Then(
    'the response bundle should include a meta.security tag',
    async function(security) {
      const response = this.getResponse();
      const tags = response.data?.meta?.security ?? [];
      const parsedTag = JSON.parse(security);
      const {code, system} = parsedTag;
      const match = tags.find(
          (tag) => tag.code === code && tag.system === system,
      );
      assert(
          match,
          `Expected a meta.security tag with code "${code}" and system "${system}", but none was found`,
      );
    },
);

Then(
    'the OperationOutcome should contain the message {string}',
    async function(message) {
      const response = this.getResponse();
      const operationOutcome = response.data;
      assert.strictEqual(operationOutcome.resourceType, 'OperationOutcome');
      assert.strictEqual(operationOutcome.issue[0].diagnostics, message);
    },
);

Given(
    'a unique invalid NHI is prepared for this scenario',
    function() {
      const suffix = String(Date.now()).slice(-4);
      this.generatedInvalidNhi = `${INVALID_NHI_PREFIX}${suffix}`;
    },
);

Given(
    'a historic load failure is triggered for the generated invalid NHI at facility {string}',
    {timeout: 120000},
    async function(facilityId) {
      assert.ok(this.generatedInvalidNhi, 'No generated invalid NHI found for this scenario');

      await eventuallyInvokeSetupOperation.call(
          this,
          invokeParticipateOperationWithDefaults({
            operationName: '$hnz-participate',
            nhi: this.generatedInvalidNhi,
            participationIndicator: 'true',
          }),
      );

      await eventuallyInvokeSetupOperation.call(
          this,
          invokeParticipateOperationWithDefaults({
            operationName: '$participate',
            nhi: this.generatedInvalidNhi,
            facilityId,
            participationIndicator: 'false',
          }),
      );

      await eventuallyInvokeSetupOperation.call(
          this,
          invokeParticipateOperationWithDefaults({
            operationName: '$participate',
            nhi: this.generatedInvalidNhi,
            facilityId,
            participationIndicator: 'true',
          }),
      );
    },
);

Then(
    'the generated invalid NHI should eventually return the background load error for facility {string}',
    {timeout: 120000},
    async function(facilityId) {
      assert.ok(this.generatedInvalidNhi, 'No generated invalid NHI found for this scenario');

      this.payload = setupParticipateParametersResource(
          '$participate',
          this.generatedInvalidNhi,
          facilityId,
          'true',
          'null',
          'null',
          'null',
          'null',
      );

      const startedAt = Date.now();
      let lastResponse;

      while (Date.now() - startedAt < DEFAULT_WAIT_SECONDS * 1000) {
        const response = await this.request('/$participate', {
          method: 'POST',
          body: JSON.stringify(this.payload),
        });

        this.setResponse(response);
        lastResponse = response;

        const outcomeCode = response?.data?.issue?.[0]?.details?.coding?.[0]?.code;
        if (response.status === 409 && outcomeCode === 'sdhr-patient-background-load-error') {
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      assert.fail(
          `Expected background load error within ${DEFAULT_WAIT_SECONDS} seconds, but got ${lastResponse?.status} with body ${JSON.stringify(lastResponse?.data)}`,
      );
    },
);

Given(
    'a health sector user {string} elects to participate in sdhr',
    async function(nhi) {
    // Essentially a no-op step to allow the step to pass - in this case there is no action to take.
      return true;
    },
);

Given(
    'a health sector user {string} elects not to participate in sdhr by contacting their practice',
    async function(nhi) {
    // Essentially a no-op step to allow the step to pass - in this case there is no action to take.
      return true;
    },
);

Given(
    'a patient {string} notifies {string} of participation {string}',
    async function(nhi, facilityId, participationIndicator) {
    // Placeholder
      return true;
    },
);

Given(
    'a patient {string} has not notified {string} of participation preferences',
    async function(nhi, facilityId) {
    // Placeholder for a patient who has not notified any facility of participation preferences
      return true;
    },
);

Given(
    'a health practitioner sets {string} record {string} record to {string}',
    async function(resourceType, localResourceId, participationIndicator) {
    // Placeholder for setting a record to a specific participation indicator
      return true;
    },
);

Then(
    'the response body should not have property {string} containing {string}',
    async function(propertyName, expectedValue) {
      const response = this.getResponse();
      assert(
          !response.data.hasOwnProperty(propertyName) ||
      response.data[propertyName] !== expectedValue,
          `Expected response body not to have property "${propertyName}" containing "${expectedValue}", but it was found.`,
      );
    },
);

Then(
    'the response body should contain string {string}',
    async function(expectedValue) {
      const response = this.getResponse();
      const body = JSON.stringify(response.data);
      assert.ok(
          body.includes(expectedValue),
          `Expected response body to contain "${expectedValue}", but it did not.\nBody: ${body}`,
      );
    },
);

Then(
    'the response body should not contain string {string}',
    async function(unexpectedValue) {
      const response = this.getResponse();
      const body = JSON.stringify(response.data);
      assert.ok(
          !body.includes(unexpectedValue),
          `Expected response body not to contain "${unexpectedValue}", but it did.\nBody: ${body}`,
      );
    },
);

Then(
    'repeated POST requests to {string} with the payload should eventually return status {int} and outcome code {string}',
    {timeout: 180000},
    async function(path, expectedStatus, expectedOutcomeCode) {
      await eventuallyInvokeUntilOutcome.call(
          this,
          async function() {
            const response = await this.request(path, {
              method: 'POST',
              body: JSON.stringify(this.payload),
            });
            this.setResponse(response);
          },
          {
            expectedStatus,
            expectedOutcomeCode,
          },
      );
    },
);

When(
    'a GET request is repeatedly made to {string} until the response body contains string {string}',
    {timeout: 120000},
    async function(url, expectedValue) {
      const startedAt = Date.now();
      let lastResponse;

      while (Date.now() - startedAt < DEFAULT_WAIT_SECONDS * 1000) {
        const response = await this.request(url, {
          method: 'GET',
        });
        this.setResponse(response);
        lastResponse = response;

        if (JSON.stringify(response.data).includes(expectedValue)) {
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      assert.fail(
          `Expected response body to contain "${expectedValue}" within ${DEFAULT_WAIT_SECONDS} seconds, but got ${JSON.stringify(lastResponse?.data)}`,
      );
    },
);

When(
    'a GET request is repeatedly made to {string} until the response body does not contain string {string}',
    {timeout: 120000},
    async function(url, unwantedValue) {
      const startedAt = Date.now();
      let lastResponse;

      while (Date.now() - startedAt < DEFAULT_WAIT_SECONDS * 1000) {
        const response = await this.request(url, {
          method: 'GET',
        });
        this.setResponse(response);
        lastResponse = response;

        if (!JSON.stringify(response.data).includes(unwantedValue)) {
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      assert.fail(
          `Expected response body to no longer contain "${unwantedValue}" within ${DEFAULT_WAIT_SECONDS} seconds, but got ${JSON.stringify(lastResponse?.data)}`,
      );
    },
);

When(
    'a GET request is repeatedly made to {string} until the response bundle contains more than 0 entries',
    {timeout: 120000},
    async function(url) {
      const startedAt = Date.now();
      let lastResponse;

      while (Date.now() - startedAt < DEFAULT_WAIT_SECONDS * 1000) {
        const response = await this.request(url, {
          method: 'GET',
        });
        this.setResponse(response);
        lastResponse = response;

        if (Array.isArray(response.data?.entry) && response.data.entry.length > 0) {
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      assert.fail(
          `Expected response bundle to contain entries within ${DEFAULT_WAIT_SECONDS} seconds, but got ${JSON.stringify(lastResponse?.data)}`,
      );
    },
);

Then(
    'the API consumer invokes the {string} operation with:',
    {timeout: 120000},
    async function(operation, dataTable) {
      const operationName = operation.toLowerCase();
      const data = dataTable.hashes()[0];
      const nhi = data.patient;
      const facilityId = data.facilityId;
      const participationIndicator = data.participationIndicator;
      const reasonCode = data.reasonCode;
      const reasonCodeDisplay = data.reasonCodeDisplay;
      const resourceType = data.resourceType;
      const localResourceId = data.localResourceId;

      await eventuallyInvokeWithLockRetry.call(
          this,
          invokeParticipateOperation(
              operationName,
              nhi,
              facilityId,
              participationIndicator,
              reasonCode,
              reasonCodeDisplay,
              resourceType,
              localResourceId,
          ),
      );

      const response = this.getResponse();

      console.log(JSON.stringify(response.data, null, 2));

      assert.ok(
          response.status === 200,
          `Expected response status 200, but got ${response.status}`,
      );

      // const outcomeCode = response.data.issue[0].details.coding[0].code;
      assert.strictEqual(
          response.data.resourceType,
          'OperationOutcome',
          'Expected response resourceType to be "OperationOutcome"',
      );
      assert.ok(
          Array.isArray(response.data.issue) && response.data.issue.length > 0,
          'Expected response to contain at least one issue',
      );
    },
);

Then(
    'the API consumer eventually invokes the {string} operation within {int} seconds with:',
    {timeout: 120000},
    async function(operation, timeoutSeconds, dataTable) {
      const operationName = operation.toLowerCase();
      const data = dataTable.hashes()[0];
      const startedAt = Date.now();
      let lastResponse;

      while (Date.now() - startedAt < timeoutSeconds * 1000) {
        await invokeParticipateOperation(
            operationName,
            data.patient,
            data.facilityId,
            data.participationIndicator,
            data.reasonCode,
            data.reasonCodeDisplay,
            data.resourceType,
            data.localResourceId,
        ).call(this);

        lastResponse = this.getResponse();
        if (lastResponse.status === 200) {
          console.log(JSON.stringify(lastResponse.data, null, 2));
          return;
        }

        const outcomeCode = lastResponse?.data?.issue?.[0]?.details?.coding?.[0]?.code;
        if (lastResponse.status !== 403 || outcomeCode !== 'sdhr-patient-locked') {
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      assert.ok(
          lastResponse?.status === 200,
          `Expected response status 200 within ${timeoutSeconds} seconds, but got ${lastResponse?.status} with body ${JSON.stringify(lastResponse?.data)}`,
      );
    },
);

Then(
    'the API consumer invokes the {string} operation for active patient {string} and dormant patient {string}',
    {timeout: 30000},
    async function(operation, activeNhi, dormantNhi) {
      const operationName = operation.toLowerCase();

      await invokeLinkOperation(operationName, activeNhi, dormantNhi).call(this);

      const response = this.getResponse();

      console.log(JSON.stringify(response.data, null, 2));

      assert.ok(
          response.status === 200,
          `Expected response status 200, but got ${response.status}`,
      );
      assert.strictEqual(
          response.data.resourceType,
          'OperationOutcome',
          'Expected response resourceType to be "OperationOutcome"',
      );
      assert.ok(
          Array.isArray(response.data.issue) && response.data.issue.length > 0,
          'Expected response to contain at least one issue',
      );
    },
);

const invokeParticipateOperation = (
    operationName,
    nhi,
    facilityId,
    participationIndicator,
    reasonCode,
    reasonCodeDisplay,
    resourceType,
    localResourceId,
) =>
  async function() {
    this.addRequestHeader(
        'authorization',
        `Bearer ${this.getToken() || (await this.getOAuthToken())}`,
    );

    const payload = setupParticipateParametersResource(
        operationName,
        nhi,
        facilityId,
        participationIndicator,
        reasonCode,
        reasonCodeDisplay,
        resourceType,
        localResourceId,
    );

    // console.log(`Invoking ${operationName} operation with payload:`, JSON.stringify(payload, null, 2));
    console.log(`Invoking ${operationName}`); ;

    const response = await this.request(`/${operationName}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    // console.log(JSON.stringify(response.data, null, 2));

    // Wait for the resource to be indexed and available
    await new Promise((resolve) => setTimeout(resolve, 5000));
    this.setResponse(response);
  };

const invokeParticipateOperationWithDefaults = (overrides) => {
  const args = buildParticipateArgs(overrides);
  return invokeParticipateOperation(
      args.operationName,
      args.nhi,
      args.facilityId,
      args.participationIndicator,
      args.reasonCode,
      args.reasonCodeDisplay,
      args.resourceType,
      args.localResourceId,
  );
};

const invokeLinkOperation = (
    operationName,
    activeNhi,
    dormantNhi,
) =>
  async function() {
    this.addRequestHeader(
        'authorization',
        `Bearer ${this.getToken() || (await this.getOAuthToken())}`,
    );

    const payload = setupLinkParametersResource(activeNhi, dormantNhi);

    console.log(`Invoking ${operationName}`);

    const response = await this.request(`/${operationName}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    await new Promise((resolve) => setTimeout(resolve, 5000));
    this.setResponse(response);
  };

const assertOperationOutcomeSuccess = (response, expectedStatus = 200) => {
  assert.ok(
      response.status === expectedStatus,
      `Expected response status ${expectedStatus}, but got ${response.status}`,
  );
  assert.strictEqual(
      response.data.resourceType,
      'OperationOutcome',
      'Expected response resourceType to be "OperationOutcome"',
  );
  assert.ok(
      Array.isArray(response.data.issue) && response.data.issue.length > 0,
      'Expected response to contain at least one issue',
  );
};

async function eventuallyInvokeWithLockRetry(stepFn, timeoutSeconds = DEFAULT_WAIT_SECONDS) {
  const startedAt = Date.now();
  let lastResponse;

  while (Date.now() - startedAt < timeoutSeconds * 1000) {
    await stepFn.call(this);
    lastResponse = this.getResponse();

    if (lastResponse.status === 200) {
      return lastResponse;
    }

    const outcomeCode = lastResponse?.data?.issue?.[0]?.details?.coding?.[0]?.code;
    const isRetryableLock =
      lastResponse.status === 403 && outcomeCode === 'sdhr-patient-locked';
    const isRetryableBackgroundLoad =
      lastResponse.status === 409 &&
      outcomeCode === 'sdhr-patient-background-load-error';

    if (!isRetryableLock && !isRetryableBackgroundLoad) {
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  assert.ok(
      lastResponse?.status === 200,
      `Expected response status 200 within ${timeoutSeconds} seconds, but got ${lastResponse?.status} with body ${JSON.stringify(lastResponse?.data)}`,
  );
  return lastResponse;
}

async function eventuallyInvokeUntilOutcome(
    stepFn,
    {
      expectedStatus,
      expectedOutcomeCode,
      timeoutSeconds = DEFAULT_WAIT_SECONDS,
      retryableOutcomes = [
        {status: 403, code: 'sdhr-patient-locked'},
        {status: 409, code: 'sdhr-patient-background-load-error'},
      ],
    },
) {
  const startedAt = Date.now();
  let lastResponse;

  while (Date.now() - startedAt < timeoutSeconds * 1000) {
    await stepFn.call(this);
    lastResponse = this.getResponse();

    const outcomeCode = lastResponse?.data?.issue?.[0]?.details?.coding?.[0]?.code;
    if (lastResponse?.status === expectedStatus && outcomeCode === expectedOutcomeCode) {
      return lastResponse;
    }

    const isRetryable = retryableOutcomes.some(
        ({status, code}) => lastResponse?.status === status && outcomeCode === code,
    );
    if (!isRetryable) {
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  const lastOutcomeCode = lastResponse?.data?.issue?.[0]?.details?.coding?.[0]?.code;
  assert.ok(
      lastResponse?.status === expectedStatus &&
      lastOutcomeCode === expectedOutcomeCode,
      `Expected response status ${expectedStatus} with outcome code ${expectedOutcomeCode} within ${timeoutSeconds} seconds, but got ${lastResponse?.status} with body ${JSON.stringify(lastResponse?.data)}`,
  );
  return lastResponse;
}

async function eventuallyInvokeSetupOperation(stepFn, timeoutSeconds = DEFAULT_WAIT_SECONDS) {
  const startedAt = Date.now();
  let lastResponse;

  while (Date.now() - startedAt < timeoutSeconds * 1000) {
    await stepFn.call(this);
    lastResponse = this.getResponse();

    if (lastResponse.status === 200) {
      return lastResponse;
    }

    const diagnostics = lastResponse?.data?.issue?.[0]?.diagnostics || '';
    const outcomeCode = lastResponse?.data?.issue?.[0]?.details?.coding?.[0]?.code;
    const isRetryableLock =
      lastResponse.status === 403 && outcomeCode === 'sdhr-patient-locked';
    const isRetryableConflict =
      lastResponse.status === 409 &&
      diagnostics.includes('Another $participate operation is already in progress');

    if (!isRetryableLock && !isRetryableConflict) {
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  assert.ok(
      lastResponse?.status === 200,
      `Expected response status 200 within ${timeoutSeconds} seconds, but got ${lastResponse?.status} with body ${JSON.stringify(lastResponse?.data)}`,
  );
  return lastResponse;
}

Given(
    'the linking test fixture is reset via public API',
    {timeout: 600000},
    async function() {
      for (const [activeNhi, dormantNhi] of LINKING_FIXTURE_PAIRS) {
        await eventuallyInvokeSetupOperation.call(
            this,
            invokeLinkOperation('$unlink', activeNhi, dormantNhi),
            180,
        );
        assertOperationOutcomeSuccess(this.getResponse());
      }

      for (const nhi of LINKING_FIXTURE_PATIENTS) {
        await eventuallyInvokeSetupOperation.call(
            this,
            invokeParticipateOperationWithDefaults({
              operationName: '$hnz-participate',
              nhi,
              participationIndicator: 'true',
            }),
            180,
        );
        assertOperationOutcomeSuccess(this.getResponse());
      }
    },
);

Given(
    'patient {string} is globally opted in',
    {timeout: 120000},
    async function(nhi) {
      await eventuallyInvokeSetupOperation.call(
          this,
          invokeParticipateOperationWithDefaults({
            operationName: '$hnz-participate',
            nhi,
            participationIndicator: 'true',
          }),
      );

      assertOperationOutcomeSuccess(this.getResponse());
    },
);

Given(
    'patient {string} is globally opted out',
    {timeout: 120000},
    async function(nhi) {
      await eventuallyInvokeSetupOperation.call(
          this,
          invokeParticipateOperationWithDefaults({
            operationName: '$hnz-participate',
            nhi,
            participationIndicator: 'false',
          }),
      );

      assertOperationOutcomeSuccess(this.getResponse());
    },
);

Given(
    'patient {string} is opted in at facility {string}',
    {timeout: 120000},
    async function(nhi, facilityId) {
      await eventuallyInvokeSetupOperation.call(
          this,
          invokeParticipateOperationWithDefaults({
            operationName: '$participate',
            nhi,
            facilityId,
            participationIndicator: 'true',
          }),
      );

      assertOperationOutcomeSuccess(this.getResponse());
    },
);

Given(
    'patient {string} is eventually opted in at facility {string}',
    {timeout: 120000},
    async function(nhi, facilityId) {
      await eventuallyInvokeWithLockRetry.call(
          this,
          invokeParticipateOperationWithDefaults({
            operationName: '$participate',
            nhi,
            facilityId,
            participationIndicator: 'true',
          }),
      );
    },
);

Given(
    'patient {string} is opted out at facility {string}',
    {timeout: 120000},
    async function(nhi, facilityId) {
      await eventuallyInvokeSetupOperation.call(
          this,
          invokeParticipateOperationWithDefaults({
            operationName: '$participate',
            nhi,
            facilityId,
            participationIndicator: 'false',
          }),
      );

      assertOperationOutcomeSuccess(this.getResponse());
    },
);

Given(
    'active patient {string} is linked to dormant patient {string}',
    {timeout: 120000},
    async function(activeNhi, dormantNhi) {
      await eventuallyInvokeSetupOperation.call(
          this,
          invokeLinkOperation('$link', activeNhi, dormantNhi),
      );
      assertOperationOutcomeSuccess(this.getResponse());
    },
);

Given(
    'active patient {string} is unlinked from dormant patient {string}',
    {timeout: 120000},
    async function(activeNhi, dormantNhi) {
      await eventuallyInvokeSetupOperation.call(
          this,
          invokeLinkOperation('$unlink', activeNhi, dormantNhi),
      );
      assertOperationOutcomeSuccess(this.getResponse());
    },
);

Given(
    'the linking test patients are fully unlinked',
    {timeout: 300000},
    async function() {
      for (const [activeNhi, dormantNhi] of LINKING_FIXTURE_PAIRS) {
        await eventuallyInvokeSetupOperation.call(
            this,
            invokeLinkOperation('$unlink', activeNhi, dormantNhi),
        );
        assertOperationOutcomeSuccess(this.getResponse());
      }
    },
);

// Start profile compliance steps

Given('the profile {string}', async function(url) {
  // const res = await fetch(url);
  const res = await this.request(url, {
    method: 'GET',
  });
  profileDef = res.data;
  this.profileDef = profileDef;

  const mandatorySnapshotElements = profileDef.snapshot.element.filter(
      (e) => e.min >= 1 && e.path.includes('.'),
  );

  const requiredSlicedPaths = new Set(
      mandatorySnapshotElements
          .filter((e) => e.sliceName)
          .map((e) => e.path),
  );

  this.mandatoryElements = mandatorySnapshotElements
      .filter((e) => !(requiredSlicedPaths.has(e.path) && !e.sliceName))
      .map((e) => {
        const qualified = e.sliceName ? e.id : e.path;
        return qualified.replace(new RegExp(`^${profileDef.type}\\.`), '');
      });

  this.constraints = profileDef.snapshot.element.flatMap((e) =>
    (e.constraint ?? [])
        .map((c) => ({
          key: c.key,
          expr: c.expression,
          human: c.human,
          path: e.path ?? e.id,
          min: e.min ?? 0,
          severity: c.severity,
        })),
  );

  this.bindings = profileDef.snapshot.element.flatMap((e) =>
  e.binding ?
    [{
      path: e.path ?? e.id,
      strength: e.binding.strength,
      description: e.binding.description,
      valueSet: e.binding.valueSet,
      extension: e.binding.extension ?? [],
    }] :
    [],
  );

  // this.bindings = profileDef.snapshot.element.flatMap((e) =>
  //   (e.binding ?? [])
  //       .map((b) => ({
  //         strength: b.strength,
  //         valueSet: b.valueSet,
  //         description: b.description,
  //       })),
  // );

  console.log('Mandatory properties for profile:', url, this.mandatoryElements);
  this.attach(
      `<div style="padding:8px;border:1px solid #eee;margin-bottom:8px;">
      <strong>Mandatory properties for profile:</strong> ${url}<br>
      <pre>${JSON.stringify(this.mandatoryElements, null, 2)}</pre>
      <pre>${JSON.stringify(this.constraints, null, 2)}</pre>
      <pre>${JSON.stringify(this.bindings, null, 2)}</pre>
    </div>`,
      'text/html',
  );
  console.log('Constraints count:', this.constraints.length);
  console.log('Bindings count:', this.bindings.length);
  // console.log('Bindings:', this.bindings);
  // console.log('Constraints:', this.constraints);
});

When('I create payload variations violating each constraint', function() {
  constraintVariations = this.constraints.map((c) => {
    const clone = JSON.parse(JSON.stringify(this.payload));
    // const pathInInstance = c.path.replace(/^([A-Z][A-Za-z]+)\./, '');

    // Dynamically violate the constraint
    const violated = violateConstraint(clone, c);

    // Evaluate the returned payload to see if it actually violates the constraint
    const result = evaluate(violated[0], c.expr, {model: r4Model});
    if (result.length === 0 || result[0] === false) {
      console.warn(`⚠️ Constraint not violated by variation: ${c.key} (${c.human}) - expression: ${c.expr} at path ${c.path}`);
    } else {
      console.log(`✅ Constraint violated by variation: ${c.key} (${c.human}) - expression: ${c.expr} at path ${c.path}`);
    }

    return {
      key: c.key,
      expr: c.expr,
      severity: c.severity,
      human: c.human,
      path: c.path,
      resource: violated,
    };
  });
});

When('each constraint variation is POSTed to {string}', async function(url) {
  this.skippedCount = 0;
  for (const v of constraintVariations) {
    // Only test constraints with severity 'error' and skip 'warning' or 'information'
    // SDHR does not support contained resources, so skip those constraints too
    // Skip the `meta.source` constraint as it is impossible to hit due to participation check occuring first
    if (v.severity === 'error' && !v.expr.startsWith('contained.') && v.key !== 'hpi-location-url-format') { // && v.key !== 'nhi-url-format') {
      this.payload = v.resource;
      this.addRequestHeader(
          'authorization',
          `Bearer ${this.getToken() || (await this.getOAuthToken())}`,
      );
      const response = await this.request(url, {
        method: 'POST',
        body: JSON.stringify(v.resource),
      });
      v.status = response.status;
      v.outcome = response.data;
      // console.log(`Response data for constraint ${v.key} (${v.human}):`, JSON.stringify(v.outcome, null, 2));
    } else {
      this.skippedCount++;
      console.log(`Skipping constraint ${v.key} (${v.human}) with severity ${v.severity}`);
      v.outcome = {resourceType: 'OperationOutcome', issue: [{severity: v.severity, code: 'invalid'}], note: [{text: `Skipped constraint ${v.key} (${v.human}) with severity ${v.severity}`}]};
      v.status = 400;
    }
  }
});

Then('each constraint variation should fail with OperationOutcome', async function() {
  this.attach(
      `<div style="padding:8px;border:1px solid #eee;margin-bottom:8px;">
      <strong>Total constraints evaluated:</strong> ${constraintVariations.length}<br>
      <strong>Skipped constraints:</strong> ${this.skippedCount}<br>
      <pre>Note that constaints will be skipped if they are global and relate to an unsupported property - e.g. contained</pre>
    </div>`,
      'text/html',
  );
  for (const v of constraintVariations) {
    this.attach(
        `<div style="padding:8px;border:1px solid #eee;margin-bottom:8px;">
        <strong>Constraint:</strong> ${v.key} ${v.human} ${v.path}<br>
        <strong>HTTP Response Status:</strong> ${v.status}<br>
        <pre>Payload: ${JSON.stringify(v.resource, null, 2)}</pre>
        <pre>Outccome: ${JSON.stringify(v.outcome, null, 2)}</pre>
      </div>`,
        'text/html',
    );
    assert(
        v.status >= 400,
        `Expected failure for constraint ${v.key} (${v.human}), got ${v.status}`,
    );
    assert(
        v.outcome.resourceType === 'OperationOutcome',
        `Expected OperationOutcome for constraint ${v.key} (${v.human}), but got ${JSON.stringify(v.outcome)}`,
    );
    assert(
        Array.isArray(v.outcome.issue) && v.outcome.issue.some((i) => i.code === 'invalid'),
        `Expected issue code "invalid" for constraint ${v.key} (${v.human}), but got ${JSON.stringify((v.outcome.issue || []).map((i) => i.code))}`,
    );
  }
});

When('I remove each mandatory property from the payload', async function() {
  this.mandatoryVariations = this.mandatoryElements.map((p) => {
    const clone = JSON.parse(JSON.stringify(this.payload));
    deleteMandatoryElementByPath(clone, p, this.profileDef);
    return {property: p, resource: clone};
  });
});

When('each mandatory-variation is POSTed to {string}', async function(url) {
  for (const v of this.mandatoryVariations) {
    // deletePropertyByPath(v.resource, v.property);
    this.addRequestHeader(
        'authorization',
        `Bearer ${this.getToken() || (await this.getOAuthToken())}`,
    );
    const response = await this.request(url, {
      method: 'POST',
      body: JSON.stringify(v.resource),
    });
    v.status = response.status;
    v.outcome = response.data;
    // console.log(`Response data for ${v.property}:`, JSON.stringify(v.outcome, null, 2));
  }
});

Then('each mandatory variation should fail with http 400 and OperationOutcome response containing issue.code equal to invalid', async function() {
  for (const v of this.mandatoryVariations) {
    console.log(`Checking OperationOutcome response when missing property: ${v.property}`);
    // console.log(evaluate(v.outcome, 'issue.code or issue.details.coding.code'));
    this.attach(
        `<div style="padding:8px;border:1px solid #eee;margin-bottom:8px;">
        <strong>Missing property:</strong> ${v.property}<br>
        <strong>HTTP Response Status:</strong> ${v.status}<br>
        <pre>Outccome: ${JSON.stringify(v.outcome, null, 2)}</pre>
      </div>`,
        'text/html',
    );
    assert.ok(v.status >= 400, `Expected failure for mandatory property ${v.property}, got ${v.status}`);
    assert(
        v.outcome.resourceType === 'OperationOutcome',
        `Expected OperationOutcome when removing ${v.property}, but got ${JSON.stringify(v.outcome)}`,
    );
    assert(
        evaluate(v.outcome, 'issue.code').includes('invalid'),
        `Expected issue code "invalid" when removing ${v.property}, but got ${JSON.stringify(v.outcome.issue.map((i) => i.code))}`,
    );
  }
});

When('I create payload variations violating each required binding', function() {
  bindingVariations = this.bindings
      .filter((b) => b.strength === 'required')
      .map((b) => {
        const clone = JSON.parse(JSON.stringify(this.payload));

        // find the element definition for this binding, so we can see the type
        const elDef = this.profileDef.snapshot.element.find((el) => el.path === b.path);
        const typeCode = elDef?.type?.[0]?.code;

        // navigate into the payload
        const pathParts = b.path.split('.');
        let target = clone;
        for (let i = 1; i < pathParts.length - 1; i++) {
          if (!target[pathParts[i]]) {
            target[pathParts[i]] = {};
          }
          target = target[pathParts[i]];
        }
        const last = pathParts[pathParts.length - 1];

        // Overwrite based on type
        switch (typeCode) {
          case 'code':
          // Example: identifier.use = "secondary"
            if (Array.isArray(target)) {
              target[0][last] = 'not-in-valueset';
            } else {
              target[last] = 'not-in-valueset';
            }
            break;

          case 'Coding':
          // Example: meta.security
            target[last] = {
              system: 'http://fhir.example.org/invalid-system',
              code: 'not-in-valueset',
              display: 'Not in valueset',
            };
            break;

          case 'CodeableConcept':
          // Example: condition.clinicalStatus
            target[last] = {
              coding: [{
                system: 'http://fhir.example.org/invalid-system',
                code: 'not-in-valueset',
                display: 'Not in valueset',
              }],
            };
            break;

          default:
            console.warn(`⚠️ Skipping binding at ${b.path} (unsupported type: ${typeCode})`);
        }

        console.log(`✅ Violated required binding at ${b.path} (type=${typeCode}) valueSet=${b.valueSet}`);

        return {
          path: b.path,
          type: typeCode,
          strength: b.strength,
          valueSet: b.valueSet,
          description: b.description,
          resource: clone,
        };
      });
});

When('each mandatory binding variation is POSTed to {string}', async function(url) {
  for (const v of bindingVariations) {
    this.addRequestHeader(
        'authorization',
        `Bearer ${this.getToken() || (await this.getOAuthToken())}`,
    );
    const response = await this.request(url, {
      method: 'POST',
      body: JSON.stringify(v.resource),
    });
    v.status = response.status;
    v.outcome = response.data;
    console.log(`Response data for binding at ${v.path}:`, JSON.stringify(v.outcome, null, 2));
  }
});

Then('each mandatory binding variation should fail with OperationOutcome', async function() {
  for (const v of bindingVariations) {
    console.log(`Checking OperationOutcome response for binding at: ${v.path}`);
    // console.log(evaluate(v.outcome, 'issue.code or issue.details.coding.code'));
    this.attach(
        `<div style="padding:8px;border:1px solid #eee;margin-bottom:8px;">
        <strong>Binding path:</strong> ${v.path}<br>
        <strong>Binding type:</strong> ${v.type}<br>
        <strong>Binding valueSet:</strong> ${v.valueSet}<br>
        <strong>HTTP Response Status:</strong> ${v.status}<br>
        <pre>Payload: ${JSON.stringify(v.resource, null, 2)}</pre>
        <pre>Outccome: ${JSON.stringify(v.outcome, null, 2)}</pre>
      </div>`,
        'text/html',
    );
    assert(
        v.status >= 400,
        `Expected failure for binding at ${v.path}, got ${v.status}`,
    );
    assert(
        v.outcome.resourceType === 'OperationOutcome',
        `Expected OperationOutcome for binding at ${v.path}, but got ${JSON.stringify(v.outcome)}`,
    );
    assert(
        Array.isArray(v.outcome.issue) && v.outcome.issue.some((i) => i.code === 'invalid'),
        `Expected issue code "invalid" for binding at ${v.path}, but got ${JSON.stringify((v.outcome.issue || []).map((i) => i.code))}`,
    );
  }
});

Given('a batch bundle payload containing {string} resources is created for NHI {string} at facility {string} with local ID {string}', async function(resources, nhi, facilityId, localResourceId) {
  resources = resources.split(' ').map((r) => r.trim().toLowerCase());
  this.payload = {
    resourceType: 'Bundle',
    id: 'bundle-' + Date.now(),
    meta: {
      profile: [
        'https://fhir-ig.digital.health.nz/sdhr/StructureDefinition/SDHRBatchBundle',
      ],
    },
    type: 'batch',
    entry: [],
  };
  // Add resources to the bundle
  for (const r of resources) {
    switch (r) {
      case 'condition':
        rid = `cond-${Date.now()}`;
        const cp = {id: rid, fullUrl: `urn:uuid:${rid}`};
        cp.resource = setupStandardConditionResource(nhi,
            null,
            facilityId,
            localResourceId);
        cp.request = {method: 'POST', url: 'Condition'};
        this.payload.entry.push(cp);
        break;
      case 'allergyintolerance':
        rid = `alle-${Date.now()}`;
        const ap = {id: rid, fullUrl: `urn:uuid:${rid}`};
        ap.resource = setupStandardAllergyIntoleranceResource(nhi,
            null,
            facilityId,
            localResourceId);
        ap.request = {method: 'POST', url: 'AllergyIntolerance'};
        this.payload.entry.push(ap);
        break;
      case 'encounter':
        rid = `enc-${Date.now()}`;
        const ep = {id: rid, fullUrl: `urn:uuid:${rid}`};
        ep.resource = setupStandardEncounterResource(nhi,
            null,
            facilityId,
            localResourceId);
        ep.request = {method: 'POST', url: 'Encounter'};
        this.payload.entry.push(ep);
        break;
      case 'observation':
        rid = `obs-${Date.now()}`;
        const op = {id: rid, fullUrl: `urn:uuid:${rid}`};
        op.resource = setupStandardObservationResource(nhi,
            null,
            facilityId,
            localResourceId);
        op.request = {method: 'POST', url: 'Observation'};
        this.payload.entry.push(op);
        break;
      default:
        throw new Error(`Unsupported resource type: ${r}`);
    }
  }
});

function deleteMandatoryElementByPath(obj, path, profileDef) {
  const sliceMatch = path.match(/^(.*?):([^.:]+)$/);
  if (sliceMatch) {
    const [, basePath, sliceName] = sliceMatch;
    const sliceId = `${profileDef.type}.${basePath}:${sliceName}`;
    const sliceDef = profileDef.snapshot.element.find((e) => e.id === sliceId);

    if (sliceDef && (basePath === 'extension' || basePath === 'modifierExtension')) {
      const extensionProfile = sliceDef.type?.[0]?.profile?.[0];
      const extensionFixedUrl = sliceDef.fixedUri;
      const target = obj[basePath];

      if (Array.isArray(target)) {
        obj[basePath] = target.filter((entry) => {
          const url = entry?.url;
          if (extensionFixedUrl && url === extensionFixedUrl) return false;
          if (extensionProfile && url === extensionProfile) return false;
          return true;
        });
      }
      return;
    }
  }

  deletePropertyByPath(obj, path);
}

function deletePropertyByPath(obj, path) {
  const parts = path.split('.');
  let target = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    if (!target[parts[i]]) return;
    target = target[parts[i]];
  }

  const last = parts[parts.length - 1];
  const choiceMatch = last.match(/^(\w+)\[x\]$/);

  if (choiceMatch) {
    // Delete all variants of the choice property (e.g. effectiveDateTime, effectivePeriod)
    const base = choiceMatch[1];
    if (Array.isArray(target)) {
      target.forEach((el) => {
        if (el && typeof el === 'object') {
          Object.keys(el)
              .filter((k) => k.startsWith(base) && k.length > base.length)
              .forEach((k) => delete el[k]);
        }
      });
    } else if (target && typeof target === 'object') {
      Object.keys(target)
          .filter((k) => k.startsWith(base) && k.length > base.length)
          .forEach((k) => delete target[k]);
    }
  } else {
    // Normal property deletion
    if (Array.isArray(target)) {
      target.forEach((el) => {
        if (el && typeof el === 'object') {
          delete el[last];
        }
      });
    } else if (target && typeof target === 'object') {
      delete target[last];
    }
  }
}

function violateConstraint(clone, constraint) {
  const expr = constraint.expr;
  const path = constraint.path;
  const facilityId = 'F38006-B';
  const nhi = 'ZMW0002';

  // Remove clinicalStatus if required by the constraint
  if (/clinicalStatus\.exists\(\)/.test(expr)) {
    delete clone.clinicalStatus;
  }

  // "key" : "con-5",
  // "severity" : "error",
  // "human" : "Condition.clinicalStatus SHALL NOT be present if verification Status is entered-in-error",
  // "expression" : "verificationStatus.coding.where(system='http://terminology.hl7.org/CodeSystem/condition-ver-status' and code='entered-in-error').empty() or clinicalStatus.empty()",
  // "xpath" : "not(exists(f:verificationStatus/f:coding[f:system/@value='http://terminology.hl7.org/CodeSystem/condition-ver-status' and f:code/@value='entered-in-error'])) or not(exists(f:clinicalStatus))",
  // "source" : "http://hl7.org/fhir/StructureDefinition/Condition"
  if (/verificationStatus\.coding\.where\(system='[^']+' and code='entered-in-error'\)\.empty\(\) or clinicalStatus\.empty\(\)/.test(expr)) {
    clone.verificationStatus = {
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
        code: 'entered-in-error',
      }],
    };
  }

  // Set category to include 'problem-list-item' if constraint checks for its absence
  if (/category\.select\(\$this='problem-list-item'\)\.empty\(\)/.test(expr)) {
    clone.category = [{
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/condition-category',
        code: 'problem-list-item',
      }],
    }];
  }

  // Set abatementString to abated and clinicalStatus to active violate constraint
  if (/abatement\.empty\(\)/.test(expr)) {
    clone.abatementString = 'abated';
    clone.clinicalStatus = {
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
        code: 'active',
      }],
    };
  }

  // Set verificationStatus to 'entered-in-error' to violate constraint
  if (/verificationStatus\.coding\.where\(system='[^']+' and code = 'entered-in-error'\)\.empty\(\)/.test(expr)) {
    clone.verificationStatus = {
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
        code: 'entered-in-error',
      }],
    };
  }

  // "key": "ait-1",
  // "expr": "verificationStatus.coding.where(system = 'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification' and code = 'entered-in-error').exists() or clinicalStatus.exists()",
  // "human": "AllergyIntolerance.clinicalStatus SHALL be present if verificationStatus is not entered-in-error.",
  // "path": "AllergyIntolerance",
  if (/verificationStatus\.coding\.where\(system = '[^']+' and code = 'entered-in-error'\)\.exists\(\) or clinicalStatus\.exists\(\)/.test(expr)) {
    clone.verificationStatus = {
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification',
        code: 'confirmed',
      }],
    };
    delete clone.clinicalStatus;
  }

  // "key": "ait-2",
  // "expr": "verificationStatus.coding.where(system = 'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification' and code = 'entered-in-error').empty() or clinicalStatus.empty()",
  // "human": "AllergyIntolerance.clinicalStatus SHALL NOT be present if verification Status is entered-in-error",
  // "path": "AllergyIntolerance",
  if (/verificationStatus\.coding\.where\(system = '[^']+' and code = 'entered-in-error'\)\.empty\(\) or clinicalStatus\.empty\(\)/.test(expr)) {
    clone.verificationStatus = {
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification',
        code: 'entered-in-error',
      }],
    };
  }

  // "key" : "code-or-note-required",
  // "human" : "The AllergyIntolerance resource must have at least one of 'code' or 'note'.",
  // "expr" : "(code.exists() or note.exists())"
  // "path" : "AllergyIntolerance"
  if (/\(code\.exists\(\) or note\.exists\(\)\)/.test(expr)) {
    delete clone.code;
    delete clone.note;
  }

  // Catch all handler for the hasValue() or (children().count() > id.count()) constraints
  if (expr === 'hasValue() or (children().count() > id.count())') {
    violateEle1(clone, path);
  }

  // Handle Must have either extensions or value[x], not both
  if (expr === 'extension.exists() != value.exists()') {
    violateEle1(clone, path);
  }

  // Handler for Condition.stage constraint
  if (expr === 'summary.exists() or assessment.exists()') {
    // Create an empty stage array to violate the constraint
    clone.stage = [];
  }

  // Handler for Condition.evidence constraint
  if (expr === 'code.exists() or detail.exists()') {
    // Create an empty evidence array to violate the constraint
    clone.evidence = [];
  }

  // Special SDHR handler for NHI / HPI references
  if (constraint.key === 'nhi-url-format' || constraint.key === 'hpi-url-format' || constraint.key === 'hpi-location-url-format') {
    // mutate the reference to an invalid format
    switch (constraint.key) {
      case 'nhi-url-format':
        if (clone.subject && clone.subject.reference) {
          clone.subject.reference = `https://invalid.hip.digital.health.nz/fhir/nhi/v1/Patient/${nhi}`;
        } else if (clone.patient && clone.patient.reference) {
          clone.patient.reference = `https://invalid.hip.digital.health.nz/fhir/nhi/v1/Patient/${nhi}`;
        }
        break;
      case 'hpi-location-url-format':
        if (clone.meta && clone.meta.source) {
          clone.meta.source = `https://invalid.hip.digital.health.nz/fhir/hpi/v1/Location/${facilityId}`;
        }
        break;
      case 'hpi-url-format':
        if (clone.asserter && clone.asserter.reference) {
          clone.asserter.reference = 'https://api.hip.digital.health.nz/fhir/hpi/v1/Practitioner/INVALIDHPI';
        }
        break;
    }
  }

  // Handler for Observation dataAbsentReason.empty() or value.empty()
  if (expr === 'dataAbsentReason.empty() or value.empty()') {
    // Hack as this constraint does not appear to apply to component observations
    if (clone.component) {
      delete clone.component;
    }
    // Set valueQuantity to violate the constraint
    clone.valueQuantity = {
      value: 98.6,
      unit: 'F',
      system: 'http://unitsofmeasure.org',
      code: 'F',
    };
    // Set dataAbsentReason to a value to violate the constraint
    clone.dataAbsentReason = {
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/data-absent-reason',
        code: 'unknown',
      }],
    };
  }

  // Special handler for Observation value.empty() or component.code.where(coding.intersect(%resource.code.coding).exists()).empty()
  if (expr === 'value.empty() or component.code.where(coding.intersect(%resource.code.coding).exists()).empty()') {
    clone.component = [];
    clone.component.push({
      code: {
        coding: [
          {
            system: 'http://loinc.org',
            code: '8480-6',
            display: 'Systolic blood pressure',
          },
        ],
        valueQuantity: {
          value: 73,
          unit: 'mmHg',
          system: 'http://unitsofmeasure.org',
          code: 'mm[Hg]',
        },
      },
    });
    // Set the Observation code
    clone.code = {
      coding: [
        {
          system: 'http://loinc.org',
          code: '8480-6',
          display: 'Systolic blood pressure',
        },
      ],
    };
    // Set valueQuantity to violate the constraint
    clone.valueQuantity = {
      value: 98.6,
      unit: 'F',
      system: 'http://unitsofmeasure.org',
      code: 'F',
    };
  }

  // Special handler for low.exists() or high.exists() or text.exists()
  if (expr === 'low.exists() or high.exists() or text.exists()') {
    violateEle1(clone, path);
  }

  // Add more patterns as needed for other constraints

  return clone;
}

function ensurePath(resource, path) {
  const LIKELY_ARRAY_PROPS = new Set([
    'extension', 'modifierExtension', 'identifier', 'coding', 'category', 'note',
    'telecom', 'name', 'address', 'contact', 'component', 'contained', 'tag',
    'security', 'profile', 'type', 'slot', 'part', 'performer', 'reasonCode', 'referenceRange',
  ]);
  if (!resource || typeof resource !== 'object') {
    throw new Error('resource must be an object');
  }
  if (!path || typeof path !== 'string') {
    throw new Error('path must be a string');
  }

  // Split and drop the root resourceType segment if present
  const parts = path.split('.').filter(Boolean);
  const rootType = resource.resourceType;
  if (parts.length && parts[0] === rootType) parts.shift();

  let current = resource;
  for (let i = 0; i < parts.length; i++) {
    const key = parts[i];
    const isLast = i === parts.length - 1;
    const shouldBeArray = LIKELY_ARRAY_PROPS.has(key);

    // Create if missing, or coerce into expected container shape
    if (!(key in current)) {
      current[key] = isLast && shouldBeArray ? [] : {};
    } else {
      const val = current[key];
      if (isLast && shouldBeArray) {
        if (!Array.isArray(val)) current[key] = [];
      } else {
        if (typeof val !== 'object' || val === null || Array.isArray(val)) {
          current[key] = {};
        }
      }
    }
    current = current[key];
  }
  return current;
}


function resolveParent(resource, path) {
  const parts = path.split('.').filter(Boolean);
  const rootType = resource.resourceType;
  if (parts[0] === rootType) parts.shift();
  if (parts.length === 0) return null;

  const parentPath = parts.slice(0, -1);
  let current = resource;
  for (const key of parentPath) {
    if (!current || typeof current !== 'object') return null;
    current = current[key];
  }
  return current && typeof current === 'object' ? current : null;
}

function violateEle1(resource, path) {
  const target = ensurePath(resource, path);

  if (Array.isArray(target)) {
    if (target.length === 0) {
      target.push({});
    } else {
      target[0] = {};
    }
  } else if (target && typeof target === 'object') {
    Object.keys(target).forEach((k) => delete target[k]);
  } else {
    const parent = resolveParent(resource, path);
    const lastKey = path.split('.').filter(Boolean).pop();
    if (parent && lastKey) parent[lastKey] = {};
  }
  return resource;
}
