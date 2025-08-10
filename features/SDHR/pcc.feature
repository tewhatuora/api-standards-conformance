Feature: SDHR Participation Consent

  # Background:
  #   Given the FHIR server is running
  #   And the FHIR server supports the Condition resource
  #   And the FHIR server supports the Consent resource
  #   And the Authorisation server supports the SDHR read scopes

  #Scenario 1: the patient elects to participate in SDHR.
  Scenario: Participation in SDHR
    Given a health sector user "ZMW6001" elects to participate in sdhr
    Given a standard Condition resource for NHI "ZMW6001" exists
    Given the API Consumer requests a client_credentials access token
    When a GET request is made to "/Condition?patient=https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/ZMW6001"
    Then the response status code should be 200
    And the response bundle should contain more than 0 entries
    And the response body should have property "type" containing "searchset"
    # And the response payload contains the JSON property total with a value of >0
    # And the response payload conforms to the Condition schema

  #Scenario 2: the patient elects to opt out of SDHR participation. They do this through the HNZ assisted channel prior to any data being sourced from primary care.
  Scenario: Consumer chooses not to participate in SDHR using HNZ assisted channel before any resources exist in SDHR
    Given a health sector user "ZMW6002" elects not to participate in sdhr
    # Then a Consent resource should be created
    # And the Consent resource conforms to the Consent schema
    # And the Consent resource contains the JSON property provision.type with a value of "deny"
    # And the Consent resource contains the JSON property status with a value of "active"
    # And the Consent resource contains the JSON property subject.reference with a value of "ZMW6002"
    Given the API Consumer requests a client_credentials access token
    When a GET request is made to "/Condition?patient=https://api.hip.digital.health.nz/fhir/nhi/v1Patient/ZMW6002"
    Then the response status code should be 200
    And the response bundle should contain 0 entries
    And the response body should have property "type" containing "searchset"
    # And the response payload conforms to the Condition schema

  #Scenario 3: the patient elects to opt out of SDHR participation. They do this through the HNZ assisted channel after resources have been sourced from primary care.
  Scenario: Consumer chooses not to participate in SDHR after resources already exist in SDHR
    Given a health sector user "ZMW6003" elects to participate in sdhr
    Given a standard Condition resource for NHI "ZMW6003" exists
    When a GET request is made to "/Condition?patient=https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/ZMW6003"
    Then the response status code should be 200
    And the response bundle should contain more than 0 entries
    Given a health sector user "ZMW6003" elects not to participate in sdhr
    When a GET request is made to "/Condition?patient=https://api.hip.digital.health.nz/fhir/nhi/v1Patient/ZMW6003"
    Then the response status code should be 200
    And the response bundle should contain 0 entries

  #Scenario 4: the patient elects to opt out of SDHR participation after resources are sourced, they then elect to opt back in
  Scenario: Consumer chooses to participate in SDHR using HNZ assisted channel after previously opting out
    Given a health sector user "ZMW6004" elects not to participate in sdhr
    Given a standard Condition resource for NHI "ZMW6004" exists
    Given the API Consumer requests a client_credentials access token
    When a GET request is made to "/Condition?patient=https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/ZMW6004"
    Then the response status code should be 200
    And the response bundle should contain more than 0 entries
    Given a health sector user "ZMW6004" elects not to participate in sdhr
    When a GET request is made to "/Condition?patient=https://api.hip.digital.health.nz/fhir/nhi/v1Patient/ZMW6004"
    Then the response status code should be 200
    And the response bundle should contain 0 entries

  #Scenario 5: consumer makes a choice not to participate by contacting their practice directly, rather than through the HNZ assisted channel.
  Scenario: Consumer chooses not to participate in  SDHR by contacting their practice
    Given a health sector user "ZMW6005" elects not to participate in sdhr by contacting their practice
    # Then a Consent resource would not be created as there is currently no mechanism for the practice to report this action to HNZ
    # This will likely change when we build a custom operation that allows practices to report this action to HNZ
    Given a standard Condition resource for NHI "ZMW6005" exists
    Given the API Consumer requests a client_credentials access token
    When a GET request is made to "/Condition?patient=https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/ZMW6005"
    Then the response status code should be 200
    And the response bundle should contain more than 0 entries