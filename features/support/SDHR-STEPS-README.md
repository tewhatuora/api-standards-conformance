# SDHR Profile Conformance Test Steps

This file (`sdhr.steps.js`) contains step definitions and utility functions for automated testing of FHIR resource conformance against SDHR profiles using [Cucumber.js](https://github.com/cucumber/cucumber-js). It is designed to validate that FHIR resources meet the requirements specified in Implementation Guides, including mandatory properties, constraints, and correct handling of invalid payloads.

## Features

- **Resource Setup**: Functions to generate standard FHIR payloads for Condition, AllergyIntolerance, Encounter, Observation, and Parameters resources, with support for NHI, meta.security, facility, and local resource IDs.
- **Profile Compliance**: Steps to fetch a FHIR profile, extract mandatory elements and constraints, and attach them to the Cucumber report.
- **Constraint Violation Testing**: Dynamically generates payloads that violate profile constraints and posts them to the API, verifying that the server responds with appropriate OperationOutcome errors.
- **Mandatory Property Testing**: Removes mandatory properties from payloads and verifies that the server enforces their presence.
- **Flexible Path Handling**: Utility functions to safely navigate, create, and mutate nested properties in FHIR resources, including support for FHIR choice elements (e.g., `effective[x]`).
- **Rich Reporting**: Attaches detailed HTML-formatted payloads, outcomes, and constraint information to the Cucumber HTML report for easy debugging and traceability.

## Key Functions

- `setupStandard<Resource>Resource(...)`: Loads and customizes FHIR resource payloads for test scenarios.
- `deletePropertyByPath(obj, path)`: Removes a property (including FHIR choice elements) from a resource at a given path.
- `violateConstraint(clone, constraint)`: Modifies a resource to intentionally violate a given constraint expression.
- `ensurePath(resource, path)`: Ensures a nested path exists in a resource, creating objects/arrays as needed.
- `violateEle1(resource, path)`: Empties or deletes the target property at a given path to simulate a violation.
- `resolveParent(resource, path)`: Finds the parent object of a nested property path.

## Step Definitions

- **Given Steps**: Set up resources and profiles for test scenarios.
- **When Steps**: Create and POST payload variations that violate constraints or omit mandatory properties.
- **Then Steps**: Assert that the server responds with the expected OperationOutcome, including specific error codes and diagnostics.

## Usage

This file is intended to be used as part of a Cucumber.js test suite. It requires access to FHIR resource payloads (JSON files), a running FHIR API endpoint, and valid OAuth tokens for authentication.

Typical workflow:
1. Fetch a FHIR profile and extract mandatory elements and constraints.
2. Generate valid and invalid resource payloads.
3. POST payloads to the API and verify responses.
4. Attach detailed results to the Cucumber HTML report.

## Extending

- Add new resource setup functions as needed.
- Extend `violateConstraint` to handle additional constraint patterns.
- Update utility functions to support new FHIR resource structures or edge cases.

## Dependencies

- [Cucumber.js](https://github.com/cucumber/cucumber-js)
- [fhirpath](https://github.com/lhncbc/fhirpath.js)
- [Node.js assert module](https://nodejs.org/api/assert.html)
- [fs](https://nodejs.org/api/fs.html)
- [path](https://nodejs.org/api/path.html)

## License

This code is intended for use in SDHR conformance testing and may be adapted for other FHIR profile validation projects.

---

**Note:** This file is not intended to be run standalone. It is part of a larger test suite and relies on the Cucumber World context and