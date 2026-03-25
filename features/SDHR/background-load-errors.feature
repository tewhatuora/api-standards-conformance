@sdhr
Feature: Background load errors
  # This feature proves that a failed historic load is no longer indistinguishable
  # from a long-running load. We intentionally use a generated invalid NHI so the
  # PMS lookup fails and the API can surface the explicit error state.

  Rule: Failed historic loads surface a distinct API outcome

    Scenario: Failed historic loads return a distinct background load error
      Given a unique invalid NHI is prepared for this scenario
      And a historic load failure is triggered for the generated invalid NHI at facility "F38006-D"
      And the API Consumer requests a client_credentials access token
      Then the generated invalid NHI should eventually return the background load error for facility "F38006-D"
      And the response status code should be 409
      And the response body should have property "issue[0].details.coding[0].code" containing "sdhr-patient-background-load-error"
