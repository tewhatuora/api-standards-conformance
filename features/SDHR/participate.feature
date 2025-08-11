@sdhr
Feature: Participate operation

  Scenario: 1. Patient ZMW6001 opts out of SDHR participation using HNZ channel
    Given a patient "ZMW6001" notifies "HNZ" of participation "opt-off"
    Given the API Consumer requests a client_credentials access token with scope "https://fhir-ig.digital.health.nz/sdhr/OperationDefinition/SDHRHNZParticipateOperation"
    Then the API consumer invokes the "$hnz-participate" opertaion with:
      | patient | facilityId | participationIndicator | reasonCode       | reasonCodeDisplay | resourceType | localResourceId |
      | ZMW6001 | G00001-G   | false                  | null             | null              | null         | null            |
    Then the response status code should be 200
    And the response body should have property "resourceType" containing "OperationOutcome"
    And the response body should have property "issue[0].details.coding[0].code" containing "sdhr-operation-success"
    Given a valid Condition payload for NHI "ZMW6001" at facility "G00001-G" with local ID "null"
    And the API Consumer requests a new client_credentials access token with scope "system/Condition.crus"
    When a POST request is made to "/Condition" with the payload
    # Should not be able to create any resource for this patient
    Then the response status code should be 403
    And the response body should have property "resourceType" containing "OperationOutcome"
    And the response body should have property "issue[0].details.coding[0].code" containing "sdhr-participation-status-denied"
    # Should not be able to get any resource for this patient
    When a GET request is made to "/Condition?patient=https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/ZMW6001"
    Then the response status code should be 403
    And the response body should have property "resourceType" containing "OperationOutcome"
    And the response body should have property "issue[0].details.coding[0].code" containing "sdhr-participation-status-denied"

  Scenario: 2. Patient ZMW6002 opts out of SDHR participation at their enroled practice FZZ999-B
    Given a patient "ZMW6002" notifies "their facility FZZ999-B" of participation "opt-off"
    Given the API Consumer requests a client_credentials access token with scope "https://fhir-ig.digital.health.nz/sdhr/OperationDefinition/SDHRParticipateOperation"
    Then the API consumer invokes the "$participate" opertaion with:
      | patient | facilityId | participationIndicator | reasonCode       | reasonCodeDisplay | resourceType | localResourceId |
      | ZMW6003 | FZZ999-B   | false                  | null             | null              | null         | null            |
    Then the response status code should be 200
    And the response body should have property "resourceType" containing "OperationOutcome"
    And the response body should have property "issue[0].details.coding[0].code" containing "sdhr-operation-success"
    # Should not be able to create any resource for this patient
    And the API Consumer requests a new client_credentials access token with scope "system/Condition.crus"
    Given a valid Condition payload for NHI "ZMW6002" at facility "FZZ999-B" with local ID "null"
    When a POST request is made to "/Condition" with the payload
    Then the response status code should be 403
    And the response body should have property "resourceType" containing "OperationOutcome"
    And the response body should have property "issue[0].details.coding[0].code" containing "sdhr-participation-status-denied-facility"
    When a GET request is made to "/Condition?patient=https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/ZMW6002"
    Then the response status code should be 200
    And the response body should have property "resourceType" containing "Bundle"
    And the response body should have property "type" containing "searchset"
    #And the response bundle should contain more than 0 entries
    And the search response body should have entry with property "resourceType" containing "OperationOutcome"
    #And the search response body should have entry with property "issue[0].details.coding[0].code" containing "sdhr-participation-status-denied"

  Scenario: 3. Patient ZMW6001 opts in to SDHR participation using HNZ channel
    Given a patient "ZMW6001" notifies "HNZ" of participation "opt-in"
    Given the API Consumer requests a client_credentials access token with scope "https://fhir-ig.digital.health.nz/sdhr/OperationDefinition/SDHRHNZParticipateOperation"
    Then the API consumer invokes the "$hnz-participate" opertaion with:
      | patient | facilityId | participationIndicator | reasonCode       | reasonCodeDisplay | resourceType | localResourceId |
      | ZMW6001 | G00001-G   | true                   | null             | null              | null         | null            |
    Then the response status code should be 200
    And the response body should have property "resourceType" containing "OperationOutcome"
    And the response body should have property "issue[0].details.coding[0].code" containing "sdhr-operation-success"
    And the API Consumer requests a new client_credentials access token with scope "system/Condition.crus"
    Given a valid Condition payload for NHI "ZMW6001" at facility "FZZ999-Z" with local ID "null"
    When a POST request is made to "/Condition" with the payload
    Then the response status code should be 201
    And the response body should have property "resourceType" containing "Condition"
    When a GET request is made to "/Condition?patient=https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/ZMW6001"
    Then the response status code should be 200
    And the response body should have property "resourceType" containing "Bundle"
    And the response body should have property "type" containing "searchset"
    And the response bundle should contain more than 0 entries
    And the search response body should have entry with property "resourceType" containing "Condition"

  Scenario: 4. Patient ZMW6002 opts in to SDHR participation at their enroled practice FZZ999-B
    Given a patient "ZMW6002" notifies "their facility FZZ999-B" of participation "opt-in"
    Given the API Consumer requests a client_credentials access token with scope "https://fhir-ig.digital.health.nz/sdhr/OperationDefinition/SDHRParticipateOperation"
    Then the API consumer invokes the "$participate" opertaion with:
      | patient | facilityId | participationIndicator | reasonCode            | reasonCodeDisplay      | resourceType | localResourceId |
      | ZMW6002 | FZZ999-B   | true                   | null  | null        | null         | null            |
    Then the response status code should be 200
    And the response body should have property "resourceType" containing "OperationOutcome"
    And the response body should have property "issue[0].details.coding[0].code" containing "sdhr-operation-success"
    And the API Consumer requests a new client_credentials access token with scope "system/Condition.crus"
    Given a valid Condition payload for NHI "ZMW6002" at facility "FZZ999-B" with local ID "null"
    When a POST request is made to "/Condition" with the payload
    Then the response status code should be 201
    And the response body should have property "resourceType" containing "Condition"
    When a GET request is made to "/Condition?patient=https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/ZMW6002"
    Then the response status code should be 200
    And the response body should have property "resourceType" containing "Bundle"
    And the response body should have property "type" containing "searchset"
    And the response bundle should contain more than 0 entries

  Scenario: 5. Patient ZMW6003 opts in to SDHR participation at their enroled practice FZZ999-C then marks a record as withheld
    Given a patient "ZMW6003" notifies "their facility FZZ999-C" of participation "opt-in"
    Given the API Consumer requests a client_credentials access token with scope "https://fhir-ig.digital.health.nz/sdhr/OperationDefinition/SDHRParticipateOperation"
    Then the API consumer invokes the "$participate" opertaion with:
      | patient | facilityId | participationIndicator | reasonCode            | reasonCodeDisplay      | resourceType | localResourceId |
      | ZMW6003 | FZZ999-C   | true                   | null  | null        | null         | null            |
    Then the response status code should be 200
    And the response body should have property "resourceType" containing "OperationOutcome"
    And the response body should have property "issue[0].details.coding[0].code" containing "sdhr-operation-success"
    Given a valid Condition payload for NHI "ZMW6003" at facility "FZZ999-C" with local ID "FZZ999-C-local-withheld-record"
    And the API Consumer requests a new client_credentials access token with scope "system/Condition.crus"
    When a POST request is made to "/Condition" with the payload
    Then the response status code should be 201
    And the response body should have property "resourceType" containing "Condition"
    And the response body should have property "value" containing "FZZ999-C-local-withheld-record"
    When a GET request is made to "/Condition?patient=https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/ZMW6003"
    Then the response status code should be 200
    And the response body should have property "resourceType" containing "Bundle"
    And the response body should have property "type" containing "searchset"
    And the response bundle should contain more than 0 entries
    Given a health practitioner sets "Condition" record "FZZ999-C-local-withheld-record" record to "RESTRICTED"
    And the API Consumer requests a new client_credentials access token with scope "https://fhir-ig.digital.health.nz/sdhr/OperationDefinition/SDHRParticipateOperation"
    Then the API consumer invokes the "$participate" opertaion with:
      | patient          | facilityId       | participationIndicator | reasonCode           | reasonCodeDisplay | resourceType  | localResourceId                    |
      | ZMW6003          | FZZ999-C         | null                   | sdhr-record-withheld | Record withheld   | Condition     | FZZ999-C-local-withheld-record     |
    Then the response status code should be 200
    And the response body should have property "resourceType" containing "OperationOutcome"
    And the response body should have property "issue[0].details.coding[0].code" containing "sdhr-operation-success"
    Given the API Consumer requests a new client_credentials access token with scope "system/Condition.crus"
    When a GET request is made to "/Condition?patient=https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/ZMW6003&&_source=https://api.hip.digital.health.nz/fhir/Location/FZZ999-C&identifier=FZZ999-C-local-withheld-record"
    Then the response status code should be 200
    And the response body should have property "type" containing "searchset"
    And the response body should have property "resourceType" containing "Bundle"
    And the response body should have property "resourceType" containing "OperationOutcome"
    And the response body should have property "issue[0].details.coding[0].code" containing "sdhr-records-withheld-at-source"
    # Create and retrieve an unrestricted record
    Given a valid Condition payload for NHI "ZMW6003" at facility "FZZ999-C" with local ID "randomIdentifier"
    When a POST request is made to "/Condition" with the payload
    Then the response status code should be 201
    And the response body should have property "resourceType" containing "Condition"
    When a GET request is made to "/Condition?patient=https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/ZMW6001"
    Then the response status code should be 200
    And the response body should have property "resourceType" containing "Bundle"
    And the response body should have property "type" containing "searchset"
    And the response bundle should contain more than 0 entries

  Scenario: 6. Patient ZMW6004 opts in to SDHR participation at their enroled practice FZZ999-D and opts out at HNZ
    Given the API consumer invokes the "$hnz-participate" opertaion with:
    | patient | facilityId | participationIndicator | reasonCode       | reasonCodeDisplay | resourceType | localResourceId |
    | ZMW6004 | G00001-G   | true                  | null             | null              | null         | null            |
    Given a patient "ZMW6004" notifies "FZZ999-D" of participation "opt-in"
    Given the API Consumer requests a client_credentials access token with scope "https://fhir-ig.digital.health.nz/sdhr/OperationDefinition/SDHRParticipateOperation"
    Then the API consumer invokes the "$participate" opertaion with:
      | patient | facilityId | participationIndicator | reasonCode            | reasonCodeDisplay      | resourceType | localResourceId |
      | ZMW6004 | FZZ999-D   | true                   | null  | null        | null         | null            |
    Then the response status code should be 200
    And the response body should have property "resourceType" containing "OperationOutcome"
    And the response body should have property "issue[0].details.coding[0].code" containing "sdhr-operation-success"
    Given a valid Condition payload for NHI "ZMW6004" at facility "FZZ999-D" with local ID "null"
    And the API Consumer requests a new client_credentials access token with scope "system/Condition.crus"
    When a POST request is made to "/Condition" with the payload
    Then the response status code should be 201
    And the response body should have property "resourceType" containing "Condition"
    When a GET request is made to "/Condition?patient=https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/ZMW6004"
    Then the response status code should be 200
    And the response body should have property "resourceType" containing "Bundle"
    And the response body should have property "type" containing "searchset"
    And the response bundle should contain more than 0 entries
    Given a patient "ZMW6004" notifies "HNZ" of participation "opt-off"
    Given the API Consumer requests a new client_credentials access token with scope "https://fhir-ig.digital.health.nz/sdhr/OperationDefinition/SDHRHNZParticipateOperation"
    Then the API consumer invokes the "$hnz-participate" opertaion with:
      | patient | facilityId | participationIndicator | reasonCode       | reasonCodeDisplay | resourceType | localResourceId |
      | ZMW6004 | G00001-G   | false                  | null             | null              | null         | null            |
    Then the response status code should be 200
    And the response body should have property "resourceType" containing "OperationOutcome"
    And the response body should have property "issue[0].details.coding[0].code" containing "sdhr-operation-success"
    And the API Consumer requests a new client_credentials access token with scope "system/Condition.crus"
    When a GET request is made to "/Condition?patient=https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/ZMW6004"
    Then the response status code should be 403
    And the response body should have property "resourceType" containing "OperationOutcome"
    # Reverse the HNZ opt-out
    And the response body should have property "issue[0].details.coding[0].code" containing "sdhr-participation-status-denied"
        Then the API consumer invokes the "$hnz-participate" opertaion with:
      | patient | facilityId | participationIndicator | reasonCode       | reasonCodeDisplay | resourceType | localResourceId |
      | ZMW6004 | G00001-G   | true                  | null             | null              | null         | null            |

  Scenario: 7. Patient ZMW6002 opts out of SDHR participation at practice FZZ999-B and opts in at practice FZZ999-C
    Given a patient "ZMW6002" notifies "their facility FZZ999-B" of participation "opt-out"
    # Operation is idempotent so previous call in Scenario 2 should be all good however this is confirming
    Given the API Consumer requests a client_credentials access token with scope "https://fhir-ig.digital.health.nz/sdhr/OperationDefinition/SDHRParticipateOperation"
    Then the API consumer invokes the "$participate" opertaion with:
      | patient | facilityId | participationIndicator | reasonCode            | reasonCodeDisplay      | resourceType | localResourceId |
      | ZMW6002 | FZZ999-B   | true                   | null  | null        | null         | null            |
    Then the response status code should be 200
    And the response body should have property "resourceType" containing "OperationOutcome"
    And the response body should have property "issue[0].details.coding[0].code" containing "sdhr-operation-success"
    Given a patient "ZMW6002" notifies "their facility FZZ999-C" of participation "opt-in"
    Then the API consumer invokes the "$participate" opertaion with:
      | patient | facilityId | participationIndicator | reasonCode            | reasonCodeDisplay      | resourceType | localResourceId |
      | ZMW6002 | FZZ999-C   | false                  | null | null       | null         | null            |
    Then the response status code should be 200
    And the response body should have property "resourceType" containing "OperationOutcome"
    And the response body should have property "issue[0].details.coding[0].code" containing "sdhr-operation-success"
    Given a valid Condition payload for NHI "ZMW6002" at facility "FZZ999-C" with local ID "null"
    And the API Consumer requests a new client_credentials access token with scope "system/Condition.crus"
    When a POST request is made to "/Condition" with the payload
    Then the response status code should be 201
    And the response body should have property "resourceType" containing "Condition"
    When a GET request is made to "/Condition?patient=https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/ZMW6002"
    Then the response status code should be 200
    # Patient has opted out at FZZ999-B so should not be able to create a resource
    Given a valid Condition payload for NHI "ZMW6002" at facility "FZZ999-B" with local ID "null"
    When a POST request is made to "/Condition" with the payload
    Then the response status code should be 403
    And the response body should have property "resourceType" containing "OperationOutcome"
    And the response body should have property "issue[0].details.coding[0].code" containing "sdhr-participation-status-denied-facility"
    # Patient has a Condition resource at FZZ999-C so should be able to retrieve it
    # As the patient has opted out at FZZ999-B, the response should not contain any resources from that facility and should contain an OperationOutcome indicating withheld records
    When a GET request is made to "/Condition?patient=https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/ZMW6002"
    Then the response status code should be 200
    And the response body should have property "resourceType" containing "Bundle"
    And the response body should have property "type" containing "searchset"
    And the response bundle should contain more than 0 entries
    And the response body should have property "resourceType" containing "Condition"
    And the response body should have property "source" containing "https://api.hip.digital.health.nz/fhir/Location/FZZ999-C"
    And the response body should have property "resourceType" containing "OperationOutcome"
    And the response body should have property "issue[0].details.coding[0].code" containing "sdhr-records-withheld-at-source"
    # There should be no records for facility FZZ999-B
    And the response body should not have property "source" containing "https://api.hip.digital.health.nz/fhir/Location/FZZ999-B"

  Scenario: 8. Patients participation preferences are unknown
    Given a patient "ZMW6005" has not notified "FZZ999-C" of participation preferences
    Given a valid Condition payload for NHI "ZMW6005" at facility "FZZ999-C" with local ID "null"
    And the API Consumer requests a client_credentials access token with scope "system/Condition.crus"
    When a POST request is made to "/Condition" with the payload
    Then the response status code should be 403
    And the response body should have property "resourceType" containing "OperationOutcome"
    And the response body should have property "issue[0].details.coding[0].code" containing "sdhr-participation-unknown"
    When a GET request is made to "/Condition?patient=https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/ZMW6005"
    Then the response status code should be 403
    And the response body should have property "resourceType" containing "OperationOutcome"
    And the response body should have property "issue[0].details.coding[0].code" containing "sdhr-participation-unknown"

  Scenario: 9. Patients previously withheld record is released
    Given a patient "ZMW6003" notifies "their facility FZZ999-C" of participation "opt-in"
    Given the API Consumer requests a client_credentials access token with scope "https://fhir-ig.digital.health.nz/sdhr/OperationDefinition/SDHRParticipateOperation"
    Then the API consumer invokes the "$participate" opertaion with:
      | patient | facilityId | participationIndicator | reasonCode            | reasonCodeDisplay      | resourceType | localResourceId |
      | ZMW6003 | FZZ999-C   | true                   | null                  | null                   | null         | null            |
    Then the response status code should be 200
    And the response body should have property "resourceType" containing "OperationOutcome"
    And the response body should have property "issue[0].details.coding[0].code" containing "sdhr-operation-success"
    #Release a previously withheld record - see Scenario 5
    Given a health practitioner sets "Condition" record "FZZ999-C-local-withheld-record" record to "UNRESTRICTED"
    Then the API consumer invokes the "$participate" opertaion with:
      | patient          | facilityId       | participationIndicator | reasonCode           | reasonCodeDisplay | resourceType  | localResourceId                    |
      | ZMW6003          | FZZ999-C         | null                   | sdhr-record-released | Record released   | Condition     | FZZ999-C-local-withheld-record     |
    Then the response status code should be 200
    And the response body should have property "resourceType" containing "OperationOutcome"
    And the response body should have property "issue[0].details.coding[0].code" containing "sdhr-operation-success"
    Given the API Consumer requests a new client_credentials access token with scope "system/Condition.crus"
    When a GET request is made to "/Condition?patient=https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/ZMW6003&&_source=https://api.hip.digital.health.nz/fhir/Location/FZZ999-C&identifier=FZZ999-C-local-withheld-record"
    Then the response status code should be 200
    And the response body should have property "type" containing "searchset"
    And the response body should have property "resourceType" containing "Bundle"
    And the response body should have property "type" containing "searchset"
    And the response bundle should contain more than 0 entries


