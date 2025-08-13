const path = require('path');
const fs = require('fs');
const reporter = require('cucumber-html-reporter');
const {JSONPath} = require('jsonpath-plus');

const STANDARDS_JSON_ENDPOINT = 'https://apistandards.digital.health.nz/assets/api-standards.json';

function getStandards() {
  return fetch(STANDARDS_JSON_ENDPOINT)
      .then((response) => response.json())
      .then((data) => {
        return data;
      });
}

async function main() {
  const allStandards = await getStandards();
  // eslint-disable-next-line new-cap
  const allStandardsIds = JSONPath({
    path: '$..id',
    flatten: true,
    json: allStandards,
  });

  const uniqueStandardsIds = [...new Set(allStandardsIds.map((item) => item.toLowerCase()))];

  const resultsFile = fs.readFileSync(
      path.join(__dirname, '../cucumber_report.json'),
  );

  // eslint-disable-next-line new-cap
  const allCucumberTags = JSONPath({
    path: '$..tags',
    flatten: true,
    json: JSON.parse(resultsFile),
  });

  // Use Set to get unique names
  const uniqueTags = [...new Set(allCucumberTags.map((item) => item.name.toLowerCase().replace('@', '')))];

  const standardsNotImplemented = uniqueStandardsIds.filter((standardId) => !uniqueTags.includes(standardId));

  const options = {
    name: 'Conformance results',
    brandTitle: 'Te Whatu Ora API Standards',
    theme: 'bootstrap',
    columnLayout: 1,
    jsonFile: 'cucumber_report.json',
    output: `reports/conformance_results_${Date.now()}.html`,
    metadata: {
      'STANDARDS_NOT_IMPLEMENTED': standardsNotImplemented,
      'GENERATED_AT': new Date().toISOString(),
    },
    reportSuiteAsScenarios: true,
    scenarioTimestamp: true,
    launchReport: true,
    failedSummaryReport: true,
  };

  reporter.generate(options);
}

(async () => {
  try {
    await main();
  } catch (error) {
    console.error('An error occurred generating the report:', error);
  }
})();
