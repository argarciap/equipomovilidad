<!--
  STEERING FILE: API & Data Model
  Inclusion: "auto" — loaded when working on endpoints, handlers, or database operations.

  TIPS:
  - Add error codes as you define them
  - Add DynamoDB access patterns as you discover them
-->
---
inclusion: auto
name: api-and-data
description: Use when creating or modifying API endpoints, Lambda handlers, or database operations.
---

# API Conventions

## Handler Pattern

```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const claims = event.requestContext.authorizer?.claims;
    if (!claims) return { statusCode: 401, body: JSON.stringify({ code: "UNAUTHORIZED", message: "No auth claims" }) };
    // ...
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (err: any) {
    return {
      statusCode: err.statusCode || 500,
      body: JSON.stringify({ code: err.code || "INTERNAL_ERROR", message: err.message }),
    };
  }
}
```

## Error Format

Matches customer schema — always include `code`, `message`, optional `details` array:

```json
{
  "code": "ALREADY_CLOCKED_IN",
  "message": "Ya existe una entrada abierta sin salida",
  "details": [{ "field": "worker_id", "message": "Worker has open record" }]
}
```

## Pagination

All list endpoints use offset-based pagination:

```typescript
// Query params: page (default 0), size (default 20, max 100)
// Response wrapper:
{ content: [...], page: 0, size: 20, total_elements: 150, total_pages: 8 }
```

# Data Model

## Attendance Records Table

| Attribute | Key | Example |
|-----------|-----|---------|
| `PK` | Partition | `WORKER#<uuid>` |
| `SK` | Sort | `RECORD#<date>#<uuid>` |
| `GSI1PK` | GSI1 Partition | `TEAM#<uuid>` |
| `GSI1SK` | GSI1 Sort | `RECORD#<date>#<uuid>` |
| `status` | — | `OPEN` / `CLOSED` / `INCIDENT` |
| `clock_in_method` | — | `QR` / `NFC` / `MANUAL` / `GPS` |

## Incidents Table

| Attribute | Key | Example |
|-----------|-----|---------|
| `PK` | Partition | `WORKER#<uuid>` |
| `SK` | Sort | `INCIDENT#<date>#<uuid>` |
| `type` | — | `OLVIDO_ENTRADA` / `OLVIDO_SALIDA` / `CORRECCION_HORA` / `FICHAJE_DUPLICADO` / `OTRO` |
| `status` | — | `PENDING` / `RESOLVED` / `REJECTED` |

## Key Access Patterns

| I need to... | How |
|-------------|-----|
| Get worker records by date range | `PK = WORKER#<id>`, SK between dates |
| Check if worker has open record | `PK = WORKER#<id>`, status = OPEN filter |
| Get team records (supervisor) | GSI1: `GSI1PK = TEAM#<id>`, GSI1SK between dates |
| List pending incidents | Scan with status = PENDING filter (or GSI) |

<!-- TODO: Add patterns as you implement new queries -->
