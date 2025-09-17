@fhir
Feature: FHIR API Standards
  @HNZAS_MUST_PUBLISH_CAPABILITY_STATEMENT
  Scenario: A FHIR API MUST serve a FHIR CapabilityStatement
    When a "GET" request to "/metadata" is made 
    Then the response status code should be 200
    Then the FHIR response body should contain "resourceType" "CapabilityStatement"

  @HNZAS_MUST_SUPPORT_JSON
  Scenario: A FHIR API MUST support JSON, at minimum, for resource representations
    When the request header "Accept" is set to "application/fhir+json"
    And a "GET" request to "/metadata" is made
    Then the response status code should be 200
    Then the response header "Content-Type" should contain one of "application/json,application/fhir+json"

  @HNZAS_MUST_RETURN_CONTENT_TYPE
  Scenario: The Content-Type MUST be returned in the response, indicating the format type the response content is in
    When a "GET" request to "/metadata" is made
    Then the response headers contain "Content-Type" key
  
  @HNZAS_MUST_USE_CANONICAL_URLS_FOR_RESOURCE_REFERENCES
  Scenario: FHIR APIs MUST use canonical URLs to reference canonical resource instances.
    Given the API Consumer requests a client_credentials access token with scope "scope/cinc"
    And the request header "Authorization" contains a bearer token
    When a "GET" request to "/Questionnaire/2c18304e-6177-4df5-869b-f113efcd0c5e" is made
    Then the response body should have property "url" containing "https://fhir-ig-uat.digital.health.nz/screening/Questionnaire/TermsOfUseOrgFacility"

