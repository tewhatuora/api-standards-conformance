@HISO10109 @HISO10110 @headers
Feature: Negative Tests for Not Supplied Accept Header

    @HNZAS_MUST_USE_ACCEPT_HEADER_FOR_GET_REQUEST @HNZAS_MUST_USE_ACCEPT_HEADER_FOR_POST_REQUEST @HNZAS_MUST_USE_ACCEPT_HEADER_FOR_PUT_REQUEST
    Scenario: Accepted header missing from request, returns "Bad Request"
        Given the API Consumer requests a client_credentials access token with scope "scope/cinc"
        And the request header "Authorization" contains a bearer token
        #And the request header "Content-Type" set to "application/fhir+json"
        And the request header "Accept" not set
        When a "GET" request to "/Consent/0ed25b00-8ab2-46de-87c1-f288a2ecc45e" is made
        Then the response status should be 400

    @HNZAS_MUST_USE_ACCEPT_HEADER_FOR_GET_REQUEST @HNZAS_MUST_USE_ACCEPT_HEADER_FOR_POST_REQUEST @HNZAS_MUST_USE_ACCEPT_HEADER_FOR_PUT_REQUEST
    Scenario: Accepted header missing from request, returns "Bad Request"
        Given the API Consumer requests a client_credentials access token with scope "scope/cinc"
        And the request header "Authorization" contains a bearer token
        And the request header "Content-Type" set to "application/fhir+json"
        And the request header "Accept" not set
        When a "POST" request to "/Consent" is made
        Then the response status should be 400

    @HNZAS_MUST_USE_ACCEPT_HEADER_FOR_GET_REQUEST @HNZAS_MUST_USE_ACCEPT_HEADER_FOR_POST_REQUEST @HNZAS_MUST_USE_ACCEPT_HEADER_FOR_PUT_REQUEST
    Scenario: Accepted header missing from request, returns "Bad Request"
        Given the API Consumer requests a client_credentials access token with scope "scope/cinc"
        And the request header "Authorization" contains a bearer token
        And the request header "Content-Type" set to "application/fhir+json"
        And the request header "Accept" not set
        When a "PUT" request to "/Consent/0ed25b00-8ab2-46de-87c1-f288a2ecc45e" is made
        Then the response status should be 400

    @HNZAS_MUST_USE_CONTENT_TYPE_HEADER_FOR_POST_REQUEST @HNZAS_MUST_USE_CONTENT_TYPE_HEADER_FOR_PUT_REQUEST
    Scenario: Content type missing from request, returns "Bad Request"
        Given the API Consumer requests a client_credentials access token with scope "scope/cinc"
        And the request header "Authorization" contains a bearer token
        And the request header "Content-Type" not set
        And the request header "Accept" set to "*/*"
        When a "GET" request to "/Consent/0ed25b00-8ab2-46de-87c1-f288a2ecc45e" is made
        Then the response status should be 400

    @HNZAS_MUST_USE_CONTENT_TYPE_HEADER_FOR_POST_REQUEST @HNZAS_MUST_USE_CONTENT_TYPE_HEADER_FOR_PUT_REQUEST
    Scenario: Content type missing from request, returns "Bad Request"
        Given the API Consumer requests a client_credentials access token with scope "scope/cinc"
        And the request header "Authorization" contains a bearer token
        And the request header "Content-Type" not set
        And the request header "Accept" set to "*/*"
        When a "POST" request to "/Consent" is made
        Then the response status should be 400

    @HNZAS_MUST_USE_CONTENT_TYPE_HEADER_FOR_POST_REQUEST @HNZAS_MUST_USE_CONTENT_TYPE_HEADER_FOR_PUT_REQUEST
    Scenario: Content type missing from request, returns "Bad Request"
        Given the API Consumer requests a client_credentials access token with scope "scope/cinc"
        And the request header "Authorization" contains a bearer token
        And the request header "Content-Type" not set
        And the request header "Accept" set to "*/*"
        When a "PUT" request to "/Consent/0ed25b00-8ab2-46de-87c1-f288a2ecc45e" is made
        Then the response status should be 400
