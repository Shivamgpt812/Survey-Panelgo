# Survey Tracking System Implementation

This document explains how to use the new survey tracking system that has been integrated into your Survey Panel Go project.

## Overview

The survey tracking system captures detailed information about survey attempts and completions, including:
- Unique Click IDs (PID) for each attempt
- User identification (authenticated or anonymous)
- Real IP addresses
- Survey completion status
- Timestamps

## API Endpoints

### 1. Start Survey Tracking
```http
POST /api/survey-tracking/start
```

**Body:**
```json
{
  "surveyId": "survey_123"
}
```

**Response:**
```json
{
  "clickId": "PID_1640995200000_abc123def",
  "userId": "user_456",
  "ipAddress": "192.168.1.100",
  "message": "Survey tracking initialized"
}
```

### 2. Complete Survey Tracking
```http
POST /api/survey-tracking/complete
```

**Body:**
```json
{
  "surveyId": "survey_123",
  "userId": "user_456", 
  "clickId": "PID_1640995200000_abc123def",
  "status": "completed"
}
```

**Response:**
```json
{
  "tracking": {
    "id": "tracking_789",
    "surveyId": "survey_123",
    "userId": "user_456",
    "clickId": "PID_1640995200000_abc123def",
    "ipAddress": "192.168.1.100",
    "status": "completed",
    "timestamp": "2024-01-01T12:00:00.000Z"
  },
  "redirectUrl": "/survey-result/PID_1640995200000_abc123def",
  "message": "Survey tracking completed successfully"
}
```

### 3. Get Tracking Record
```http
GET /api/survey-tracking/:clickId
```

### 4. Get All Tracking Logs (Admin Only)
```http
GET /api/survey-tracking
```

## Frontend Integration

### Method 1: Using the SurveyTracker Hook

```typescript
import { useSurveyTracker } from '@/components/SurveyTracker';

function MySurveyComponent({ surveyId }: { surveyId: string }) {
  const { startTracking, completeTracking, trackingData, loading } = useSurveyTracker(surveyId);

  useEffect(() => {
    // Start tracking when component mounts
    startTracking();
  }, []);

  const handleComplete = async () => {
    try {
      await completeTracking('completed');
      // User will be redirected to result page automatically
    } catch (error) {
      console.error('Tracking failed:', error);
    }
  };

  const handleTerminate = async () => {
    try {
      await completeTracking('terminated');
    } catch (error) {
      console.error('Tracking failed:', error);
    }
  };

  return (
    <div>
      <p>Tracking ID: {trackingData?.clickId}</p>
      <button onClick={handleComplete}>Complete Survey</button>
      <button onClick={handleTerminate}>Terminate Survey</button>
    </div>
  );
}
```

### Method 2: Using the SurveyTracker Component

```typescript
import { SurveyTracker } from '@/components/SurveyTracker';

function MySurveyComponent({ surveyId }: { surveyId: string }) {
  return (
    <SurveyTracker surveyId={surveyId}>
      {({ startTracking, completeTracking, trackingData, loading }) => (
        <div>
          <button onClick={() => startTracking()}>
            Start Tracking
          </button>
          <button onClick={() => completeTracking('completed')}>
            Complete Survey
          </button>
          <p>Click ID: {trackingData?.clickId}</p>
        </div>
      )}
    </SurveyTracker>
  );
}
```

### Method 3: Manual API Integration

```typescript
import { startSurveyTracking, completeSurveyTracking } from '@/lib/api';

async function handleSurveyStart(surveyId: string) {
  try {
    const response = await startSurveyTracking(surveyId, token);
    console.log('Tracking started:', response.clickId);
    return response;
  } catch (error) {
    console.error('Failed to start tracking:', error);
  }
}

async function handleSurveyComplete(surveyId: string, clickId: string, userId: string) {
  try {
    const response = await completeSurveyTracking(surveyId, userId, clickId, 'completed', token);
    // Redirect to result page
    window.location.href = response.redirectUrl;
  } catch (error) {
    console.error('Failed to complete tracking:', error);
  }
}
```

## Survey Result Page

Users are automatically redirected to `/survey-result/:clickId` after survey completion. The result page displays:

- PID (Click ID)
- User ID
- IP Address
- Status (Completed/Terminated/Quota Full)
- Timestamp

## Admin Dashboard

### New "Survey Logs" Tab

Admin users can view all survey tracking records in the new "Survey Logs" tab in the admin dashboard. This includes:

- Searchable table with all tracking records
- Real-time data matching what users see
- Export capabilities
- Status filtering

### Features:
- **Search**: Filter by Survey ID, User ID, PID, IP Address, or Status
- **Status Badges**: Visual indicators for completion status
- **Timestamp Display**: Human-readable date/time format
- **Real-time Updates**: Refresh button for latest data

## Database Schema

New collection: `surveytracking`

```javascript
{
  surveyId: String (required),
  userId: String (required),
  clickId: String (required, unique),
  ipAddress: String (required),
  status: String (enum: ['completed', 'terminated', 'quota_full'], required),
  timestamp: Date (required),
  createdAt: Date,
  updatedAt: Date
}
```

## Integration Examples

### Example 1: External Survey Integration

```typescript
// For external surveys, call tracking when user clicks survey link
async function handleExternalSurveyClick(surveyId: string) {
  const tracking = await startSurveyTracking(surveyId);
  
  // Redirect to external survey with tracking info
  window.open(`${externalSurveyUrl}?pid=${tracking.clickId}`, '_blank');
  
  // Later, when user returns, complete the tracking
  completeSurveyTracking(surveyId, tracking.userId, tracking.clickId, 'completed');
}
```

### Example 2: Internal Survey Integration

```typescript
// For internal surveys, integrate with your existing survey flow
function InternalSurvey({ surveyId }: { surveyId: string }) {
  const { startTracking, completeTracking } = useSurveyTracker(surveyId);
  
  useEffect(() => {
    startTracking(); // Start when survey loads
  }, []);
  
  const handleSurveySubmit = async () => {
    // Your existing survey submission logic
    await submitSurveyAnswers();
    
    // Complete tracking
    await completeTracking('completed');
  };
  
  // Your existing survey UI
  return <SurveyForm onSubmit={handleSurveySubmit} />;
}
```

## Status Values

- **`completed`**: User successfully completed the survey
- **`terminated`**: User was terminated or didn't qualify
- **`quota_full`**: Survey quota was reached

## IP Address Detection

The system automatically detects real IP addresses using:
- `x-forwarded-for` header (for proxied requests)
- `x-real-ip` header
- Connection remote address
- Cleans IPv6-mapped IPv4 addresses (`::ffff:` prefix)

## Error Handling

The tracking system is designed to be non-intrusive:
- If tracking fails, the main survey functionality continues
- Errors are logged but don't break the user experience
- Fallback behaviors are implemented

## Security Considerations

- All tracking endpoints support both authenticated and anonymous users
- IP addresses are stored for analytics purposes
- Click IDs are generated using timestamp + random strings for uniqueness
- CORS is properly configured for cross-origin requests

## Testing

To test the tracking system:

1. Start a survey tracking session
2. Complete the survey with different statuses
3. Check the result page displays correct information
4. Verify admin dashboard shows matching records
5. Test search and filtering functionality

## Migration Notes

This system is designed to work alongside your existing survey functionality without breaking changes. Existing surveys will continue to work normally, and tracking is optional but recommended for new implementations.
