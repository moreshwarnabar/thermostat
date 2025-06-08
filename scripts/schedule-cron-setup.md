# Schedule-Based Thermostat Update Setup

This guide explains how to set up automatic schedule processing for thermostat updates.

## How It Works

The application now includes functionality to automatically trigger thermostat updates based on schedules:

1. **Schedule Processing Service** (`src/lib/services/scheduleProcessor.ts`)

   - Looks for schedules that should start at the current 15-minute mark (13:00, 13:15, 13:30, 13:45, etc.)
   - Triggers thermostat updates for matching schedules
   - Uses the existing `updateThermostat` helper methods

2. **API Endpoint** (`/api/schedules/trigger`)
   - `GET /api/schedules/trigger` - Process schedules that should start now
   - `POST /api/schedules/trigger` - Process schedules that should start now

## Setup Instructions

### Option 1: Cron Job (Recommended for Server Deployment)

Add a cron job to run every 15 minutes to check for schedules:

```bash
# Edit crontab
crontab -e

# Add this line to check for schedules every 15 minutes
*/15 * * * * curl -X GET "https://your-domain.com/api/schedules/trigger" >> /var/log/thermostat-scheduler.log 2>&1
```

### Option 2: Using a Monitoring Service

You can use services like:

- **Uptime Robot** - Set up HTTP monitoring to hit the endpoint every 15 minutes
- **Cronitor** - Professional cron job monitoring
- **GitHub Actions** - If hosted on Vercel/Netlify, use scheduled workflows

### Option 3: Manual Testing

For testing purposes, you can manually trigger schedule processing:

```bash
# Test the endpoint
curl -X GET "http://localhost:3000/api/schedules/trigger"

# Or with POST
curl -X POST "http://localhost:3000/api/schedules/trigger"
```

## Configuration

### Time Matching

- The system looks for schedules that start at the exact current 15-minute mark
- **Example**: At 13:15, it looks for schedules with start_time = 13:15
- **No time windows needed**: Perfect alignment between cron schedule and thermostat schedules

### Environment Variables

Make sure these environment variables are set in your deployment:

- `THERMO_BASE_URL`
- `THERMO_PROJECT_ID`
- `THERMO_DEVICE_ID`
- `BASE_COMMAND`

## Monitoring

The API endpoint returns detailed information about processed schedules:

```json
{
  "success": true,
  "message": "Processed 2 schedules",
  "processedSchedules": 2,
  "errors": []
}
```

Check your application logs for detailed processing information.

## Deployment Considerations

### Vercel

If deploying to Vercel, consider using:

- **Vercel Cron Jobs** (Pro plan) - Set to run every 15 minutes
- **External cron service** hitting your API endpoint every 15 minutes

### Railway/Render/Other Platforms

Most platforms support cron jobs. Add the curl command to run every 15 minutes.

### Docker

If using Docker, you can add a cron service to your container or use an external service.

## Why Every 15 Minutes?

- **Simple**: Exact match between cron schedule and thermostat schedules
- **Efficient**: No complex time window calculations needed
- **Reliable**: Schedules are created on 15-minute boundaries, cron runs on 15-minute boundaries
- **Aligned**: Perfect synchronization between schedule creation and execution

## Troubleshooting

1. **No schedules processed**: Check if schedules exist in the database and their start times
2. **Authentication errors**: Verify your Google API credentials are valid
3. **Network errors**: Ensure your application can reach the Google Nest API
4. **Database errors**: Check your Supabase connection and table structure
5. **Duplicate processing**: The system handles this automatically with the time window

## Security Notes

Consider adding authentication to the `/api/schedules/trigger` endpoint in production to prevent unauthorized access.
