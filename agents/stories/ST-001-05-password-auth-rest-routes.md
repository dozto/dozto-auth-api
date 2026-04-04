# ST-001-05 Password auth — RESTful route shape

## Metadata

- Story ID: `ST-001-05`
- Epic ID: `EP-001`
- Title: Password registration and sign-in — RESTful paths
- Status: `done`
- Created: 2026-04-04
- Updated: 2026-04-04

## Summary

Replace RPC-style paths (`/auth/password/...`, `/auth/password/phone/...`) with
resource-oriented routes:

- `POST /auth/users` — password-based registration (email or phone in JSON body)
- `POST /auth/sessions` — password-based sign-in (session creation)

## Follow-up to

- `ST-001-01`, `ST-001-02` (behavior unchanged; HTTP paths superseded)

## Acceptance Criteria

- `AC-01` `POST /auth/users` accepts `{ email, password }` or `{ phone, password }` and matches prior sign-up behavior.
- `AC-02` `POST /auth/sessions` accepts the same body shapes and matches prior sign-in behavior.
- `AC-03` Request bodies that mix `email` and `phone` are rejected with validation error.
