#!/usr/bin/env node

/**
 * Test script for token refresh endpoint
 * Usage: node scripts/test-token-refresh.js [url] [token]
 */

const url = process.argv[2] || "http://localhost:3000";
const token = process.argv[3];

async function testTokenRefresh() {
  try {
    console.log(`Testing token refresh endpoint: ${url}/api/auth/refresh-all`);

    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${url}/api/auth/refresh-all`, {
      method: "POST",
      headers,
    });

    const data = await response.json();

    console.log("\n--- Response ---");
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log("\n✅ Token refresh endpoint is working!");
      if (data.total_tokens > 0) {
        console.log(
          `📊 Refreshed ${data.successful_refreshes}/${data.total_tokens} tokens`
        );
      } else {
        console.log("ℹ️  No tokens needed refreshing at this time");
      }
    } else {
      console.log("\n❌ Token refresh failed");
    }
  } catch (error) {
    console.error("\n❌ Error testing token refresh:", error.message);
    process.exit(1);
  }
}

testTokenRefresh();
