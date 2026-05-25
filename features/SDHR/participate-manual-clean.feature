@sdhr @manual-clean
Feature: Participate operation requiring manual fixture cleaning
  # These scenarios depend on a patient/facility pair having no pre-existing
  # participation state. They are not safe to run as part of the shared default
  # suite because once a fixture is used, the environment no longer satisfies
  # the scenario preconditions without manual cleanup.

  Scenario: 3. Patient ZMW6008 opts in to SDHR participation using HNZ channel but no preferences for facility
    Given a patient "ZMW6008" notifies "HNZ" of participation "opt-in"
    Given the API Consumer requests a client_credentials access token with scope "https://fhir-ig.digital.health.nz/sdhr/OperationDefinition/SDHRHNZParticipateOperation"
    Then the API consumer invokes the "$hnz-participate" operation with:
      | patient | facilityId | participationIndicator | reasonCode       | reasonCodeDisplay | resourceType | localResourceId |
      | ZMW6008 | null       | true                   | null             | null              | null         | null            |
    Then the response status code should be 200
    And the response body should have property "resourceType" containing "OperationOutcome"
    And the response body should have property "issue[0].details.coding[0].code" containing "sdhr-operation-success"
    And the API Consumer requests a new client_credentials access token with scope "system/Condition.crus"
    Given a valid "Condition" payload for NHI "ZMW6008" at facility "F38006-B" with local ID "null"
    When a POST request is made to "/Condition" with the payload
    Then the response status code should be 403
    And the response body should have property "resourceType" containing "OperationOutcome"
    And the response body should have property "issue[0].details.coding[0].code" containing "sdhr-participation-status-unknown"
    When a GET request is made to "/Condition?patient=https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/ZMW6008&_source=https://api.hip.digital.health.nz/fhir/hpi/v1/Location/F38006-B"
    Then the response status code should be 403
    And the response body should have property "resourceType" containing "OperationOutcome"
    And the response body should have property "issue[0].details.coding[0].code" containing "sdhr-participation-status-unknown"

  Scenario: 8. Patient's participation preferences are unknown
    Given a patient "ZMW6005" has not notified "F38006-D" of participation preferences
    Given a valid "Condition" payload for NHI "ZMW6005" at facility "F38006-D" with local ID "null"
    And the API Consumer requests a client_credentials access token with scope "system/Condition.crus"
    When a POST request is made to "/Condition" with the payload
    Then the response status code should be 403
    And the response body should have property "resourceType" containing "OperationOutcome"
    And the response body should have property "issue[0].details.coding[0].code" containing "sdhr-participation-status-unknown"
    When a GET request is made to "/Condition?patient=https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/ZMW6005"
    Then the response status code should be 403
    And the response body should have property "resourceType" containing "OperationOutcome"
    And the response body should have property "issue[0].details.coding[0].code" containing "sdhr-participation-status-unknown"
