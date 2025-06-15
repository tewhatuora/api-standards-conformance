@not-implemented
Feature: OAuth Tokens

  @HNZAS_SHOULD_USE_SHORT_LIVED_ACCESS_TOKEN
  Scenario: OAuth tokens used with a FHIR API MUST have a maximum expiry of an hour
    When a GET request is made to "/Observation"
    Then the request header "Authorization" contains a bearer token
    And the token expiry time should be less than 3600 seconds
