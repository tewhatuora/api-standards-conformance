Feature: Automated testing for Conformance Tooling

@automated-tests
Scenario: Should return a CapabilityStatement from the metadata endpoint
  Given a GET request is made to "https://hapi.fhir.org/baseR4/metadata"
  Then the response status code should be 200
  And the FHIR response body should contain "resourceType" "CapabilityStatement"
