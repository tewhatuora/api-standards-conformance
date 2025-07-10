@HNZAS_MUST_USE_CACHE_CONTROL
Feature: Must use cache control header
    @HNZAS_MUST_USE_CACHE_CONTROL
    Scenario: Cache control header missing from GET request, returns "Bad Request"
        Given the API Consumer requests a client_credentials access token
        And the request header "Authorization" contains a bearer token
        And the request header "Content-Type" set to "application/fhir+json"
        And the request header "Accept" set to "application/fhir+json"
        When a request is made to every "GET" endpoint in the OAS
        Then every response should have status 200
        And every response should have header "Cache-Control"
