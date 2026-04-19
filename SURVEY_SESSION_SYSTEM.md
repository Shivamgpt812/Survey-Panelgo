# Dynamic Survey Redirect Tracking System

## Overview

This system enables dynamic survey redirect tracking with multiple external survey providers. It creates unique identifiers, injects them into external survey links, and handles redirection back to the correct vendor after survey completion.

## Architecture

### STEP 1: Generate Identifier (Common for All Links)

When generating ANY external survey link:
1. Create a unique identifier: `UUID()` or random string
2. Store in database: `survey_sessions` table

### STEP 2: Modify External Link (Dynamically)

The system detects user identifier parameters dynamically:
- `user_id`
- `uid`
- `user`
- `participant_id`

The identifier is injected into the detected parameter.

### STEP 3: Store Parameter Type

While generating the link, the system also stores:
- `identifier_param_name` (e.g., user_id / uid / user)

### STEP 4: Redirect Handling (Common)

External systems return:
```
/api/redirect?uid=IDENTIFIER&status=X
```

The system handles both:
- `uid`
- `user_id`
- `user`

### STEP 5: Lookup & Redirect

1. Find session using identifier
2. Get `vendor_id` and `actual_user_id`
3. Redirect based on status:
   - status = 1 → complete
   - status = 2 → terminate
   - status = 3 → quota
4. Replace `[identifier]` placeholder in vendor URL with `actual_user_id`

### STEP 6: Fallback (Mandatory)

If identifier not found → run existing redirect logic unchanged

## Database Schema

### Table: `survey_sessions`

| Field | Type | Description |
|-------|------|-------------|
| `identifier` | String (UUID) | Unique identifier for the session |
| `vendor_id` | ObjectId | Reference to VendorLite |
| `actual_user_id` | String | The real user ID |
| `survey_id` | String | Survey PID (optional) |
| `base_url` | String | Original external link |
| `identifier_param_name` | String | Parameter used (user_id/uid/user) |
| `created_at` | Date | Session creation time (TTL: 7 days) |

## API Endpoints

### Backend (Server-side)

#### POST `/vendor-lite/generate-vendor-link`

Generate a dynamic vendor link with identifier injection.

**Request:**
```json
{
  "surveyToken": "abc123",
  "userId": "user-xyz-789"
}
```

**Response:**
```json
{
  "success": true,
  "originalUrl": "https://example.com/survey?user_id=",
  "modifiedUrl": "https://example.com/survey?user_id=uuid-here",
  "identifier": "uuid-here",
  "paramName": "user_id",
  "survey": {
    "id": "...",
    "title": "Survey Title",
    "pid": "PID123",
    "token": "abc123"
  }
}
```

#### GET `/api/redirect`

Handle redirect from external survey providers.

**Query Parameters:**
- `uid` or `user_id` or `user` - The session identifier
- `status` - 1=complete, 2=terminate, 3=quota
- `pid` - Optional project ID

**Behavior:**
1. Look up survey session by identifier
2. If found, redirect to vendor URL with `[identifier]` replaced
3. If not found, run existing redirect logic

### Frontend (Client-side)

#### `generateVendorLink(surveyToken, userId)`

Located in: `src/lib/surveySessionApi.ts`

**Usage:**
```typescript
import { generateVendorLink } from '@/lib/surveySessionApi';

const response = await generateVendorLink('survey-token', 'user-123');
window.location.href = response.modifiedUrl;
```

## Supported External Provider Formats

The system supports unlimited external providers with these URL patterns:

```
https://panel.sixsenseresearch.com/survey-start?pid=7645&gid=14026&user_id={IDENTIFIER}
https://anotherpanel.com/start?survey=123&uid={IDENTIFIER}
https://xyz.com/survey?user={IDENTIFIER}
https://researchpanel.com/entry?study=999&participant_id={IDENTIFIER}
```

## Critical Rules Compliance

✅ **DO NOT modify global uid/rid/transactionId behavior**
- The existing system remains unchanged
- New logic only applies when survey session is found

✅ **DO NOT hardcode any specific external provider URL**
- URL parameter detection is dynamic
- Supports any provider using standard parameter names

✅ **DO NOT change prescreener, admin panel, or reports**
- These components are untouched
- Only vendor link generation and redirect API are modified

✅ **ONLY modify:**
1. Vendor Link generation flow (`/vendor-lite/generate-vendor-link`)
2. Redirect API (`/api/redirect`)

## Files Created/Modified

### New Files

1. **`server/models/SurveySession.ts`** - Database model for survey sessions
2. **`server/lib/surveySessionUtils.ts`** - Utility functions for identifier generation and URL manipulation
3. **`src/lib/surveySessionApi.ts`** - Frontend API client
4. **`test-survey-session-system.js`** - Test script
5. **`SURVEY_SESSION_SYSTEM.md`** - This documentation

### Modified Files

1. **`server/vendor-lite/vendorController.ts`** - Added `generateVendorLink` endpoint
2. **`server/vendor-lite/routes.ts`** - Added route for new endpoint
3. **`server/index.ts`** - Enhanced redirect handler with survey session lookup

## Usage Example

### For External Survey Flow

1. **Create External Survey:**
   - Set survey type to "external"
   - Provide external link with empty user parameter: `https://example.com/survey?user_id=`

2. **Generate Dynamic Link:**
   ```typescript
   const { modifiedUrl, identifier } = await generateVendorLink(surveyToken, userId);
   // modifiedUrl: https://example.com/survey?user_id=uuid-here
   ```

3. **User Completes Survey:**
   - External provider redirects to: `/api/redirect?uid=uuid-here&status=1`

4. **System Redirects to Vendor:**
   - Looks up session by identifier
   - Gets vendor's complete_url
   - Replaces `[identifier]` with actual_user_id
   - Redirects to: `https://vendor.com/complete?pid=...&uid=actual_user_id`

## Testing

Run the test script:
```bash
node test-survey-session-system.js
```

This tests:
1. Parameter detection in various URL formats
2. Identifier injection into URLs
3. Full flow integration
4. Redirect handler simulation

## Security Considerations

- Survey sessions have a 7-day TTL (auto-cleanup)
- Identifiers are UUIDs (virtually unique)
- Session lookup is read-only for redirects
- Original user ID is never exposed to external providers
- Fallback logic ensures existing behavior is preserved

## Monitoring

Logs are generated at key points:
- When generating vendor links
- When creating survey sessions
- When handling redirects
- When looking up sessions
- Fallback behavior triggers

All logs include relevant identifiers for debugging.
