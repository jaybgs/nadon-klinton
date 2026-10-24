import { NextResponse } from "next/server";

const DEFAULT_BASE44_KEY = "sbk_0776f2614cf1448783d5692bf34ee705";
const DEFAULT_EVENT_URL = "https://swift-book.base44.app/functions/ingestSiteEvent";

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

    const reference = `NK-${Math.floor(100000 + Math.random() * 900000)}`;
    const apiKey =
      process.env.BASE44_API_KEY ||
      process.env.SWIFTBOOK_API_KEY ||
      DEFAULT_BASE44_KEY;
    const eventUrl =
      process.env.BASE44_EVENT_URL ||
      process.env.SWIFTBOOK_INGEST_URL ||
      DEFAULT_EVENT_URL;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nadon-klinton.vercel.app";

    const payload = {
      event: "new_inquiry",
      source: siteUrl,
      booking: {
        reference,
        client_name: String(name).trim(),
        client_email: String(email).trim().toLowerCase(),
        client_phone: phone ? String(phone).trim() : undefined,
        date: String(date),
        session_type: String(type || "Wedding"),
        location: String(location).trim(),
        notes: String(notes || "").trim(),
        status: "New",
        created_at: new Date().toISOString()
      }
    };

    let ingested = false;
    let base44Response: unknown = null;

    try {
      const res = await fetch(eventUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        ingested = true;
        base44Response = await res.json().catch(() => null);
      } else {
        const errText = await res.text().catch(() => "");
        console.error("Base44 ingest returned non-200:", res.status, errText);
      }
    } catch (ingestErr) {
      console.error("Failed to post inquiry event to Base44:", ingestErr);
    }

    return NextResponse.json({
      success: true,
      reference,
      ingested,
      response: base44Response,
      item: {
        id: reference,
        name,
        email,
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
