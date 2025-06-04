import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const messageData = body?.message?.data;

    if (!messageData) {
      return NextResponse.json(
        { error: "No message data found" },
        { status: 400 }
      );
    }

    const decodedData = Buffer.from(messageData, "base64").toString("utf-8");

    let parsedData;
    try {
      parsedData = JSON.parse(decodedData);
    } catch {
      parsedData = decodedData;
    }

    console.log("Decoded Pub/Sub message:", parsedData);

    // TODO: Process the thermostat data here
    // This is where you would handle the actual thermostat logic

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    console.error("Error processing Pub/Sub message:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
