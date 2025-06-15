@sdhr
Feature: Confidentiality filtering for FHIR Condition resources
  Scenario: A resource without confidentiality tags is accessible
    Given a Condition resource for NHI "ZMW0002" with no meta.security tags exists
    And the API Consumer requests a client_credentials access token
    When a GET request is made to "/Condition?subject=https://api.hip.digital.health.nz/fhir/Patient/ZMW0002"
    Then the response status code should be 200
    And the response bundle should contain 1 entry

  Scenario: A resource with an unknown confidentiality tag is accessible
    Given a Condition resource for NHI "ZMW0002" with meta.security tag { "system": "http://example.com/unknown", "code": "X" } exists
    And the API Consumer requests a client_credentials access token
    When a GET request is made to "/Condition?subject=https://api.hip.digital.health.nz/fhir/Patient/ZMW0002"
    Then the response status code should be 200
    And the response bundle should contain 1 entry

  Scenario: A resource with confidentiality tag "R" is filtered out in search
    Given a Condition resource for NHI "ZMW0002" with meta.security tag { "system": "http://terminology.hl7.org/CodeSystem/v3-Confidentiality", "code": "R" } exists
    And the API Consumer requests a client_credentials access token
    When a GET request is made to "/Condition?subject=https://api.hip.digital.health.nz/fhir/Patient/ZMW0002"
    Then the response status code should be 200
    And the response bundle should contain 0 entries
    And the response bundle should include a meta.security tag { "code": "REDACTED", "system": "http://terminology.hl7.org/CodeSystem/v3-ObservationValue" }

  Scenario: A direct read of a confidential resource is forbidden
    Given a Condition resource for NHI "ZMW0002" with meta.security tag { "system": "http://terminology.hl7.org/CodeSystem/v3-Confidentiality", "code": "V" } exists
    And the API Consumer requests a client_credentials access token
    When a GET request is made to "/Condition/63e3c5c7-c938-4cf8-8815-900fc5781d8e"
    Then the response status code should be 403
    And the OperationOutcome should contain the message "Resource access is forbidden"