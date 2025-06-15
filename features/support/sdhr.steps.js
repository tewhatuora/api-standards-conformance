const assert = require('node:assert/strict');
const {Given, Then} = require('@cucumber/cucumber');
const {randomUUID} = require('crypto');


const TEST_NHI = 'ZMW0002';
const TEST_CONDITION_ID = '63e3c5c7-c938-4cf8-8815-900fc5781d8e';

setupConditionResource = (nhi, metaSecurity) => {
  const payload = {
    'resourceType': 'Condition',
    'id': TEST_CONDITION_ID,
    'meta': {
      'source': 'https://api.hip.digital.health.nz/fhir/Location/F38006-B',
      'profile': ['https://fhir-ig.digital.health.nz/sdhr/StructureDefinition/SDHRCondition'],
    },
    'extension': [{
      'url': 'http://hl7.org.nz/fhir/StructureDefinition/long-term-condition',
      'valueBoolean': true,
    }],
    'identifier': [{
      'use': 'secondary',
      'system': 'https://fhir.examplepms.co.nz',
      'value': 'ec2d6cad-1e19-46ee-accf-dc460a680710',
    }],
    'clinicalStatus': {
      'coding': [{
        'system': 'http://terminology.hl7.org/CodeSystem/condition-clinical',
        'code': 'active',
      }],
    },
    'verificationStatus': {
      'coding': [{
        'system': 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
        'code': 'confirmed',
      }],
    },
    'code': {
      'coding': [{
        'system': 'http://snomed.info/sct',
        'code': '38341003',
        'display': 'HT - Hypertension',
      }],
      'text': 'Hypertension',
    },
    'subject': {
      'reference': `https://api.hip.digital.health.nz/fhir/Patient/${nhi}`,
      'type': 'Patient',
      'display': 'Sage Westbrook',
    },
    'onsetDateTime': '2011-02-05T00:00:00+13:00',
    'recordedDate': '2023-11-26T10:02:45+13:00',
    'recorder': {
      'reference': 'https://api.hip.digital.health.nz/fhir/Practitioner/99ZZZZ',
      'type': 'Practitioner',
      'display': 'Dottie McStuffins',
    },
    'asserter': {
      'reference': 'https://api.hip.digital.health.nz/fhir/Practitioner/91ZZXN',
      'type': 'Practitioner',
      'display': 'DR Julian Subatoi Bashir',
    },
  };

  if (metaSecurity) {
    payload.meta.security = [metaSecurity];
  }
  return payload;
};

setupConsentResource = (guid, nhi, action) => {
  return {
    'resourceType': 'Consent',
    'status': 'active',
    'id': guid,
    'policy': [
      {
        'authority': 'https://www.health.govt.nz',
        'uri': 'https://www.health.govt.nz/covid-19-novel-coronavirus/covid-19-resources-and-tools/covid-19-your-privacy',
      },
    ],
    'scope': {
      'coding': [
        {
          'system': 'http://terminology.hl7.org/CodeSystem/consentscope',
          'code': 'patient-privacy',
          'display': 'Privacy Consent',
        },
      ],
      'text': 'Privacy Consent',
    },
    'category': [
      {
        'coding': [
          {
            'system': 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
            'code': 'IDSCL',
            'display': 'information disclosure',
          },
        ],
        'text': 'information disclosure',
      },
    ],
    'patient': {
      'reference': `https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/${nhi}`,
      'type': 'Patient',
    },
    'provision': {
      'period': {
        'start': (new Date()).toISOString().split('T')[0],
        'end': (new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 10)).toISOString().split('T')[0],
      },
      'type': action,
    },
  };
};


Given('a Condition resource for NHI {string} with no meta.security tags exists',
    {timeout: 10000},
    async function(nhi) {
      // Add a bearer token if creds are present, unless instructed not to
      this.addRequestHeader('authorization', `Bearer ${this.getToken() || await this.getOAuthToken()}`);
      const payload = setupConditionResource(nhi, null);
      const response = await this.request(`/Condition/${TEST_CONDITION_ID}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      // Wait for the resource to be indexed and available
      await new Promise((resolve) => setTimeout(resolve, 3000));
      this.setResponse(response);
    });
Given(
    /^a Condition resource for NHI "(?<nhi>\w+)" with meta\.security tag (?<security>{.+}) exists$/,
    {timeout: 10000},
    async function(nhi, security) {
      const parsedTag = JSON.parse(security);

      const payload = setupConditionResource(nhi, parsedTag);
      const response = await this.request(`/Condition/${TEST_CONDITION_ID}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      this.setResponse(response);

      // Wait for the resource to be indexed and available
      await new Promise((resolve) => setTimeout(resolve, 3000));
    },
);


Given('a valid Condition payload', function() {
  this.payload = setupConditionResource(TEST_NHI, TEST_CONDITION_ID);
});

Then('the response bundle should contain {int} entries', async function(entries) {
  const response = this.getResponse();
  assert.strictEqual(response.data.entry.length, entries);
});


Then('the response bundle should contain 1 entry', async function() {
  const response = this.getResponse();
  assert.strictEqual(response.data.entry.length, 1);
});

Then(/^the response bundle should include a meta\.security tag (.+)$/, async function(security) {
  const response = this.getResponse();
  const tags = response.data?.meta?.security ?? [];
  const parsedTag = JSON.parse(security);
  const {code, system} = parsedTag;
  const match = tags.find((tag) => tag.code === code && tag.system === system);
  assert(match, `Expected a meta.security tag with code "${code}" and system "${system}", but none was found`);
});


Then('the OperationOutcome should contain the message {string}', async function(message) {
  const response = this.getResponse();
  const operationOutcome = response.data;
  assert.strictEqual(operationOutcome.resourceType, 'OperationOutcome');
  assert.strictEqual(operationOutcome.issue[0].diagnostics, message);
});

Given('a health sector user {string} elects to participate in sdhr',
    async function(nhi) {
      setupConsentForNHI(nhi, 'permit').call(this);
    });

Given('a health sector user {string} elects not to participate in sdhr',
    async function(nhi) {
      setupConsentForNHI(nhi, 'permit').call(this);
    });

const setupConsentForNHI = (nhi, action) => async function() {
  // Add a bearer token if creds are present, unless instructed not to
  this.addRequestHeader('authorization', `Bearer ${this.getToken() || await this.getOAuthToken()}`);

  // Get existing consent

  const consentResponse = await this.request(`/Consent?patient=${nhi}`, {
    method: 'GET',
  });
  const consent = consentResponse.data?.entry?.[0]?.resource;

  const guid = consent?.id || randomUUID();

  const payload = setupConsentResource(guid, nhi, action);

  const response = await this.request(`/Consent/${guid}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  // Wait for the resource to be indexed and available
  await new Promise((resolve) => setTimeout(resolve, 3000));
  this.setResponse(response);
};
