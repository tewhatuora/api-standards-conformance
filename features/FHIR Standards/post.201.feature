@not-implemented
Feature: Resource Create Success
    
  @HNZAS_MUST_RETURN_LOCATION_WITH_201
  Scenario: When a new resource item has been created (POST), the server MUST respond with a 201 Created status and a Location header indicating the URI of the newly created resource item
    Given a valid Patient payload
    When a POST request is made to "/Patient" with the payload
    Then the response status should be 201
    And the response headers contain "Location" key