# Team 4 — Mobile Client

## Your scope

You build the mobile app for field workers. The key differentiator from the web client is support for multiple clock methods: GPS location capture, QR code scanning, and NFC reading. Workers clock in/out, view records, and report incidents from the field.

## Screens

| Screen | Description |
|--------|-------------|
| Login | System browser → Cognito → OneLogin (PKCE flow) |
| Dashboard | Current clock status + today's records |
| Clock In/Out | Method selector: GPS, QR, NFC, Manual |
| My Records | Personal attendance with date filter |
| Report Incident | Report forgotten punch or correction |

## Clock Methods

This is your main differentiator. Each method captures different data:

| Method | How it works | Data captured |
|--------|-------------|---------------|
| GPS | Auto-capture location on punch | `latitude`, `longitude` |
| QR | Scan QR code at site entrance | QR payload → `worker_id` validation |
| NFC | Tap NFC tag at site | NFC tag → `worker_id` validation |
| MANUAL | Simple button press | No extra data |

```typescript
// GPS clock-in example
import Geolocation from "@react-native-community/geolocation";

async function clockInWithGPS(workerId: string) {
  const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
    Geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 5000 })
  );
  return api.clockIn({
    worker_id: workerId,
    method: "GPS",
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
  });
}
```

```typescript
// QR clock-in example
import { RNCamera } from "react-native-camera";

async function clockInWithQR(scannedData: string) {
  // QR contains worker_id or site validation token
  return api.clockIn({
    worker_id: scannedData,
    method: "QR",
  });
}
```

## API Endpoints You Consume

**From attendance-service (Team 1):**

| Method | Path | Used for |
|--------|------|----------|
| POST | `/clock-in` | Clock in with method + location |
| POST | `/clock-out` | Clock out |
| GET | `/records` | Own records |
| GET | `/records/today` | Today's status |
| POST | `/incidents` | Report incident |

**From auth-service (Team 2):**

| Method | Path | Used for |
|--------|------|----------|
| GET | `/me` | Current user profile |

## Auth Integration (PKCE)

```typescript
import { authorize } from "react-native-app-auth";

const config = {
  issuer: "https://cognito-idp.eu-west-1.amazonaws.com/<USER_POOL_ID>",
  clientId: "<APP_CLIENT_ID>",
  redirectUrl: "construction://callback",
  scopes: ["openid", "profile", "email"],
  additionalParameters: { identity_provider: "OneLogin" },
};

export async function login() {
  return authorize(config);
}
```

## Getting Started with Kiro

```
1/ Create project: npx react-native init ConstructionMobile --template react-native-template-typescript
2/ Copy .kiro/ directory and attendance-service.yaml + auth-service.yaml into your project
3/ Ask Kiro: "Generate React Native screens for the attendance mobile app with GPS and QR clock methods"
4/ Ask Kiro: "Add auth with react-native-app-auth for Cognito + OneLogin"
5/ Run: npx react-native run-ios
```

## Dependencies

- **From Team 2:** Cognito User Pool ID, App Client ID, Cognito domain
- **From Team 1:** API Gateway URL
- **Mobile deep link:** `construction://callback` must be in Cognito callback URLs (Team 2)
