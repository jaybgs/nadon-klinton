import { NextResponse } from "next/server";

const DEFAULT_BASE44_KEY = "sbk_21159d4ef0754e959a6f30bfb5414622";
const DEFAULT_EVENT_URL = "https://swift-book.base44.app/functions/ingestBookingForm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, type, date, location, notes } = body || {};

    if (!name || !email || !date || !location) {
      return NextResponse.json(
        { error: "Missing required booking details (name, email, date, location)." },
        { status: 400 }
      );
    }

    let finalReference = `SB-NAD-${Math.floor(100000 + Math.random() * 900000)}`;
    const apiKey =
      process.env.BASE44_API_KEY ||
      process.env.SWIFTBOOK_API_KEY ||
      DEFAULT_BASE44_KEY;
    const eventUrl =
      process.env.BASE44_EVENT_URL ||
      process.env.SWIFTBOOK_INGEST_URL ||
      DEFAULT_EVENT_URL;

    const payload = {
      client_name: String(name).trim(),
      client_email: String(email).trim().toLowerCase(),
      date: String(date),
      session_type: String(type || "Wedding"),
      location: String(location).trim(),
      phone: phone ? String(phone).trim() : "",
      notes: String(notes || "").trim()
    };

    let ingested = false;
    let base44Response: unknown = null;

    try {
      const res = await fetch(eventUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        ingested = true;
        base44Response = await res.json().catch(() => null);
        if (
          base44Response &&
          typeof base44Response === "object" &&
          "reference" in base44Response &&
          typeof (base44Response as { reference?: string }).reference === "string"
        ) {
          finalReference = (base44Response as { reference: string }).reference;
        }
      } else {
        const errText = await res.text().catch(() => "");
        console.error("SwiftBook ingest returned non-200:", res.status, errText);
      }
    } catch (ingestErr) {
      console.error("Failed to post inquiry event to SwiftBook:", ingestErr);
    }

    return NextResponse.json({
      success: true,
      reference: finalReference,
      ingested,
      response: base44Response,
      item: {
        id: finalReference,
        name,
        email,
        phone: phone || "",
        type: type || "Wedding",
        date,
        location,
        notes: notes || "",
        status: "New",
        created: new Date().toISOString()
      }
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Inquiry API error:", message);
    return NextResponse.json(
      { error: "Internal server error while processing inquiry." },
      { status: 500 }
    );
  }
}
