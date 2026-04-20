@sdhr @nhi-linking @not-implemented
Feature: Linked NHI lifecycle and lock observability
  # These scenarios capture business rules that are not currently observable
  # through the public SDHR API alone. They need either:
  # - controllable test fixtures that can force patient/facility lock states, or
  # - internal assertions over archive/hydration state and persisted consent.

  Rule: Restriction changes trigger lifecycle side effects without rewriting consent semantics

    Scenario: Global opt-out on one linked member archives the full group without rewriting other member consent
      Given an opted-in linked NHI group with one active patient and one dormant patient
      When a global opt-out event is applied to the active patient
      Then the full linked group is treated as denied
      And archive is triggered for records across the full linked group
      And the dormant member's explicit participation record remains unchanged
      And the outcome code is "sdhr-operation-success"

    Scenario: Global opt-in rehydrates the linked group but does not override facility restrictions
      Given a linked NHI group that is globally opted out
      And the dormant member remains facility restricted at a specific facility
      When a global opt-in event is applied across the linked group
      Then hydration is triggered for the linked group
      And records from unrestricted sources become available again
      And records from the still-restricted facility remain withheld
      And the outcome code is "sdhr-operation-success"

  Rule: Linked-group reads distinguish patient locks from facility locks

    Scenario: A patient-level rehydrate lock denies reads for the full linked group
      Given a linked NHI group with a patient-level rehydrate lock in progress
      When a read request is made for any member of the linked group
      Then the request is denied
      And no records are returned
      And the outcome code is "sdhr-patient-locked"

    Scenario: A facility-level rehydrate lock returns a partial linked-group read
      Given a linked NHI group with a facility-level rehydrate lock in progress for one member and one facility
      When a read request is made for another member of the linked group
      Then the response is partial
      And available records from unrestricted members and facilities are returned
      And records from the locked facility are withheld
      And the outcome code is "sdhr-operation-success"

  Rule: Dormant-NHI resolution metadata is explicit when the dormant identifier is used

    Scenario: Reads using a dormant NHI expose the active-NHI resolution
      Given a fully opted-in linked NHI group with an active patient and a dormant patient
      When a read request is made using the dormant patient's NHI
      Then records from the linked group are returned
      And the response identifies that a dormant NHI was resolved to the active NHI
      And the outcome code is "sdhr-operation-success"
