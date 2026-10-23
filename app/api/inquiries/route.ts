import { NextResponse } from "next/server";

const SWIFTBOOK_INGEST_URL =
  process.env.SWIFTBOOK_INGEST_URL || "https://swift-book.base44.app/functions/ingestSiteEvent";
const SWIFTBOOK_API_KEY =
  process.env.SWIFTBOOK_API_KEY || "sbk_160ea7c317204a37b3e5824a4d537e9b";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, type, date, location, notes } = body || {};

    if (!name || !email || !date) {
      return NextResponse.json(
        { error: "Missing required booking details (name, email, or date)." },
        { status: 400 }
      );
    }

    const reference = "NK-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const createdAt = new Date().toISOString();

    const bookingPayload = {
      reference,
      client_name: String(name).trim(),
      client_email: String(email).trim(),
      date: String(date).trim(),
      session_type: type || "Wedding",
      location: location ? String(location).trim() : "",
      notes: notes ? String(notes).trim() : "",
      source: "nadon-klinton-website",
      created_at: createdAt
    };

    let base44Accepted = false;
    let base44Error: string | null = null;

    try {
      const res = await fetch(SWIFTBOOK_INGEST_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": SWIFTBOOK_API_KEY
        },
        body: JSON.stringify({
          event: "new_inquiry",
          booking: bookingPayload
        }),
        signal: AbortSignal.timeout(8000)
      });

      if (res.ok) {
        base44Accepted = true;
      } else {
        const errText = await res.text();
        base44Error = `Base44 returned status ${res.status}: ${errText}`;
        console.warn("[SwiftBook Ingest Warning]", base44Error);
      }
    } catch (netErr: unknown) {
      const msg = netErr instanceof Error ? netErr.message : "Base44 network request failed";
      base44Error = msg;
      console.warn("[SwiftBook Ingest Error]", base44Error);
    }

    return NextResponse.json({
      success: true,
      reference,
      syncedWithBase44: base44Accepted,
      error: base44Error,
      booking: bookingPayload
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
