@HNZAS_MUST_RETURN_LOCATION_WITH_201
Feature: HTTP 201 responses must include a Location header
    Scenario: A 201 response must include a Location header
        Given the API Consumer requests a client_credentials access token
        And the request header "Authorization" contains a bearer token
        And the request header "Content-Type" set to "application/fhir+json"
        When a request is made to every "POST" endpoint in the OAS
        Then every response should have status 201
        And every response should have header "Location"