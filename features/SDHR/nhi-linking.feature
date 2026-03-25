@sdhr @nhi-linking
Feature: NHI linking
  # These scenarios use known-good dev NHIs and facility IDs only.
  # They are intentionally stateful and must be run serially in file order.
  # We only use public API calls, so scenario 1 establishes the baseline and the
  # later scenarios continue from that shared external state.

  Rule: Linked NHI rules over a stateful public-API flow

    # Establish a clean baseline and prove the happy path:
    # fully opted-in linked groups allow writes to the target NHI.
    Scenario: 1. Fully opted-in linked pairs allow writes
      Given the linking test fixture is reset via public API
      And patient "ZZZ0016" is eventually opted in at facility "F2N060-E"
      And active patient "ZZZ0016" is linked to dormant patient "ZZZ0024"
      And a valid "Condition" payload for NHI "ZZZ0016" at facility "F2N060-E" with local ID "nhi-linking-write-allow-0016"
      And the API Consumer requests a client_credentials access token
      When a POST request is made to "/Condition" with the payload
      Then the response status code should be 201

    # Unlinking a fully opted-in pair should not cause a rehydrate lock.
    Scenario: 2. Unlinking a fully opted-in pair does not trigger rehydrate
      Given active patient "ZZZ0016" is unlinked from dormant patient "ZZZ0024"
      And a valid "Condition" payload for NHI "ZZZ0016" at facility "F2N060-E" with local ID "nhi-linking-unlink-no-rehydrate"
      And the API Consumer requests a client_credentials access token
      When a POST request is made to "/Condition" with the payload
      Then the response status code should be 201

    # Linking an opted-out singleton into an already opted-in pair archives the
    # whole expanded group.
    Scenario: 3. Linking an opted-out singleton denies the expanded group
      Given active patient "ZZZ0016" is linked to dormant patient "ZZZ0024"
      And patient "ZZZ0032" is globally opted out
      And active patient "ZZZ0016" is linked to dormant patient "ZZZ0032"
      And the API Consumer requests a client_credentials access token
      When a GET request is made to "/Condition?patient=https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/ZZZ0024"
      Then the response status code should be 403
      And the response body should have property "issue[0].details.coding[0].code" containing "sdhr-participation-status-denied"

    # Once the expanded group contains a globally opted-out NHI, reads through
    # any other member are denied.
    Scenario: 4. Reads through a denied linked group are blocked
      Given the API Consumer requests a client_credentials access token
      When a GET request is made to "/Condition?patient=https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/ZZZ0024"
      Then the response status code should be 403
      And the response body should have property "issue[0].details.coding[0].code" containing "sdhr-participation-status-denied"

    # Writes are also denied for other members while the group is under the
    # most-restrictive global rule.
    Scenario: 5. Writes through a denied linked group are blocked
      Given a valid "Condition" payload for NHI "ZZZ0016" at facility "F2N060-E" with local ID "nhi-linking-write-denied-by-group"
      And the API Consumer requests a client_credentials access token
      When a POST request is repeatedly made to "/Condition" with the payload until the response body has property "issue[0].details.coding[0].code" containing "sdhr-participation-status-denied"
      Then the response status code should be 403
      And the response body should have property "issue[0].details.coding[0].code" containing "sdhr-participation-status-denied"

    # Unlinking a subgroup out of a denied group should rehydrate that subgroup,
    # so writes stay blocked while the historic load is in progress.
    Scenario: 6. Unlinking from a denied group triggers rehydrate for the released subgroup
      Given active patient "ZZZ0016" is unlinked from dormant patient "ZZZ0032"
      And a valid "Condition" payload for NHI "ZZZ0016" at facility "F2N060-E" with local ID "nhi-linking-unlink-restored"
      And the API Consumer requests a client_credentials access token
      When a POST request is repeatedly made to "/Condition" with the payload until the response body has property "issue[0].details.coding[0].code" containing "sdhr-patient-locked"
      Then the response status code should be 403
      And the response body should have property "issue[0].details.coding[0].code" containing "sdhr-patient-locked"
      And the API Consumer requests a client_credentials access token
      When a GET request is made to "/Condition?patient=https://api.hip.digital.health.nz/fhir/nhi/v1/Patient/ZZZ0032"
      Then the response status code should be 403
      And the response body should have property "issue[0].details.coding[0].code" containing "sdhr-participation-status-denied"
