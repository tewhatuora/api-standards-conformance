@HISO10107 
Feature: OAuth Tokens

  @HNZAS_SHOULD_USE_SHORT_LIVED_ACCESS_TOKEN
  Scenario: OAuth tokens used with a FHIR API MUST have a maximum expiry of an hour
    Given the API Consumer requests a client_credentials access token with scope "scope/cinc"
    And the request header "Authorization" contains a bearer token
    Then the token expiry time should be less than 3600 seconds

  @HNZAS_SHOULD_USE_JWT_ACCESS_REFRESH_TOKENS
  Scenario: APIs SHOULD use JWT access and refresh tokens.
    Given the API Consumer requests a client_credentials access token with scope "scope/cinc"
    And the request header "Authorization" contains a bearer token
    Then the access_token should be a jwt