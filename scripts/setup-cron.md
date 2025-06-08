# Token Refresh Cron Job Setup

This document explains how to set up automatic token refresh every 55 minutes on different platforms.

## Vercel (Recommended)

If deploying on Vercel, the `vercel.json` file is already configured to run the token refresh every 55 minutes automatically.

No additional setup required!

## Other Platforms / Manual Setup

### 1. External Cron Services

Use services like:

- **cron-job.org** (free)
- **EasyCron**
- **Zapier** (scheduled workflows)

**Setup:**

1. Create an account with any cron service
2. Set up a POST request to: `https://your-domain.com/api/auth/refresh-all`
3. Set schedule: Every 55 minutes (`*/55 * * * *`)
4. Optional: Add authorization header if you set `CRON_SECRET_TOKEN`

### 2. Server Cron Job (Linux/macOS)

Add to crontab:

```bash
# Edit crontab
crontab -e

# Add this line (runs every 55 minutes)
*/55 * * * * curl -X POST https://your-domain.com/api/auth/refresh-all
```

### 3. GitHub Actions (Free)

Create `.github/workflows/token-refresh.yml`:

```yaml
name: Token Refresh
on:
  schedule:
    - cron: "*/55 * * * *" # Every 55 minutes
  workflow_dispatch: # Allow manual trigger

jobs:
  refresh-tokens:
    runs-on: ubuntu-latest
    steps:
      - name: Refresh Auth Tokens
        run: |
          curl -X POST ${{ secrets.APP_URL }}/api/auth/refresh-all \
               -H "Authorization: Bearer ${{ secrets.CRON_SECRET_TOKEN }}"
```

### 4. Security (Optional)

Add to your environment variables:

```
CRON_SECRET_TOKEN=your-secret-token-here
```

Then include in requests:

```bash
curl -X POST https://your-domain.com/api/auth/refresh-all \
     -H "Authorization: Bearer your-secret-token-here"
```

## Testing

Test the endpoint manually:

```bash
# Test without auth
curl -X POST https://your-domain.com/api/auth/refresh-all

# Test with auth (if CRON_SECRET_TOKEN is set)
curl -X POST https://your-domain.com/api/auth/refresh-all \
     -H "Authorization: Bearer your-secret-token"
```

## Monitoring

The endpoint returns detailed information about refresh results:

```json
{
  "message": "Token refresh completed",
  "total_tokens": 5,
  "successful_refreshes": 4,
  "failed_refreshes": 1,
  "results": [...],
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

Check your application logs to monitor refresh operations.
