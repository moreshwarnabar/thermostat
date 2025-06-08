# Logging System Documentation

This application uses a structured logging system built with Winston that provides comprehensive logging capabilities for development and production environments.

## Features

- **Structured Logging**: All logs include contextual metadata
- **Multiple Log Levels**: error, warn, info, http, debug
- **Environment-Specific Configuration**: Different formats for development vs production
- **File Logging**: Automatic log file rotation in production
- **Contextual Logging**: Ability to add context that persists across related log calls
- **Domain-Specific Methods**: Pre-configured methods for common operations

## Log Levels

- **error**: Critical errors that need immediate attention
- **warn**: Warning conditions that should be monitored
- **info**: General information about application flow
- **http**: HTTP request/response logging
- **debug**: Detailed debugging information (only in development)

## Usage

### Basic Logging

```typescript
import { logger } from "@/lib/services/logger";

// Basic logging
logger.info("User logged in successfully");
logger.error("Database connection failed", { error: error.message });
logger.warn("Rate limit approaching", { currentCount: 95, limit: 100 });
```

### Contextual Logging

```typescript
// Set context for related operations
const userLogger = logger.setContext({
  userId: "123",
  operation: "profile_update",
});
userLogger.info("Starting profile update");
userLogger.info("Validating input data");
userLogger.info("Profile updated successfully");
```

### API Operation Logging

```typescript
// For API routes
export async function POST(request: NextRequest) {
  const apiLogger = logger.apiStart("user_create");

  try {
    // ... your logic
    apiLogger.apiEnd("user_create", { userId: newUser.id });
    return NextResponse.json({ success: true });
  } catch (error) {
    apiLogger.apiError("user_create", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
```

### Domain-Specific Logging

#### Authentication Operations

```typescript
const authLogger = logger.authOperation("login", { userId: "123" });
authLogger.info("Processing login request");
```

#### Thermostat Operations

```typescript
const thermoLogger = logger.thermostatOperation("set_temperature", {
  targetTemp: 25,
  deviceId: "device123",
});
thermoLogger.info("Setting thermostat temperature");
```

#### Schedule Processing

```typescript
const scheduleLogger = logger.scheduleProcessing("schedule_123", {
  temperature: 22,
  startTime: "2024-01-01T10:00:00Z",
});
scheduleLogger.info("Processing scheduled temperature change");
```

## Configuration

### Environment Variables

- `LOG_LEVEL`: Set the minimum log level (default: 'debug' in development, 'info' in production)
- `NODE_ENV`: Determines log format and file output

### Log Files (Production Only)

- `logs/error.log`: Contains only error-level logs
- `logs/combined.log`: Contains all logs
- Files are automatically rotated when they reach 5MB
- Up to 5 historical files are kept

## Log Format

### Development

Colorized console output with timestamps:

```
2024-01-01 10:30:45:123 [INFO]: User logged in successfully
Meta: {
  "userId": "123",
  "operation": "login"
}
```

### Production

JSON format for structured parsing:

```json
{
  "timestamp": "2024-01-01 10:30:45:123",
  "level": "info",
  "message": "User logged in successfully",
  "userId": "123",
  "operation": "login"
}
```

## Best Practices

1. **Use Appropriate Log Levels**: Don't log everything as `info`
2. **Include Context**: Add relevant metadata to help with debugging
3. **Avoid Sensitive Data**: Never log passwords, tokens, or personal information
4. **Use Domain-Specific Methods**: Leverage the pre-built methods for common operations
5. **Structure Your Messages**: Use consistent, searchable message formats

## Examples from the Codebase

### Schedule Processing

```typescript
const scheduleLogger = logger.scheduleProcessing("process_schedules");
scheduleLogger.info("Starting schedule processing", {
  timestamp: now.toISOString(),
});

// Process schedules...

scheduleLogger.info("Schedule processing completed", {
  success: result.success,
  processedCount: processedSchedules,
  errorCount: errors.length,
});
```

### Thermostat Updates

```typescript
const thermoLogger = logger.thermostatOperation("update_thermostat", {
  eventId: event.eventId,
  userId: event.userId,
});

thermoLogger.info("Validating thermostat event", {
  eventId: event.eventId,
  timestamp: event.timestamp,
});
```

### API Error Handling

```typescript
try {
  // ... API logic
} catch (error) {
  webhookLogger.apiError(
    "webhook_thermostat",
    error instanceof Error ? error : new Error("Unknown error"),
    { hasBody: !!request.body }
  );
  return NextResponse.json(
    { error: "Failed to process message" },
    { status: 500 }
  );
}
```

## Monitoring and Debugging

- In development, logs appear in the console with colors and formatting
- In production, check the log files in the `logs/` directory
- Use log aggregation tools like ELK stack or similar for production monitoring
- Search logs by context fields like `userId`, `scheduleId`, `operation`, etc.
