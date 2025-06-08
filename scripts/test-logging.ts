#!/usr/bin/env node

/**
 * Test script to demonstrate the logging system
 * Usage: npx tsx scripts/test-logging.ts
 */

import { logger } from "../src/lib/services/logger";

async function testLogging() {
  console.log("🧪 Testing the logging system...\n");

  // Test basic logging
  logger.info("Testing basic logging functionality");
  logger.warn("This is a warning message", { component: "test-script" });
  logger.error("This is an error message", {
    error: "Sample error",
    code: "TEST_ERROR",
  });

  // Test contextual logging
  const userLogger = logger.setContext({
    userId: "test-user-123",
    operation: "user_test",
  });

  userLogger.info("Testing contextual logging");
  userLogger.debug("Debug information with context", {
    step: 1,
    data: { key: "value" },
  });

  // Test API operation logging
  const apiLogger = logger.apiStart("test_operation", {
    endpoint: "/test",
    method: "GET",
  });

  // Simulate some work
  await new Promise((resolve) => setTimeout(resolve, 100));

  apiLogger.info("Processing test operation");
  apiLogger.apiEnd("test_operation", {
    success: true,
    duration: "100ms",
  });

  // Test domain-specific logging
  const authLogger = logger.authOperation("test_login", {
    userId: "test-user-456",
  });
  authLogger.info("Testing authentication logging");

  const thermoLogger = logger.thermostatOperation("test_temperature_set", {
    targetTemp: 22,
    deviceId: "test-device-789",
  });
  thermoLogger.info("Testing thermostat operation logging");

  const scheduleLogger = logger.scheduleProcessing("test-schedule-101", {
    temperature: 24,
    startTime: new Date().toISOString(),
  });
  scheduleLogger.info("Testing schedule processing logging");

  // Test error handling
  try {
    throw new Error("Test error for logging");
  } catch (error) {
    apiLogger.apiError("test_operation", error as Error, {
      context: "error_handling_test",
    });
  }

  console.log("\n✅ Logging system test completed!");
  console.log("📝 Check the console output above to see the structured logs");
  console.log("🔍 In production, these would also be written to log files");
}

// Run the test
testLogging().catch(console.error);
