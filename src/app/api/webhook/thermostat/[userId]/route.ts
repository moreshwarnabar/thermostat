import { updateThermostat } from "@/lib/services/updateThermostat";
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/services/logger";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const webhookLogger = logger.apiStart("webhook_thermostat");

  try {
    const { userId } = await params;

    if (!userId) {
      webhookLogger.warn("No userId found in URL parameters");
      return NextResponse.json(
        { error: "userId is required in URL path" },
        { status: 400 }
      );
    }

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
        userId: userId, // Using userId from URL params
        timestamp: parsedData?.timestamp,
      });

      // Include userId from URL params in the data passed to updateThermostat
      const dataWithUserId = {
        ...parsedData,
        userId: userId,
      };

      await updateThermostat(dataWithUserId);
      webhookLogger.apiEnd("webhook_thermostat", { success: true });
    } catch (parseError) {
      webhookLogger.error("Error parsing decoded data into JSON", {
        decodedData,
        userId,
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
    const { userId } = await params;
    webhookLogger.apiError(
      "webhook_thermostat",
      error instanceof Error ? error : new Error("Unknown error"),
      {
        hasBody: !!request.body,
        userId: userId,
      }
    );
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
