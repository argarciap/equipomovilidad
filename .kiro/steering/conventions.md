<!--
  STEERING FILE: Development Conventions
  Inclusion: "always" — Kiro needs to know your stack and style for every interaction.

  TIPS:
  - Add libraries as you install them so Kiro uses the right imports
  - File references with #[[file:...]] pull live files into context
  - Multiple file references are supported
-->
---
inclusion: always
---

# Tech Stack

- Backend: Node.js 20+ / TypeScript
- Frontend: React 18+ / TypeScript
- Mobile: React Native / TypeScript
- IaC: Terraform
- Region: `eu-west-1`

## AWS Services

| Service | Purpose |
|---------|---------|
| API Gateway | REST API + Cognito authorizer |
| Lambda | Handlers |
| DynamoDB | Storage |
| Cognito | Auth broker (OneLogin federation) |
| S3 + CloudFront | Web hosting |

## API Contracts

<!-- Each service has its own OpenAPI spec. Kiro reads these automatically. -->
#[[file:attendance-service.yaml]]
#[[file:auth-service.yaml]]
#[[file:workforce-service.yaml]]

# Coding Style

- One Lambda handler per file
- Use `async/await`, never raw Promises
- Prefer named exports
- Use strict TypeScript (`strict: true` in tsconfig)

<!-- TODO: Add more as you establish them -->

# Testing

- Framework: Jest (or Vitest)
- Test files next to source: `handler.ts` → `handler.test.ts`
- Use `--silent` flag to reduce noise

<!-- TODO: Add patterns as you write your first tests -->
