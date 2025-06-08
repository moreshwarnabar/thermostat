import updateThermostat from "@/lib/services/updateThermostat";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/services/logger";

export async function POST(request: NextRequest) {
  const webhookLogger = logger.apiStart("webhook_thermostat");

  try {
    const body = await request.json();

    const messageData = body?.message?.data;

    if (!messageData) {
      webhookLogger.warn("No message data found in webhook request", { body });
      return NextResponse.json(
        { error: "No message data found" },
        { status: 400 }
      );
    }

    const decodedData = Buffer.from(messageData, "base64").toString("utf-8");

    let parsedData;
    try {
      parsedData = JSON.parse(decodedData);
      webhookLogger.info("Decoded Pub/Sub message successfully", {
        eventId: parsedData?.eventId,
        userId: parsedData?.userId,
        timestamp: parsedData?.timestamp,
      });

      await updateThermostat(parsedData);
      webhookLogger.apiEnd("webhook_thermostat", { success: true });
    } catch (parseError) {
      webhookLogger.error("Error parsing decoded data into JSON", {
        decodedData,
        error:
          parseError instanceof Error
            ? parseError.message
            : "Unknown parse error",
      });
      return NextResponse.json(
        { error: "Failed to parse decoded data into JSON" },
        { status: 400 }
      );
    }

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    webhookLogger.apiError(
      "webhook_thermostat",
      error instanceof Error ? error : new Error("Unknown error"),
      {
        hasBody: !!request.body,
      }
    );
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
