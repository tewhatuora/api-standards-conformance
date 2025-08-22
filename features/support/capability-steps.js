const assert = require('node:assert/strict');
const {Given, When, Then} = require('@cucumber/cucumber');
const config = require('./config');

const capabilityStatementUrl = (config.has && config.has('capabilityStatementUrl')) ?
    config.get('capabilityStatementUrl') :
    '/metadata';

When('the FHIR CapabilityStatement is retrieved', async function() {
  const response = await this.request(capabilityStatementUrl, {method: 'GET'});
  assert.equal(response.status, 200, 'CapabilityStatement fetch failed');
  // console.log('CapabilityStatement response:', response);
  this.setResponse(response);
  this.capabilityStatement = response;
});

Given('the following search fixtures:', function(dataTable) {
  this.searchFixtures = this.searchFixtures || {};
  for (const {parameter, value} of dataTable.hashes()) {
    this.searchFixtures[parameter] = {value};
  }
});

function getResourceSearchParams(capabilityStatement) {
  return capabilityStatement.data.rest
      ?.flatMap((rest) => rest.resource)
      ?.map((r) => {
        // Find all mandatory search params from the resource-level extensions
        const mandatoryParams = new Set();

        (r.extension || []).forEach((ext) => {
          if (ext.url === 'http://hl7.org/fhir/StructureDefinition/capabilitystatement-search-parameter-combination') {
            const shall = ext.extension?.find(
                (e) => e.url === 'http://hl7.org/fhir/StructureDefinition/capabilitystatement-expectation',
            );
            if (shall?.valueCode === 'SHALL') {
              const requiredParam = ext.extension?.find((e) => e.url === 'required');
              if (requiredParam?.valueString) {
                mandatoryParams.add(requiredParam.valueString);
              }
            }
          }
        });

        return {
          type: r.type,
          searchParams: (r.searchParam || []).map((sp) => ({
            name: sp.name,
            mandatory: mandatoryParams.has(sp.name),
          })),
        };
      }) || [];
}

Then('all CapabilityStatement search parameters should be testable', async function() {
  const resources = getResourceSearchParams(this.capabilityStatement);
  assert(resources.length > 0, 'No resources found in CapabilityStatement');

  for (const res of resources) {
    const mandatoryParams = res.searchParams.filter((sp) => sp.mandatory);
    const optionalParams = res.searchParams.filter((sp) => !sp.mandatory);
    const mandatoryQueryParts = [];

    for (const sp of mandatoryParams) {
      const fixture = this.searchFixtures?.[sp.name];
      if (!fixture?.value) {
        throw new Error(`❌ Missing value for mandatory parameter "${sp.name}" (resource ${res.type})`);
      }
      mandatoryQueryParts.push(`${sp.name}=${encodeURIComponent(fixture.value)}`);
    }

    if (mandatoryQueryParts.length === 0) {
      // No mandatory params: test each optional param individually
      if (optionalParams.length === 0) {
        console.warn(`⚠️ Resource ${res.type} has no search parameters; skipping`);
        continue;
      }
      for (const sp of optionalParams) {
        const fixture = this.searchFixtures?.[sp.name];
        if (!fixture?.value) {
          console.warn(`⚠️ Skipping optional parameter "${sp.name}" for ${res.type} (no value provided)`);
          continue;
        }
        const url = `/${res.type}?${sp.name}=${encodeURIComponent(fixture.value)}`;
        // console.log(`Testing optional parameter "${sp.name}" with URL: ${url}`);
        const response = await this.request(url, {method: 'GET'});
        assert.equal(response.status, 200, `Expected 200 for ${url}`);
        assert.equal(response.data.resourceType, 'Bundle', `Expected Bundle for ${url}`);
      }
      continue;
    }

    // Mandatory params: test with all mandatory, then each optional added
    let url = `/${res.type}?${mandatoryQueryParts.join('&')}`;
    let response = await this.request(url, {method: 'GET'});
    assert.equal(response.status, 200, `Expected 200 for ${url}`);
    assert.equal(response.data.resourceType, 'Bundle', `Expected Bundle for ${url}`);

    for (const sp of optionalParams) {
      const fixture = this.searchFixtures?.[sp.name];
      if (!fixture?.value) {
        console.warn(`⚠️ Skipping optional parameter "${sp.name}" for ${res.type} (no value provided)`);
        continue;
      }
      const optQuery = `${mandatoryQueryParts.join('&')}&${sp.name}=${encodeURIComponent(fixture.value)}`;
      url = `/${res.type}?${optQuery}`;
      // console.log(`Testing optional parameter "${sp.name}" with URL: ${url}`);
      response = await this.request(url, {method: 'GET'});

      assert.equal(response.status, 200, `Expected 200 for ${url}`);
      assert.equal(response.data.resourceType, 'Bundle', `Expected Bundle for ${url}`);
    }
  }
});

When(
    'a search is performed for resource {string} with parameter {string} = {string}',
    async function(resourceType, param, value) {
      const url = `/${resourceType}?${param}=${encodeURIComponent(value)}`;
      const response = await this.request(url, {method: 'GET'});
      this.setResponse(response);
    },
);

Then(
    'the response should be a valid Bundle of type {string}',
    async function(bundleType) {
      const resp = this.getResponse();
      assert.strictEqual(resp.data.resourceType, 'Bundle');
      assert.strictEqual(resp.data.type, bundleType);
    },
);
