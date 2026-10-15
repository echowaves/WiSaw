# Tasks

## 1. Durable Video Staging

- [x] 1.1 Persist the staged video path in the queue immediately after staging and before thumbnail generation or backend photo creation; propagate queue-persistence failures so remote work does not continue. Verify with a service test that persistence precedes `createPhoto` and a failed queue write prevents the mutation.
- [x] 1.2 Recover a video from its deterministic staged path when the original path is missing, regenerate and persist a missing thumbnail, and classify the item as missing only when neither path exists. Verify with queue tests for recovery after a move-before-save interruption and for the genuinely missing-file case.

## 2. Retry and Regression Coverage

- [x] 2.1 Add a regression test for photo creation timing out after the server has created an inactive record; verify the retry reuses the existing record and resumes video upload from the staged file.
- [x] 2.2 Run the focused upload-service and queue-orchestration test suites and verify all video recovery scenarios pass without regressing image upload behavior.
