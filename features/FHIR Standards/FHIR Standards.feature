@fhir
Feature: FHIR API Standards
  @HNZAS_MUST_PUBLISH_CAPABILITY_STATEMENT
  Scenario: A FHIR API MUST serve a FHIR CapabilityStatement
    When a GET request is made to "/metadata"
    Then the response status code should be 200
    Then the FHIR response body should contain "resourceType" "CapabilityStatement"

  @HNZAS_MUST_SUPPORT_JSON
  Scenario: A FHIR API MUST support JSON, at minimum, for resource representations
    When the request header "Accept" is set to "application/fhir+json"
    And a GET request is made to the FHIR API
    Then the response status code should be 200
    Then the response header "Content-Type" should contain one of "application/json,application/fhir+json"

  @HNZAS_MUST_RETURN_CONTENT_TYPE
  Scenario: The Content-Type MUST be returned in the response, indicating the format type the response content is in
    When a GET request is made to "/Observation"
    Then the response headers contain "Content-Type" key