#   Scenario: Patient records denied due to HNZ opt out
#     Given a patient has opted out of SDHR participation via the HNZ channel
#     When an API consumer attempts to POST a "Condition" resource
#     Then the response status code should be 403
#     And the response should contain "resourceType": "OperationOutcome"
#     And the OperationOutcome should contain code "sdhr-participate-deny" and message "Patient has opted out of participating in the shared digital health record service."
#   Scenario: GET a single resource by ID is denied due to opt out
#     Given a patient has opted out of SDHR participation via the HNZ channel
#     When an API consumer requests a "/Condition/{id}" resource by ID from SDHR FHIR API
#     And the response should contain "resourceType": "OperationOutcome"
#     And the OperationOutcome should contain code "sdhr-participate-deny" and message "Patient has opted out of participating in the shared digital health record service."
#   Scenario: Create a resource is denied due to opt out
#     Given a patient has opted out of SDHR participation via the HNZ channel
#     When an API consumer attempts to create a "Condition" resource in SDHR FHIR API
#     And the response should contain "resourceType": "OperationOutcome"
#     And the OperationOutcome should contain code "sdhr-participate-deny" and message "Patient has opted out of participating in the shared digital health record service."
#   Scenario: Update a resource is denied due to opt out
#     Given a patient has opted out of SDHR participation
#     When an API consumer attempts to update "/Condition/{id}" resource in SDHR FHIR API
#     And the response should contain "resourceType": "OperationOutcome"
#     And the OperationOutcome should contain code "sdhr-participate-deny" and message "Patient has opted out of participating in the shared digital health record service."
#   Scenario: Patient opts in to SDHR participation using HNZ channel
#     Given a patient notifies Health NZ of opt in preference
#     And Health NZ prepares participation parameters
#     When Health NZ invokes the participate operation with:
#       | patient                | Patient ID (NHI)         |
#       | facilityId             | HNZ Facility ID (HPI)    |
#       | participationIndicator | true                     |
#     And the participation is written to SDHR FHIR Server
#     Then the response status code should be 200
#     And the response should contain "resourceType": "OperationOutcome"
#     And the OperationOutcome should contain code "sdhr-operation-success" and message "Patient participation status successfully recorded."
#   Scenario: Patient consultation is allowed after opting in
#     Given a patient has opted in to SDHR participation
#     When a health practitioner records patient data (e.g. Condition)
#     And PMS triggers a new condition event
#     Then SDHR FHIR API returns a 200 OK response
#     And the condition is available in the shared digital health record.
#   Scenario: GET a single resource by ID is allowed after opting in
#     Given a patient has opted in to SDHR participation
#     When PMS Orchestrator requests any resource by ID from SDHR FHIR API
#     Then SDHR FHIR API returns a 200 OK response
#     And the resource data is returned.
#   Scenario: Create a resource is allowed after opting in
#     Given a patient has opted in to SDHR participation
#     When PMS Orchestrator attempts to create a resource in SDHR FHIR API
#     Then SDHR FHIR API returns a 201 Created response
#     And the resource is created in the shared digital health record.
#   Scenario: Update a resource is allowed after opting in
#     Given a patient has opted in to SDHR participation
#     When PMS Orchestrator attempts to update a resource in SDHR FHIR API
#     Then SDHR FHIR API returns a 200 OK response
#     And the resource is updated in the shared digital health record.
#   # Scenario: Delete a resource is allowed after opting in
#   #   Given a patient has opted in to SDHR participation
#   #   When PMS Orchestrator attempts to delete a resource in SDHR FHIR API
#   #   Then SDHR FHIR API returns a 204 No Content response
#   #   And the resource is removed from the shared digital health record.
# Scenario: Patient opts in to SDHR participation via PMS
#     Given a patient consults with a health practitioner
#     And the practitioner records patient data (e.g. Condition) in PMS
#     And PMS triggers a new condition event
#     When PMS Orchestrator attempts to write the Condition to SDHR FHIR API
#     And SDHR FHIR API checks patient participation preferences
#     Then SDHR FHIR API returns an OperationOutcome with code "sdhr-participation-unknown" and message "The Shared Digital Health Record service has no record of participation preferences for this patient at this facility. Please use the $participate operation to indicate the patients participation preferences."
#     When PMS Orchestrator invokes the participate operation with:
#       | patient                | Patient ID (NHI)         |
#       | facilityId             | PMS Facility ID (HPI)    |
#       | participationIndicator | true                     |
#     Then the participation is written to SDHR FHIR Server
#     And PMS Orchestrator receives an OperationOutcome with code "sdhr-operation-success" and message "Patient participation status successfully recorded."
#     When PMS Orchestrator retries writing the Condition to SDHR FHIR API
#     Then SDHR FHIR API returns the created Condition resource
#   Scenario: Patient opts out of SDHR participation via PMS
#     Given a patient requests to opt out of SDHR participation
#     And the practitioner records the opt out request in PMS
#     And PMS triggers a patient event
#     When PMS Orchestrator invokes the participate operation with:
#       | patient                | Patient ID (NHI)         |
#       | facilityId             | PMS Facility ID (HPI)    |
#       | participationIndicator | false                    |
#     Then the participation is written to SDHR FHIR Server
#     And PMS Orchestrator receives an OperationOutcome confirming opt out
#   Scenario: Search for a resource returns redacted data due to opt out
#     Given a patient has opted out of SDHR participation
#     When PMS Orchestrator searches for resources in SDHR FHIR API
#     Then SDHR FHIR API returns a search result with redacted data and total matches
#   Scenario: GET a single resource by ID is forbidden due to opt out
#     Given a patient has opted out of SDHR participation
#     When PMS Orchestrator requests any resource by ID from SDHR FHIR API
#     Then SDHR FHIR API returns a 403 OperationOutcome with code "forbidden" and message "Access to the resource is forbidden due to patient participation preferences."
#   Scenario: Create a resource is forbidden due to opt out
#     Given a patient has opted out of SDHR participation
#     When PMS Orchestrator attempts to create a resource in SDHR FHIR API
#     Then SDHR FHIR API returns a 403 OperationOutcome with code "forbidden" and message "Resource creation is forbidden due to patient participation preferences."
#   Scenario: Patient elects to withhold records whilst participating in SDHR
#     Given a health practitioner sets a patient's record to RESTRICTED in PMS
#     And PMS triggers a resource event
#     When PMS Orchestrator prepares participation parameters for withholding the record
#     And PMS Orchestrator invokes the participate operation with:
#       | patient          | Patient ID (NHI)         |
#       | facilityId       | Facility ID (HPI)        |
#       | resourceType     | Resource Type (e.g. Condition) |
#       | localResourceId  | Local Resource ID        |
#       | reasonCode       | sdhr-record-withheld     |
#     Then the participation is written to SDHR FHIR Server
#     And if the resource exists in SDHR, PMS Orchestrator updates the resource with meta.security set to "Restricted"
#   Scenario: Search for a withheld record returns OperationOutcome
#     Given a patient has withheld records at source
#     When PMS Orchestrator searches for resources in SDHR FHIR API
#     Then SDHR FHIR API returns a search result with an OperationOutcome indicating "Patients has witheld records at source"
#   Scenario: Patient elects to unrestrict the record
#     Given a health practitioner sets a patient's record to UNRESTRICTED in PMS
#     And PMS triggers a resource event
#     When PMS Orchestrator retrieves resource details
#     And PMS Orchestrator searches for the resource by Patient, Facility and LocalID in SDHR FHIR API
#     Then SDHR FHIR API returns a search result with an OperationOutcome indicating "Patients has witheld records at source"
#     When PMS Orchestrator prepares participation parameters for releasing the record
#     And PMS Orchestrator invokes the participate operation with:
#       | patient          | Patient ID (NHI)         |
#       | facilityId       | Facility ID (HPI)        |
#       | resourceType     | Resource Type (e.g. Condition) |
#       | localResourceId  | Local Resource ID        |
#       | reasonCode       | sdhr-record-released     |
#     Then the participation is written to SDHR FHIR Server
#     And PMS Orchestrator creates the resource in SDHR FHIR API
#     And SDHR FHIR API returns the created resource
