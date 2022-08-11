# Pull Request Reviews

How to review a Pull Request in this repository.

## Principes

- The purposes of a review are:
    - sharing knowledge
    - ensuring a good maintenance
    - detecting defects
- Provide constructive feedbacks.
- Ask for a chat, a screensharing or face-to-face conversation when it can speed up the understanding of the change or the decisions on alternative designs. Then sum up in the Pull Request comments when relevant.
- The verification described in this document contains both guidelines and rules. In case of guidelines, when there is no consensus between a reviewer and the submitter, the reviewer must ask to a(nother) maintainer to decide if the requested change is mandatory for merging or not.
- This document isn't immutable but isn't updated with a high frequency. It can be refined retrospectively after one or a set of Pull Requests.

### Verifications

Verify that:
- The Pull Request is dedicated to one small concern. The concern must be explicit in the title and the description of the Pull Request.
- The Pull Request is small. There is no hard limit but a Pull Request should not exceed 500 lines of code (excluding configurations and generated code).[1] As a reviewer, you must ask submitter to break out the PR if the amount of code coupled with its complexity is an impediment to achieving the purposes of a review.
- The (new or changed) production code has its test counterpart. Use the test pyramid as a guideline [2]:
    - **Unit-tests and Integration Tests via `Jest`**: The targeted code coverage is 80% on new or changed code. To estimate this coverage at *change level*, you can run `npm run coverage` *which measures the coverage at file level*.
    - **UI Tests via `Cypress`**: A large feature that includes UI should have *few* UI tests for covering the nominal cases. Estimate if those tests can be flaky (e.g network is not mocked, wait and timers API in test, bypass Cypress API, production code with a not testable design). If so, you must ask for change.
- The Pull Request doesn't add warning or error from the linter.
- The Pull Request respects existing dependencies between components unless it is clearly stated in the description of the Pull Request with an acceptable rational.
- The Pull Request doesn't add unecessary external dependencies.

### References

- [1] [Quality of deliveries is directly related to size of the Pull Request.](https://www.linkedin.com/pulse/size-pullmerge-request-more-important-than-you-think-rodrigo-miguel)
- [2] [Test pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)

