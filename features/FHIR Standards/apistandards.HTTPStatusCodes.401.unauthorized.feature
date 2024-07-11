@not-implemented @HISO10109 @HISO10110 @headers @HNZAS_MUST_AUTHENTICATE_AUTHORIZE_API_CONSUMERS
Feature: Negative Tests for Authorization Header

    @HNZAS_MUST_USE_AUTHORIZATION_HEADER_FOR_GET_REQUEST @HNZAS_MUST_USE_AUTHORIZATION_HEADER_FOR_POST_REQUEST @HNZAS_MUST_USE_AUTHORIZATION_HEADER_FOR_PUT_REQUEST
    Scenario: invalid authorization header is provided and results in a "Unauthorized"
        Given the request header "Authorization" set to "Bearer abc"
        When a GET /Observation request is made
        Then the response status should be 401

    @HNZAS_MUST_USE_AUTHORIZATION_HEADER_FOR_GET_REQUEST @HNZAS_MUST_USE_AUTHORIZATION_HEADER_FOR_POST_REQUEST @HNZAS_MUST_USE_AUTHORIZATION_HEADER_FOR_PUT_REQUEST
    Scenario: invalid authorization header is provided and results in a "Unauthorized"
        Given the request header "Authorization" set to "Bearer abc"
        When a POST /Observation request is made
        Then the response status should be 401

    @HNZAS_MUST_USE_AUTHORIZATION_HEADER_FOR_GET_REQUEST @HNZAS_MUST_USE_AUTHORIZATION_HEADER_FOR_POST_REQUEST @HNZAS_MUST_USE_AUTHORIZATION_HEADER_FOR_PUT_REQUEST
    Scenario: invalid authorization header is provided and results in a "Unauthorized"
        Given the request header "Authorization" set to "Bearer abc"
        When a PUT /Observation request is made
        Then the response status should be 401
