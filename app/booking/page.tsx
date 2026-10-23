"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import Stepper, { Step } from "../components/react-bits/Stepper/Stepper";
import GlideSelect from "../components/react-bits/GlideSelect/GlideSelect";
import StatusMark from "../components/react-bits/StatusMark/StatusMark";
import { readInquiries, saveInquiries, type Inquiry } from "../booking-demo";
import s from "../booking-ui.module.css";

export default function Booking() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const [step, setStep] = useState(0);
  const [done, setDone] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState({
    name: "",
    email: "",
    type: "Wedding",
    date: "",
    location: "",
    notes: ""
  });

  const update = (field: string, value: string) =>
    setData((current) => ({ ...current, [field]: value }));

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (step < 2) {
      const fields = new FormData(e.currentTarget);
      setData((current) => ({ ...current, ...Object.fromEntries(fields.entries()) }));
      setStep(step + 1);
      return;
    }

    if (!data.date || !data.location.trim()) {
      setStep(0);
      setError("Please complete the date and location.");
      return;
    }

    setSubmitting(true);

    try {
      let reference = crypto.randomUUID();

      try {
        const res = await fetch("/api/inquiries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          const json = await res.json();
          if (json.reference) {
            reference = json.reference;
          }
        }
      } catch (apiErr) {
        console.warn("API submission warning, saving locally:", apiErr);
      }

      const item: Inquiry = {
        ...data,
        id: reference,
        status: "New",
        created: new Date().toISOString()
      };
      saveInquiries([item, ...readInquiries()]);
      setDone(reference);
    } catch {
      setError("Unable to submit inquiry at this time. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={s.page}>
      <div className={s.layout}>
        <aside data-scroll-reveal className={s.intro}>
          <span className={s.eyebrow}>LET’S CREATE SOMETHING PERSONAL</span>
          <h1>
            Your story.
            <br />
            <em>Our next frame.</em>
          </h1>
          <p>
            A celebration, a new chapter, or simply a moment you want to hold on to. Tell me a
            little about it.
          </p>
          <Stepper
            step={done ? 4 : step + 1}
            showFooter={false}
            disableStepIndicators
            theme="light"
            accentColor="#74865e"
            frame={false}
            indicator="numbers"
            className="nadon-booking-stepper"
          >
            <Step title="The occasion" />
            <Step title="Your details" />
            <Step title="The little things" />
          </Stepper>
          <small>
            Submitting an inquiry does not reserve a date. Availability and pricing are confirmed
            personally.
          </small>
        </aside>

        <section data-scroll-reveal className={s.panel}>
          {done ? (
            <div role="status">
              <StatusMark status="done" label="Inquiry received" doneColor="#74865e" />
              <h2>
                A beautiful
                <br />
                <em>beginning.</em>
              </h2>
              <p>
                Thank you for reaching out! Your inquiry has been received. I will review your
                details and be in touch shortly with availability and pricing.
              </p>
              <p className={s.reference}>Reference: {done.slice(0, 8)}</p>
              <Link className={s.primary} href="/">
                Return to home
              </Link>
            </div>
          ) : (
            <form key={step} onSubmit={submit}>
              <span className={s.eyebrow}>STEP 0{step + 1} / 03</span>
              <h2>{["What brings you here?", "Let’s get acquainted.", "Make it yours."][step]}</h2>

              {step === 0 && (
                <>
                  <div className="nadon-session-select">
                    <span>Session type</span>
                    <input type="hidden" name="type" value={data.type} />
                    <GlideSelect
                      options={["Wedding", "Pre-wedding", "Portrait", "Family", "Editorial", "Birthday"]}
                      value={data.type}
                      onChange={(v) => update("type", v)}
                      ariaLabel="Session type"
                      size="lg"
                      radius={16}
                      accentColor="#74865e"
                      surfaceColor="#f2f1e9"
                      highlightColor="#e0e6d4"
                      textColor="#303a2e"
                    />
                  </div>
                  <label>
                    Preferred date
                    <input
                      name="date"
                      required
                      type="date"
                      value={data.date}
                      min={new Date().toLocaleDateString("en-CA")}
                      onChange={(e) => update("date", e.target.value)}
                    />
                  </label>
                  <label>
                    City or venue
                    <input
                      name="location"
                      required
                      maxLength={160}
                      value={data.location}
                      onChange={(e) => update("location", e.target.value)}
                      placeholder="Where is your story unfolding?"
                    />
                  </label>
                </>
              )}

              {step === 1 && (
                <>
                  <label>
                    Your name
                    <input
                      name="name"
                      required
                      autoComplete="name"
                      maxLength={100}
                      value={data.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="Your name"
                    />
                  </label>
                  <label>
                    Email address
                    <input
                      name="email"
                      required
                      type="email"
                      autoComplete="email"
                      maxLength={200}
                      value={data.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="you@example.com"
                    />
                  </label>
                </>
              )}

              {step === 2 && (
                <>
                  <label>
                    Tell me about your plans
                    <textarea
                      maxLength={3000}
                      rows={5}
                      value={data.notes}
                      onChange={(e) => update("notes", e.target.value)}
                      placeholder="The feeling, the people, the details that matter…"
                    />
                  </label>
                  <div className={s.summary}>
                    <b>{data.type}</b>
                    <span>
                      {data.date} · {data.location}
                    </span>
                    <span>
                      {data.name} · {data.email}
                    </span>
                    <span>Package and pricing: to be discussed</span>
                  </div>
                  <label className={s.check}>
                    <input type="checkbox" required />
                    I understand dates and pricing are confirmed personally upon review.
                  </label>
                </>
              )}

              {error && <p role="alert">{error}</p>}
              <div className={s.actions}>
                {step > 0 ? (
                  <button type="button" onClick={() => setStep(step - 1)}>
                    ← Back
                  </button>
                ) : (
                  <span />
                )}
                <button className={s.primary} type="submit" disabled={!ready || submitting}>
                  {submitting ? "Sending inquiry..." : step === 2 ? "Send inquiry" : "Continue"}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
