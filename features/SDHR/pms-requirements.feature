@sdhr
Feature: SDHR PMS Requirements

  Scenario: Setup participation
    Given the API Consumer requests a client_credentials access token with scope "https://fhir-ig.digital.health.nz/sdhr/OperationDefinition/SDHRParticipateOperation https://fhir-ig.digital.health.nz/sdhr/OperationDefinition/SDHRHNZParticipateOperation"
    Given the API consumer invokes the "$participate" operation with:
      | patient | facilityId | participationIndicator | reasonCode | reasonCodeDisplay | resourceType | localResourceId |
      | ZMW6100 | FZZ999-C   | true                   | null       | null              | null         | null            |
    Then the response status code should be 200
    And the API consumer invokes the "$hnz-participate" operation with:
      | patient | facilityId | participationIndicator | reasonCode | reasonCodeDisplay | resourceType | localResourceId |
      | ZMW6100 | null       | true                   | null       | null              | null         | null            |
    Then the response status code should be 200

  Scenario: CON-10 An API Consumer can modify a Condition resource over time.
    Given a valid "Condition" payload for NHI "ZMW6100" at facility "FZZ999-C" with local ID "guid"
    And the property "clinicalStatus.coding[0].code" is set to "inactive"
    And the API Consumer requests a new client_credentials access token with scope "system/Condition.crus"
    When a POST request is made to "/Condition" with the payload
    Then the response status code should be 201
    And the response body should have property "resourceType" containing "Condition"
    And the response body should have property "clinicalStatus.coding[0].code" containing "inactive"
    And the API Consumer saves the response id
    When a GET request is made to "/Condition" with the response body ID
    Then the response status code should be 200
    And the response body should have property "resourceType" containing "Condition"
    And the response body should have property id containing the saved ID
    # API Consumer updates the resource.
    When the response body is updated with:
      | propertyName                      | value     |
      | clinicalStatus.coding[0].code     | active    |
      | verificationStatus.coding[0].code | confirmed |
    And a PUT request is made to "/Condition" with the saved ID and the payload
    Then the response status code should be 200
    And the response body should have property "resourceType" containing "Condition"
    And the response body should have property "clinicalStatus.coding[0].code" containing "active"
    And the response body should have property "verificationStatus.coding[0].code" containing "confirmed"
