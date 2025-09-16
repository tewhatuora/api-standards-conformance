@sdhr
Feature: Validate resources against SDHR profile

  Scenario: Participate operation for Setup
    Given the profile "https://fhir-ig-uat.digital.health.nz/sdhr/StructureDefinition-SDHRAllergyIntolerance.json"
    And the API Consumer requests a client_credentials access token with scope "https://fhir-ig.digital.health.nz/sdhr/OperationDefinition/SDHRHNZParticipateOperation"
    Then the API consumer invokes the "$hnz-participate" operation with:
      | patient | facilityId | participationIndicator | reasonCode | reasonCodeDisplay | resourceType | localResourceId |
      | ZMW6602 | null       | true                   | null       | null              | null         | null            |
    Then the response status code should be 200
    And the response body should have property "resourceType" containing "OperationOutcome"
    And the response body should have property "issue[0].details.coding[0].code" containing "sdhr-operation-success"
    And the API Consumer requests a new client_credentials access token with scope "https://fhir-ig.digital.health.nz/sdhr/OperationDefinition/SDHRParticipateOperation"
    Then the API consumer invokes the "$participate" operation with:
      | patient | facilityId | participationIndicator | reasonCode | reasonCodeDisplay | resourceType | localResourceId |
      | ZMW6602 | F38006-B   | true                   | null       | null              | null         | null            |
    Then the response status code should be 200
    And the response body should have property "resourceType" containing "OperationOutcome"
    And the response body should have property "issue[0].details.coding[0].code" containing "sdhr-operation-success"

  Scenario: Valid Condition resource is accepted. This scenario will test that a valid Condition resource can be created.
    Given a valid "Condition" payload for NHI "ZMW6602" at facility "F38006-B" with local ID "null"
    When the API Consumer requests a new client_credentials access token with scope "system/Condition.crus"
    And a POST request is made to "/Condition" with the payload
    Then the response status code should be 201
    And the response body should have property "resourceType" containing "Condition"

  Scenario: All mandatory Condition properties are enforced. This tests that all mandatory properties for the Condition resource are enforced. It uses the profile published in the IG to determine which properties are mandatory and then mkes a request to the API with a payload that is missing the mandatory parameter.
    Given the profile "https://fhir-ig-uat.digital.health.nz/sdhr/StructureDefinition-SDHRCondition.json"
    Given a valid "Condition" payload for NHI "ZMW6602" at facility "F38006-B" with local ID "null"
    When I remove each mandatory property from the payload
    And each mandatory-variation is POSTed to "/Condition"
    Then each mandatory variation should fail with http 400 and OperationOutcome response containing issue.code equal to invalid

  Scenario: All mandatory AllergyIntolerance properties are enforced. This tests that all mandatory properties for the AllergyIntolerance resource are enforced. It uses the profile published in the IG to determine which properties are mandatory and then mkes a request to the API with a payload that is missing the mandatory parameter.
    Given the profile "https://fhir-ig-uat.digital.health.nz/sdhr/StructureDefinition-SDHRAllergyIntolerance.json"
    Given a valid "AllergyIntolerance" payload for NHI "ZMW6602" at facility "F38006-B" with local ID "null"
    When I remove each mandatory property from the payload
    And each mandatory-variation is POSTed to "/AllergyIntolerance"
    Then each mandatory variation should fail with http 400 and OperationOutcome response containing issue.code equal to invalid

  Scenario: All mandatory Encounter properties are enforced. This tests that all mandatory properties for the Encounter resource are enforced. It uses the profile published in the IG to determine which properties are mandatory and then mkes a request to the API with a payload that is missing the mandatory parameter.
    Given the profile "https://fhir-ig-uat.digital.health.nz/sdhr/StructureDefinition-SDHREncounter.json"
    Given a valid "Encounter" payload for NHI "ZMW6602" at facility "F38006-B" with local ID "null"
    When I remove each mandatory property from the payload
    And each mandatory-variation is POSTed to "/Encounter"
    Then each mandatory variation should fail with http 400 and OperationOutcome response containing issue.code equal to invalid

  Scenario: All mandatory Observation properties are enforced. This tests that all mandatory properties for the Observation resource are enforced. It uses the profile published in the IG to determine which properties are mandatory and then mkes a request to the API with a payload that is missing the mandatory parameter.
    Given the profile "https://fhir-ig.digital.health.nz/sdhr/StructureDefinition-SDHRObservation.json"
    Given a valid "Observation" payload for NHI "ZMW6602" at facility "F38006-B" with local ID "null"
    When I remove each mandatory property from the payload
    And each mandatory-variation is POSTed to "/Observation"
    Then each mandatory variation should fail with http 400 and OperationOutcome response containing issue.code equal to invalid

  Scenario: All Condition profile constraints are enforced
    Given the profile "https://fhir-ig-uat.digital.health.nz/sdhr/StructureDefinition-SDHRCondition.json"
    Given a valid "Condition" payload for NHI "ZMW6602" at facility "F38006-B" with local ID "null"
    When I create payload variations violating each constraint
    And each constraint variation is POSTed to "/Condition"
    Then each constraint variation should fail with OperationOutcome

  Scenario: All AllergyIntolerance profile constraints are enforced
    Given the profile "https://fhir-ig-uat.digital.health.nz/sdhr/StructureDefinition-SDHRAllergyIntolerance.json"
    Given a valid "AllergyIntolerance" payload for NHI "ZMW6602" at facility "F38006-B" with local ID "null"
    When I create payload variations violating each constraint
    And each constraint variation is POSTed to "/AllergyIntolerance"
    Then each constraint variation should fail with OperationOutcome

  Scenario: All Observation profile constraints are enforced
    Given the profile "https://fhir-ig-uat.digital.health.nz/sdhr/StructureDefinition-SDHRObservation.json"
    Given a valid "Observation" payload for NHI "ZMW6602" at facility "F38006-B" with local ID "null"
    When I create payload variations violating each constraint
    And each constraint variation is POSTed to "/Observation"
    Then each constraint variation should fail with OperationOutcome

  Scenario: All Encounter profile constraints are enforced
    Given the profile "https://fhir-ig-uat.digital.health.nz/sdhr/StructureDefinition-SDHREncounter.json"
    Given a valid "Encounter" payload for NHI "ZMW6602" at facility "F38006-B" with local ID "null"
    When I create payload variations violating each constraint
    And each constraint variation is POSTed to "/Encounter"
    Then each constraint variation should fail with OperationOutcome

  Scenario: All mandatory bindings are enforced for Condition resource
    Given the profile "https://fhir-ig-uat.digital.health.nz/sdhr/StructureDefinition-SDHRCondition.json"
    Given a valid "Condition" payload for NHI "ZMW6602" at facility "F38006-B" with local ID "null"
    When I create payload variations violating each required binding
    And each mandatory binding variation is POSTed to "/Condition"
    # Then each mandatory binding variation should fail with OperationOutcome

  Scenario: Valid batch request with mixed resources is accepted. This scenario will test that a valid batch request containing a mix of Condition, Observation, AllergyIntolerance and Encounter resources can be processed successfully.
    Given a batch bundle payload containing "Condition Observation AllergyIntolerance Encounter" resources is created for NHI "ZMW6602" at facility "F38006-B" with local ID "null"
    When the API Consumer requests a new client_credentials access token with scope "system/Condition.crus system/Observation.crus system/AllergyIntolerance.crus system/Encounter.crus"
    And a POST request is made to "/" with the payload
    Then the response status code should be 200
    And the response body should have property "resourceType" containing "Bundle"
    And the response body should have property "type" containing "batch-response"
    And each entry in the response body should have property "status" containing either "201 Created" or "200 OK"

