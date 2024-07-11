@not-implemented @HISO10109 @HISO10110 @headers
Feature: Negative Tests for Invalid Accept Header

    @HNZAS_MUST_USE_ACCEPT_HEADER_FOR_GET_REQUEST @HNZAS_MUST_USE_ACCEPT_HEADER_FOR_POST_REQUEST @HNZAS_MUST_USE_ACCEPT_HEADER_FOR_PUT_REQUEST
    Scenario: An invalid accept header is provided results in "Not Acceptable"
        Given the third party requests a client_credentials access_token
        And the request header "Authorization" contains a bearer token
        And the request header "Accept" set to "INVALID_ACCEPT_HEADER"
        When a GET /Observation request is made
        Then the response status should be 406
        And the response body should have property "Code" containing "NotAcceptable"
        And the response body should have property "Message"

    @HNZAS_MUST_USE_ACCEPT_HEADER_FOR_GET_REQUEST @HNZAS_MUST_USE_ACCEPT_HEADER_FOR_POST_REQUEST @HNZAS_MUST_USE_ACCEPT_HEADER_FOR_PUT_REQUEST
    Scenario: An invalid accept header is provided results in "Not Acceptable"
        Given the third party requests a client_credentials access_token
        And the request header "Authorization" contains a bearer token
        And the request header "Accept" set to "INVALID_ACCEPT_HEADER"
        When a POST /Observation request is made
        Then the response status should be 406
        And the response body should have property "Code" containing "NotAcceptable"
        And the response body should have property "Message"

    @HNZAS_MUST_USE_ACCEPT_HEADER_FOR_GET_REQUEST @HNZAS_MUST_USE_ACCEPT_HEADER_FOR_POST_REQUEST @HNZAS_MUST_USE_ACCEPT_HEADER_FOR_PUT_REQUEST
    Scenario: An invalid accept header is provided results in "Not Acceptable"
        Given the third party requests a client_credentials access_token
        And the request header "Authorization" contains a bearer token
        And the PUT header "Accept" set to "INVALID_ACCEPT_HEADER"
        When a PUTPOST /Observation request is made
        Then the response status should be 406
        And the response body should have property "Code" containing "NotAcceptable"
        And the response body should have property "Message"
