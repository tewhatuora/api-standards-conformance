@sdhr @fhir
Feature: FHIR Standards Capability Statement
  Scenario: Server supports all advertised searches
    # Note that the below search parameters have been defined to meet existing API requirements.
    # You can add additional search parameters as needed but do not remove any from this list.
    # If your API does not support all of the parameters listed below and this is reflected in your capability statement then the test will skip those parameters.
    Given the following search fixtures:
      | parameter         | value                                                                 |
      | patient           | https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/ZMW6100         |
      | clinical-status   | active                                                                |
      | category          | medication                                                            |
      | code              |                                                                123456 |
      | identifier        |                                                            1234567890 |
      | recorder          | https://api.hip.digital.health.nz/fhir/hpi/v1/Practitioner/1234567890 |
      | severity          | moderate                                                              |
      | _lastUpdated      |                                             2023-11-01T00:00:00+13:00 |
      | encounter         | https://api.uat.sdhr.digital.health.nz/s2s/Encounter/1234567890       |
      | onset-date        |                                             2023-11-01T00:00:00+13:00 |
      | subject           | https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/ZMW6100         |
      | location          | https://api.hip.digital.health.nz/fhir/hpi/v1/Location/F38006-D       |
      | status            | active                                                                |
      | date              |                                             2023-11-01T00:00:00+13:00 |
      | performer         | https://api.hip.digital.health.nz/fhir/hpi/v1/Practitioner/91ZZXN     |
      | value-concept     | https://api.hip.digital.health.nz/fhir/hpi/v1/Concept/1234567890      |
      | value-date        |                                             2023-11-01T00:00:00+13:00 |
      | value-quantity    |                                                                    10 |
      | value-string      | Test Value                                                            |
      | participant-actor | https://api.hip.digital.health.nz/fhir/hpi/v1/Practitioner/91ZZXN     |
      | participant       | https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/ZMW6100         |
      | participant-type  | practitioner                                                          |
    When the API Consumer requests a client_credentials access token
    And the FHIR CapabilityStatement is retrieved
    Then all CapabilityStatement search parameters should be testable
