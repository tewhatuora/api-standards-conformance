@HNZAS_MUST_AUTHENTICATE_AUTHORIZE_API_CONSUMERS
Feature: Requests without Authorization header must return 401 Unauthorized

    @HNZAS_MUST_USE_AUTHORIZATION_HEADER_FOR_GET_REQUEST
    Scenario: invalid authorization header is provided and results in a "Unauthorized"
        Given the request header "Authorization" not set
        When a request is made to every "GET" endpoint in the OAS requiring authorisation
        Then every response should have status 401

    @HNZAS_MUST_USE_AUTHORIZATION_HEADER_FOR_POST_REQUEST
    Scenario: invalid authorization header is provided and results in a "Unauthorized"
        Given the request header "Authorization" not set
        When a request is made to every "POST" endpoint in the OAS requiring authorisation
        Then every response should have status 401

    @HNZAS_MUST_USE_AUTHORIZATION_HEADER_FOR_PUT_REQUEST
    Scenario: invalid authorization header is provided and results in a "Unauthorized"
        Given the request header "Authorization" not set
        When a request is made to every "PUT" endpoint in the OAS requiring authorisation
        Then every response should have status 401