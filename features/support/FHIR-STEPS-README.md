# FHIR Cucumber Step Definitions

The file [fhir.steps.js](./features/support/fhir.steps.js] contains Cucumber.js steps that can be used in 

The steps are implemented in `features/support/fhir.steps.js`.

---

## 📌 Available Steps

### 🔹 Response Assertions
- **`Then the response status code should be {int}`**  
  Verifies that the HTTP response status matches the expected integer.
  e.g. `Then the response status code should be 200`

- **`Then the FHIR response body should contain {string} {string}`**  
  Asserts that the given key in the JSON response body matches the expected value.
  e.g. `Then the FHIR response body should contain "resourceType" "Condition"`

- **`Then the response headers contain {string} key`**  
  Ensures the specified header exists in the response.
  e.g. `Then the response headers contain "Content-Type" key`


- **`Then the response header {string} should equal {string}`**  
  Validates that a header value equals the expected string.
  e.g. `Then the response header "Content-Type" should equal "application/json"`

- **`Then the response body should have property {string} containing {string}`**  
  Uses JSONPath to check that a property exists and contains the expected value.
  Note that this supports nested properties
  e.g. `Then the response body should have property "issue[0].details.coding[0].code" containing "sdhr-operation-success"`

- **`Then the search response body should have entry with property {string} containing {string}`**  
  Confirms at least one FHIR `searchset` bundle entry has a resource property matching the expected value.
  e.g. `Then the search response body should have entry with property "resourceType" containing "OperationOutcome"`

- **`Then the search response body should not have any entry with property {string} containing {string}`**  
  Similar to the above but in this case the step is confirming that a JSON property DOES NOT exist in a `searchset` Bundle.
  e.g. `Then the search response body should not have any entry with property "resourceType" containing "OperationOutcome"`

- **`Then the response body should have property {string}`**  
  Checks that the response body has the given property (using JSONPath).
  e.g. `Then the response body should have property "clinicalStatus"`

- **`Then the API Consumer saves the response id`**  
  Saves the `id` from the last response for use in later steps such as PUT requests
  e.g. `Then the API Consumer saves the response id`

- **`Then the response body should have property id containing the saved ID`**  
  Verifies that the resource `id` matches a previously saved ID.
  e.g. `Then the response body should have property id containing the saved ID`

---

### 🔹 HTTP Requests
- **`When a GET request is made to {string}`**  
  Performs a GET request to the given URL.
  e.g. `When a GET request is made to "/Condition"`

- **`When a GET request is made to {string} with the response body ID`**  
  Performs a GET request to `{url}/{id}`, where `id` is extracted from the last response body. For example, when a POST request is made to create a resource and the ID is saved from the POST response
  e.g. `When a GET request is made to "/Condition" with the response body ID`

- **`When a GET request is made to the FHIR API`**  
  Performs a GET request to the configured FHIR API base path.

- **`When a {string} request to {string} is made`**  
  Sends an HTTP request using the given method (e.g., GET, POST, PUT, DELETE) to the URL.

- **`When a {string} request is made to the FHIR API`**  
  Sends an HTTP request with the given method to the configured FHIR API base path.

- **`When a POST request is made to {string} with the payload`**  
  Performs a POST request with the stored payload.
  e.g. `When a POST request is made to "/Condition" with the payload`


- **`When a PUT request is made to {string} with the saved ID and the payload`**  
  Performs a PUT request to `{url}/{savedId}` with the stored payload.
  e.g. `When a PUT request is made to "/Condition" with the saved ID and the payload`

---

### 🔹 Payload & Response Manipulation
- **`Given the property {string} is set to {string}`**  
  Updates the current payload by setting a root or nested property to the given value.
  e.g. `Given the property "clinicalStatus.coding[0].code" is set to "active"`

- **`When the response body is updated with:`**  
  Accepts a Cucumber data table with `propertyName` and `value` columns and applies updates to the response body.  
  Example: In this example both properties would be updated with the specified value
  ```gherkin
  When the response body is updated with:
    | propertyName                     | value     |
    | clinicalStatus.coding[0].code    | active    |
    | verificationStatus.coding[0].code| confirmed |
  ```

---

### 🔹 Authentication & Headers
- **`Then the request header {string} contains a bearer token`**  
  Validates that the request contains a Bearer token in the Authorization header.

- **`Then the token expiry time should be less than {int} seconds`**  
  Ensures the OAuth token expiry time is within the given threshold.

- **`Given the request header {string} is empty`**  
  Removes the specified request header.

- **`Given the request header {string} set to {string}`**  
  Sets a request header with the given name and value.

- **`Given the request header {string} not set`**  
  Ensures the specified header is not set.

- **`Given the API Consumer requests a client_credentials access token`**  
  Retrieves and sets a default client_credentials OAuth token.

- **`Given the API Consumer requests a client_credentials access token with scope {string}`**  
  Retrieves and sets a client_credentials OAuth token with the given scope.

- **`Given the API Consumer requests a new client_credentials access token with scope {string}`**  
  Forces retrieval of a new OAuth token with the given scope.

---

## 🛠 Usage Example

```gherkin
Scenario: Update condition status
  Given the API Consumer requests a client_credentials access token
  When a GET request is made to "/Condition/123"
  Then the response status code should be 200
  When the response body is updated with:
    | propertyName                  | value  |
    | clinicalStatus.coding[0].code | active |
  When a PUT request is made to "/Condition" with the saved ID and the payload
  Then the response status code should be 200
```

See [Features](./features) for more examples


