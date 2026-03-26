<!--
  STEERING FILE: Mock Strategy
  Inclusion: "auto" — loaded when working on mocks, stubs, or testing against dependencies.

  Teams have cross-dependencies but need to work in parallel.
  This file defines the mock strategy so every team can develop
  independently from day one.
-->
---
inclusion: auto
name: mocks
description: Use when creating mocks, stubs, or working around dependencies on other teams' services.
---

# Mock Strategy

All teams share the same test fixtures in `mock-data.json`. Use consistent IDs across mocks so integration is seamless when real services come online.

#[[file:mock-data.json]]

## Who Mocks What

| Team | Needs from | How to mock it |
|------|-----------|---------------|
| 1 (Attendance) | Team 2 auth middleware | Hardcode test user in handler (bypass JWT) |
| 1 (Attendance) | Team 5 worker/team IDs | Use IDs from mock-data.json directly |
| 3 (Web) | Team 1 attendance API | Local mock server or hardcoded responses |
| 3 (Web) | Team 2 auth | Skip Cognito, hardcode user in React context |
| 4 (Mobile) | Team 1 attendance API | Local mock server or hardcoded responses |
| 4 (Mobile) | Team 2 auth | Skip Cognito, hardcode user in app state |
| 5 (Workforce) | Team 2 auth middleware | Hardcode test user in handler (bypass JWT) |
| 2 (Auth) | Nothing | No dependencies — build first, share early |

## Mock Auth Middleware

Until Team 2 delivers the real Lambda layer, all backend teams use this:

```typescript
// mock-auth.ts — drop-in replacement for /opt/auth during development
import { APIGatewayProxyEvent } from "aws-lambda";

const MOCK_USERS: Record<string, any> = {
  "trabajador": {
    userId: "d1b2c3d4-0004-0004-0004-000000000001",
    email: "trabajador@acciona.com",
    name: "Pedro Fernández",
    role: "TRABAJADOR",
  },
  "encargado": {
    userId: "a1b2c3d4-0001-0001-0001-000000000003",
    email: "encargado@acciona.com",
    name: "Miguel López",
    role: "ENCARGADO",
  },
};

export function extractUser(event: APIGatewayProxyEvent) {
  // In dev: use x-mock-role header to switch roles, default to trabajador
  const mockRole = event.headers["x-mock-role"] || "trabajador";
  return MOCK_USERS[mockRole] || MOCK_USERS["trabajador"];
}

export function requireRole(user: any, ...roles: string[]) {
  if (!roles.includes(user.role)) {
    throw { statusCode: 403, code: "FORBIDDEN", message: `Requires: ${roles.join(", ")}` };
  }
}
```

Switch roles during development with a header: `x-mock-role: encargado`

## Mock API for Frontend Teams

Frontend teams (3, 4) can generate a mock server from the OpenAPI specs:

```bash
# Option 1: Prism mock server (auto-generates responses from schema)
npx @stoplight/prism-cli mock attendance-service.yaml -p 4010

# Option 2: Ask Kiro
# "Generate a mock Express server for attendance-service.yaml using mock-data.json"
```

## Kiro Prompts for Generating Mocks

**Team 1 / Team 5 (backend):**
> "Generate a mock auth middleware that reads x-mock-role header to simulate different user roles. Use the test users from mock-data.json."

**Team 3 (web):**
> "Generate a React context provider that mocks the auth state with a test user from mock-data.json, bypassing Cognito during development."

**Team 4 (mobile):**
> "Generate a mock API client for attendance-service.yaml that returns realistic test data from mock-data.json instead of making real HTTP calls."

**Team 2 (auth) — help others early:**
> "Generate a standalone mock Lambda layer package for the auth middleware so other teams can install it before the real one is ready."

## Switching from Mock to Real

When a dependency becomes available:

1/ Backend teams: Replace `import from "./mock-auth"` with `import from "/opt/auth"`
2/ Frontend teams: Remove mock provider, configure real Cognito + API URL
3/ All: Remove `x-mock-role` header usage

## Auth Fallback: OneLogin Unavailable

If OneLogin is not available on hackathon day, Team 2 switches Cognito to local user mode.

**What Team 2 does:**
- Enable self-signup or pre-create users in Cognito User Pool directly
- Users log in with username/password on Cognito Hosted UI (no redirect to OneLogin)
- JWT tokens are still issued by Cognito — everything downstream works unchanged

**What other teams do:**
- Nothing. The JWT flow, API Gateway authorizer, and token claims are identical regardless of whether the user logged in via OneLogin or Cognito local.

**Kiro prompt for Team 2:**
> "Update the Cognito Terraform config to support local user pool authentication as fallback. Add a variable to toggle between OneLogin federation and local users. Pre-create test users from mock-data.json in the user pool."
