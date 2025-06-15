@HNZAS_MUST_USE_ACCEPT_HEADER
Feature: Requests without Accept header must return 400 Bad Response

    # @HNZAS_MUST_USE_ACCEPT_HEADER_FOR_GET_REQUEST
    # Scenario: Accepted header missing from GET request, returns "Bad Request"
    #     Given the API Consumer requests a client_credentials access token with scope "<scope>"
    #     And the request header "Authorization" contains a bearer token
    #     And the request header "Content-Type" set to "application/fhir+json"
    #     And the request header "Accept" not set
    #     When a "GET" request to "<endpoint>" is made
    #     Then the response status should be 400
    # Examples:
    #     | endpoint | scope |
    #     | /Observation | system/*.crus |
    #     | /Encounter/{rid} | system/*.crus |
    #     | /Encounter/{rid}/_history/1 | system/*.crus |
    #     | /Observation | system/*.crus |
    #     | /Observation/{rid} | system/*.crus |
    #     | /Observation/{rid}/_history/1 | system/*.crus |
    #     | /Condition | system/*.crus |
    #     | /Condition/{rid} | system/*.crus |
    #     | /Condition/{rid}/_history/1 | system/*.crus |
    #     | /Consent | system/*.crus |
    #     | /Consent/{rid} | system/*.crus |
    #     | /Consent/{rid}/_history/1 | system/*.crus |


    @HNZAS_MUST_USE_ACCEPT_HEADER_FOR_GET_REQUEST
    Scenario: Accepted header missing from GET request, returns "Bad Request" - All Endpoints
        Given the API Consumer requests a client_credentials access token
        And the request header "Authorization" contains a bearer token
        And the request header "Content-Type" set to "application/fhir+json"
        And the request header "Accept" not set
        When a request is made to every "GET" endpoint in the OAS
        Then every response should have status 400

    @HNZAS_MUST_USE_ACCEPT_HEADER_FOR_PUT_REQUEST
    Scenario: Accepted header missing from PUT request, returns "Bad Request"
        Given the API Consumer requests a client_credentials access token
        And the request header "Authorization" contains a bearer token
        And the request header "Content-Type" set to "application/fhir+json"
        And the request header "Accept" not set
        When a request is made to every "PUT" endpoint in the OAS
        Then every response should have status 400

    @HNZAS_MUST_USE_ACCEPT_HEADER_FOR_POST_REQUEST
    Scenario: Accepted header missing from POST request, returns "Bad Request"
        Given the API Consumer requests a client_credentials access token
        And the request header "Authorization" contains a bearer token
        And the request header "Content-Type" set to "application/fhir+json"
        And the request header "Accept" not set
        When a request is made to every "POST" endpoint in the OAS
        Then every response should have status 400

    @HNZAS_MUST_USE_ACCEPT_HEADER_FOR_GET_REQUEST
    Scenario: An invalid accept header is provided results in "Not Acceptable"
        Given the API Consumer requests a client_credentials access token
        And the request header "Authorization" contains a bearer token
        And the request header "Accept" set to "INVALID_ACCEPT_HEADER"
        When a request is made to every "GET" endpoint in the OAS
        Then every response should have status 406
        And every response body should have property "Code" containing "Not Acceptable"
        And every response body should have property "Message"

    @HNZAS_MUST_USE_ACCEPT_HEADER_FOR_POST_REQUEST
    Scenario: An invalid accept header is provided results in "Not Acceptable"
        Given the API Consumer requests a client_credentials access token
        And the request header "Authorization" contains a bearer token
        And the request header "Accept" set to "INVALID_ACCEPT_HEADER"
        When a request is made to every "POST" endpoint in the OAS
        Then every response should have status 406
        And every response body should have property "Code" containing "Not Acceptable"
        And every response body should have property "Message"

    @HNZAS_MUST_USE_ACCEPT_HEADER_FOR_PUT_REQUEST
    Scenario: An invalid accept header is provided results in "Not Acceptable"
        Given the API Consumer requests a client_credentials access token
        And the request header "Authorization" contains a bearer token
        And the request header "Accept" set to "INVALID_ACCEPT_HEADER"
        When a request is made to every "PUT" endpoint in the OAS
        Then every response should have status 406
        And every response body should have property "Code" containing "Not Acceptable"
        And every response body should have property "Message"
