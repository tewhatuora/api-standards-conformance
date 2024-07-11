@not-implemented @HISO10109 @HISO10110 @headers @HNZAS_MUST_USE_CONTENT_TYPE_FOR_NON_GET_FORMAT_REQUEST 
Feature: Valid accept and response header scenarios

    @HNZAS_MUST_USE_ACCEPT_HEADER_FOR_GET_REQUEST @HNZAS_MUST_USE_ACCEPT_HEADER_FOR_POST_REQUEST @HNZAS_MUST_USE_CONTENT_TYPE_HEADER_FOR_POST_REQUEST @HNZAS_MUST_USE_ACCEPT_HEADER_FOR_PUT_REQUEST @HNZAS_MUST_USE_CONTENT_TYPE_HEADER_FOR_PUT_REQUEST
    Scenario: The response format requires content type
        Given the API Consumer requests a client_credentials access_token
        And the request header "Authorization" contains a bearer token
        And the request header "Content-Type" set to "application/fhir+json"
        And the request header "Accept" set to "*/*"
        When a GET /Observation request is made
        Then the response status should be 200
        And the response header "Content-Type" should equal "application/fhir+json;charset=utf-8"

    @HNZAS_MUST_USE_ACCEPT_HEADER_FOR_GET_REQUEST @HNZAS_MUST_USE_ACCEPT_HEADER_FOR_POST_REQUEST @HNZAS_MUST_USE_CONTENT_TYPE_HEADER_FOR_POST_REQUEST @HNZAS_MUST_USE_ACCEPT_HEADER_FOR_PUT_REQUEST @HNZAS_MUST_USE_CONTENT_TYPE_HEADER_FOR_PUT_REQUEST
    Scenario: The response format requires content type
        Given the API Consumer requests a client_credentials access_token
        And the request header "Authorization" contains a bearer token
        And the request header "Content-Type" set to "application/fhir+json"
        And the request header "Accept" set to "*/*"
        When a GET /Observation request is made
        Then the response status should be 200
        And the response header "Content-Type" should equal "application/fhir+json;charset=utf-8"

    @HNZAS_MUST_USE_ACCEPT_HEADER_FOR_GET_REQUEST @HNZAS_MUST_USE_ACCEPT_HEADER_FOR_POST_REQUEST @HNZAS_MUST_USE_CONTENT_TYPE_HEADER_FOR_POST_REQUEST @HNZAS_MUST_USE_ACCEPT_HEADER_FOR_PUT_REQUEST @HNZAS_MUST_USE_CONTENT_TYPE_HEADER_FOR_PUT_REQUEST
    Scenario: The response format requires content type
        Given the API Consumer requests a client_credentials access_token
        And the request header "Authorization" contains a bearer token
        And the request header "Content-Type" set to "application/fhir+json"
        And the request header "Accept" set to "*/*"
        When a <operation> /Observation request is made
        Then the response status should be 200
        And the response header "Content-Type" should equal "application/fhir+json;charset=utf-8"
