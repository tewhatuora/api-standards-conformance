@sdhr
Feature: Validate AllergyIntolerance resources against SDHR profile

  Scenario: Participate operation for Setup
    Given the profile "https://fhir-ig-uat.digital.health.nz/sdhr/StructureDefinition-SDHRAllergyIntolerance.json"
    And the API Consumer requests a client_credentials access token with scope "https://fhir-ig.digital.health.nz/sdhr/OperationDefinition/SDHRHNZParticipateOperation"
    Then the API consumer invokes the "$hnz-participate" operation with:
      | patient | facilityId | participationIndicator | reasonCode | reasonCodeDisplay | resourceType | localResourceId |
      | ZMW6602 | null       | true                  | null       | null              | null         | null            |
    Then the response status code should be 200
    And the response body should have property "resourceType" containing "OperationOutcome"
    And the response body should have property "issue[0].details.coding[0].code" containing "sdhr-operation-success"
    And the API Consumer requests a new client_credentials access token with scope "https://fhir-ig.digital.health.nz/sdhr/OperationDefinition/SDHRParticipateOperation"
    Then the API consumer invokes the "$participate" operation with:
      | patient | facilityId | participationIndicator | reasonCode | reasonCodeDisplay | resourceType | localResourceId |
      | ZMW6602 | FZZ999-Z   | true                   | null       | null              | null         | null            |
    Then the response status code should be 200
    And the response body should have property "resourceType" containing "OperationOutcome"
    And the response body should have property "issue[0].details.coding[0].code" containing "sdhr-operation-success"

  Scenario: Valid Condition resource is accepted
    Given a valid "Condition" payload for NHI "ZMW6602" at facility "FZZ999-Z" with local ID "null"
    When the API Consumer requests a new client_credentials access token with scope "system/Condition.crus"
    And a POST request is made to "/Condition" with the payload
    Then the response status code should be 201
    And the response body should have property "resourceType" containing "Condition"

  Scenario: All mandatory properties are enforced
    Given the profile "https://fhir-ig-uat.digital.health.nz/sdhr/StructureDefinition-SDHRCondition.json"
    Given a valid "Condition" payload for NHI "ZMW6602" at facility "FZZ999-Z" with local ID "null"
    When I remove each mandatory property from the payload
    And each mandatory-variation is POSTed to "/Condition"
    Then each mandatory variation should fail with OperationOutcome

#   Scenario: All profile constraints are enforced
#     Given a valid "Condition" payload for NHI "ZMW6601" at facility "FZZ999-Z" with local ID "null"
#     When I POST variations violating each constraint
#     Then each variation should fail with OperationOutcome


#   Scenario Outline: Missing mandatory property is rejected
#     Given a valid "Condition" payload for NHI "ZMW6601" at facility "FZZ999-Z" with local ID "null"
#     When I remove mandatory property "<property>"
#     And I POST the payload to "AllergyIntolerance"
#     Then the response body should have property "resourceType" containing "OperationOutcome"

#     Examples:
#       | property       |
#       | clinicalStatus |
#       | code           |
#       | patient        |

#   Scenario Outline: Constraint violation is rejected
#     Given a valid AllergyIntolerance payload for NHI "ZMW6001" at facility "G00001-G" with local ID "null"
#     When I violate constraint "<constraintKey>"
#     And I POST the payload to "AllergyIntolerance"
#     Then the response body should have property "resourceType" containing "OperationOutcome"

#     Examples:
#       | constraintKey |
#       | inv-1         |
#       | inv-2         |
