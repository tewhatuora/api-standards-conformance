@sdhr @nhi-linking
Feature: Linked NHI group access resolution
  # These scenarios cover linked-group evaluation rules that are distinct from the
  # existing deny/rehydrate flow in nhi-linking.feature. They use the same reserved
  # public fixtures and reset them via API at the start of each scenario.
  #
  # Each scenario opts both patients off at the facility at the end, which triggers
  # archival of their Condition records. This prevents data from accumulating across
  # repeated runs. Note: if a scenario fails mid-way the teardown won't execute;
  # the fixture reset at the start of the next scenario still ensures a clean
  # linking/participation state, though orphaned records may linger.

  Rule: Reads and writes evaluate the full linked group while applying target-specific restrictions

    Scenario: Reads through a dormant NHI return records from the full opted-in linked group
      Given the linking test fixture is reset via public API
      And patient "ZZZ0016" is eventually opted in at facility "F2N060-E"
      And patient "ZZZ0024" is eventually opted in at facility "F2N060-E"
      And active patient "ZZZ0016" is linked to dormant patient "ZZZ0024"
      And a valid "Condition" payload for NHI "ZZZ0016" at facility "F2N060-E" with local ID "nhi-linking-group-read-active"
      And the API Consumer requests a client_credentials access token
      When a POST request is made to "/Condition" with the payload
      Then the response status code should be 201
      Given a valid "Condition" payload for NHI "ZZZ0024" at facility "F2N060-E" with local ID "nhi-linking-group-read-dormant"
      When a POST request is repeatedly made to "/Condition" with the payload until the response status code is 201
      Then the response status code should be 201
      When a GET request is repeatedly made to "/Condition?patient=https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/ZZZ0016" until the response body contains string "nhi-linking-group-read-active"
      Then the response status code should be 200
      When a GET request is repeatedly made to "/Condition?patient=https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/ZZZ0024" until the response body contains string "nhi-linking-group-read-dormant"
      Then the response status code should be 200
      When a GET request is repeatedly made to "/Condition?patient=https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/ZZZ0024" until the response body contains string "nhi-linking-group-read-active"
      Then the response status code should be 200
      And the response body should have property "resourceType" containing "Bundle"
      And the response body should have property "type" containing "searchset"
      And the search response body should have entry with property "identifier[0].value" containing "nhi-linking-group-read-active"
      And the search response body should have entry with property "identifier[0].value" containing "nhi-linking-group-read-dormant"
      # Teardown: opt off to archive records
      Given patient "ZZZ0016" is opted out at facility "F2N060-E"
      And patient "ZZZ0024" is opted out at facility "F2N060-E"

    Scenario: A facility restriction on the dormant member yields a partial linked-group read
      Given the linking test fixture is reset via public API
      And patient "ZZZ0016" is eventually opted in at facility "F2N060-E"
      And patient "ZZZ0024" is eventually opted in at facility "F2N060-E"
      And active patient "ZZZ0016" is linked to dormant patient "ZZZ0024"
      And a valid "Condition" payload for NHI "ZZZ0016" at facility "F2N060-E" with local ID "nhi-linking-partial-read-active"
      And the API Consumer requests a client_credentials access token
      When a POST request is made to "/Condition" with the payload
      Then the response status code should be 201
      Given a valid "Condition" payload for NHI "ZZZ0024" at facility "F2N060-E" with local ID "nhi-linking-partial-read-dormant"
      When a POST request is made to "/Condition" with the payload
      Then the response status code should be 201
      When a GET request is repeatedly made to "/Condition?patient=https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/ZZZ0016" until the response body contains string "nhi-linking-partial-read-active"
      Then the response status code should be 200
      When a GET request is repeatedly made to "/Condition?patient=https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/ZZZ0024" until the response body contains string "nhi-linking-partial-read-dormant"
      Then the response status code should be 200
      Given patient "ZZZ0024" is opted out at facility "F2N060-E"
      When a GET request is repeatedly made to "/Condition?patient=https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/ZZZ0016" until the response body does not contain string "nhi-linking-partial-read-dormant"
      Then the response status code should be 200
      And the response body should have property "resourceType" containing "Bundle"
      And the response body should have property "type" containing "searchset"
      And the search response body should have entry with property "identifier[0].value" containing "nhi-linking-partial-read-active"
      And the search response body should not have any entry with property "identifier[0].value" containing "nhi-linking-partial-read-dormant"
      And the search response body should have entry with property "issue[0].details.coding[0].code" containing "sdhr-records-withheld-at-source"
      # Teardown: opt off to archive records (ZZZ0024 already opted out above)
      Given patient "ZZZ0016" is opted out at facility "F2N060-E"

    Scenario: Writes to the unrestricted active member succeed even when the dormant member is facility restricted
      Given the linking test fixture is reset via public API
      And patient "ZZZ0016" is eventually opted in at facility "F2N060-E"
      And patient "ZZZ0024" is eventually opted in at facility "F2N060-E"
      And active patient "ZZZ0016" is linked to dormant patient "ZZZ0024"
      And patient "ZZZ0024" is opted out at facility "F2N060-E"
      And a valid "Condition" payload for NHI "ZZZ0016" at facility "F2N060-E" with local ID "nhi-linking-target-write-active-allowed"
      And the API Consumer requests a client_credentials access token
      When a POST request is made to "/Condition" with the payload
      Then the response status code should be 201
      And the response body should have property "resourceType" containing "Condition"
      # Teardown: opt off to archive records (ZZZ0024 already opted out in setup)
      Given patient "ZZZ0016" is opted out at facility "F2N060-E"

    Scenario: Writes to the facility-restricted dormant member are blocked even when the active member is allowed
      Given the linking test fixture is reset via public API
      And patient "ZZZ0016" is eventually opted in at facility "F2N060-E"
      And patient "ZZZ0024" is eventually opted in at facility "F2N060-E"
      And active patient "ZZZ0016" is linked to dormant patient "ZZZ0024"
      And patient "ZZZ0024" is opted out at facility "F2N060-E"
      And a valid "Condition" payload for NHI "ZZZ0024" at facility "F2N060-E" with local ID "nhi-linking-target-write-dormant-denied"
      And the API Consumer requests a client_credentials access token
      Then repeated POST requests to "/Condition" with the payload should eventually return status 403 and outcome code "sdhr-participation-status-denied-facility"
      And the response body should have property "resourceType" containing "OperationOutcome"
      And the response body should have property "issue[0].details.coding[0].code" containing "sdhr-participation-status-denied-facility"
      # Teardown: opt off to archive records (ZZZ0024 already opted out in setup)
      Given patient "ZZZ0016" is opted out at facility "F2N060-E"
