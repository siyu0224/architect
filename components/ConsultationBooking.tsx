"use client";

import { loadStripe, type StripeEmbeddedCheckout } from "@stripe/stripe-js";
import { useCallback, useLayoutEffect, useRef, useState } from "react";

type Props = {
  paymentsConfigured: boolean;
  stripePublishableKey: string | null;
  /** Shown on the card only; set NEXT_PUBLIC_CONSULTING_PRICE_DISPLAY (e.g. US $500) to match your Stripe price. */
  priceDisplay?: string | null;
};

const highlights = [
  {
    title: "Site & vision",
    body: "We discuss location, scope, and how you want the home to feel day to day.",
  },
  {
    title: "Process fit",
    body: "A clear overview of how the studio works from concept through construction.",
  },
  {
    title: "Next steps",
    body: "After checkout we email you to find a time that works—phone or video.",
  },
];

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.5 10.5 8.2 13.2 14.5 6.9"
      />
    </svg>
  );
}

export function ConsultationBooking({
  paymentsConfigured,
  stripePublishableKey,
  priceDisplay,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefillEmail, setPrefillEmail] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const checkoutRef = useRef<StripeEmbeddedCheckout | null>(null);
  /** Host node from callback ref — state ensures layout effect runs after the mount div commits. */
  const [checkoutHost, setCheckoutHost] = useState<HTMLDivElement | null>(null);

  const teardownCheckout = useCallback(() => {
    void fetch("/api/debug-log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "e4b94e",
      },
      body: JSON.stringify({
        sessionId: "e4b94e",
        hypothesisId: "H5",
        location: "ConsultationBooking.tsx:teardownCheckout",
        message: "teardown called",
        data: {
          hasCheckoutRef: Boolean(checkoutRef.current),
          hasClientSecret: Boolean(clientSecret),
        },
        timestamp: Date.now(),
        runId: "post-fix",
      }),
    }).catch(() => {});

    checkoutRef.current?.destroy();
    checkoutRef.current = null;
    setClientSecret(null);
  }, [clientSecret]);

  useLayoutEffect(() => {
    // #region agent log
    fetch("/api/debug-log", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "e4b94e" },
      body: JSON.stringify({
        sessionId: "e4b94e",
        hypothesisId: "H1",
        location: "ConsultationBooking.tsx:useLayoutEffect:entry",
        message: "embed checkout effect",
        data: {
          hasClientSecret: Boolean(clientSecret),
          hasHostNode: Boolean(checkoutHost),
          hasPublishableKey: Boolean(stripePublishableKey),
        },
        timestamp: Date.now(),
        runId: "post-fix",
      }),
    }).catch(() => {});
    // #endregion
    if (!clientSecret || !stripePublishableKey || !checkoutHost) return;

    let cancelled = false;
    const host = checkoutHost;

    (async () => {
      const stripe = await loadStripe(stripePublishableKey);
      if (!stripe || cancelled) return;

      const checkout = await stripe.initEmbeddedCheckout({
        clientSecret,
        onComplete: () => {
          void fetch("/api/debug-log", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Debug-Session-Id": "e4b94e",
            },
            body: JSON.stringify({
              sessionId: "e4b94e",
              hypothesisId: "H10",
              location: "ConsultationBooking.tsx:initEmbeddedCheckout:onComplete",
              message: "onComplete called",
              timestamp: Date.now(),
              runId: "post-fix",
            }),
          }).catch(() => {});
        },
        onAnalyticsEvent: (event) => {
          // onAnalyticsEvent is part of the Embedded Checkout SDK.
          void fetch("/api/debug-log", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Debug-Session-Id": "e4b94e",
            },
            body: JSON.stringify({
              sessionId: "e4b94e",
              hypothesisId: "H10",
              location: "ConsultationBooking.tsx:initEmbeddedCheckout:onAnalyticsEvent",
              message: "analytics event",
              data: {
                eventType: event.eventType,
              },
              timestamp: Date.now(),
              runId: "post-fix",
            }),
          }).catch(() => {});
        },
      });

      if (cancelled) {
        checkout.destroy();
        return;
      }

      checkoutRef.current = checkout;
      checkout.mount(host);
      // #region agent log
      fetch("/api/debug-log", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "e4b94e" },
        body: JSON.stringify({
          sessionId: "e4b94e",
          hypothesisId: "H1",
          location: "ConsultationBooking.tsx:useLayoutEffect:afterMount",
          message: "embedded checkout mounted",
          data: {
            ok: true,
            hostRect: host?.getBoundingClientRect
              ? {
                  width: host.getBoundingClientRect().width,
                  height: host.getBoundingClientRect().height,
                }
              : null,
          },
          timestamp: Date.now(),
          runId: "post-fix",
        }),
      }).catch(() => {});
      // #endregion
    })().catch((e) => {
      console.error("Embedded checkout error:", e);
      // #region agent log
      fetch("/api/debug-log", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "e4b94e" },
        body: JSON.stringify({
          sessionId: "e4b94e",
          hypothesisId: "H1",
          location: "ConsultationBooking.tsx:useLayoutEffect:catch",
          message: "embedded checkout failed",
          data: { errName: e instanceof Error ? e.name : "unknown" },
          timestamp: Date.now(),
          runId: "post-fix",
        }),
      }).catch(() => {});
      // #endregion
      setError("Could not load payment form. Please try again.");
      setClientSecret(null);
    });

    return () => {
      cancelled = true;
      void fetch("/api/debug-log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "e4b94e",
        },
        body: JSON.stringify({
          sessionId: "e4b94e",
          hypothesisId: "H5",
          location: "ConsultationBooking.tsx:useLayoutEffect:cleanup",
          message: "cleanup destroyed checkout",
          data: { hasCheckoutRef: Boolean(checkoutRef.current) },
          timestamp: Date.now(),
          runId: "post-fix",
        }),
      }).catch(() => {});
      checkoutRef.current?.destroy();
      checkoutRef.current = null;
    };
  }, [clientSecret, stripePublishableKey, checkoutHost]);

  async function startCheckout() {
    setLoading(true);
    setError(null);
    teardownCheckout();
    fetch("/api/debug-log", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "e4b94e" },
      body: JSON.stringify({
        sessionId: "e4b94e",
        hypothesisId: "H2",
        location: "ConsultationBooking.tsx:startCheckout:entry",
        message: "startCheckout clicked",
        data: { hasEmail: Boolean(prefillEmail.trim()) },
        timestamp: Date.now(),
        runId: "pre",
      }),
    }).catch(() => {});
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerEmail: prefillEmail.trim() || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        clientSecret?: string;
        error?: string;
      };
      if (!res.ok) {
        // #region agent log
        fetch("/api/debug-log", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "e4b94e" },
          body: JSON.stringify({
            sessionId: "e4b94e",
            hypothesisId: "H2",
            location: "ConsultationBooking.tsx:startCheckout",
            message: "checkout API error response",
            data: { status: res.status },
            timestamp: Date.now(),
            runId: "pre",
          }),
        }).catch(() => {});
        // #endregion
        setError(data.error || "Checkout could not be started.");
        return;
      }
      if (data.clientSecret) {
        // #region agent log
        fetch("/api/debug-log", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "e4b94e" },
          body: JSON.stringify({
            sessionId: "e4b94e",
            hypothesisId: "H2",
            location: "ConsultationBooking.tsx:startCheckout",
            message: "checkout API ok",
            data: { status: res.status, hasClientSecret: true },
            timestamp: Date.now(),
            runId: "pre",
          }),
        }).catch(() => {});
        // #endregion
        setClientSecret(data.clientSecret);
        return;
      }
      // #region agent log
      fetch("/api/debug-log", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "e4b94e" },
        body: JSON.stringify({
          sessionId: "e4b94e",
          hypothesisId: "H2",
          location: "ConsultationBooking.tsx:startCheckout",
          message: "checkout API missing clientSecret",
          data: { status: res.status },
          timestamp: Date.now(),
          runId: "pre",
        }),
      }).catch(() => {});
      // #endregion
      setError("Checkout could not be started.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!paymentsConfigured) {
    return (
      <div
        id="consulting"
        className="scroll-mt-28 border border-[color:var(--border)] border-l-[3px] border-l-[color:var(--accent-soft)] bg-[color:var(--surface-strong)] px-6 py-8 md:px-10 md:py-10"
      >
        <p className="text-[10px] uppercase tracking-[0.38em] text-stone-400">
          Consulting
        </p>
        <h3
          className="mt-5 text-xl text-stone-800 md:text-2xl"
          style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
        >
          Book a paid introductory session
        </h3>
        <p className="mt-4 max-w-lg text-sm leading-7 text-stone-500">
          When Stripe is fully configured (secret key, publishable key, and price),
          visitors complete payment in a secure form embedded on this page.
        </p>
        <p className="mt-6 text-xs text-stone-400">
          <a
            href="#inquiry-form"
            className="text-[color:var(--accent)] underline underline-offset-4 hover:text-stone-800"
          >
            Prefer to write first?
          </a>
          <span className="text-stone-300"> · </span>
          Use the inquiry form below.
        </p>
      </div>
    );
  }

  return (
    <div
      id="consulting"
      className="scroll-mt-28 border border-[color:var(--border)] border-l-[3px] border-l-[color:var(--accent)] bg-gradient-to-br from-[color:var(--surface-strong)] to-[color:var(--surface)] px-6 py-8 shadow-[0_1px_0_rgba(35,28,22,0.04)] md:px-10 md:py-10"
    >
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.38em] text-stone-400">
            Consulting
          </p>
          <h3
            className="mt-4 max-w-xl text-2xl text-stone-900 md:text-[1.75rem] md:leading-snug"
            style={{ fontFamily: "var(--font-serif), Georgia, serif", letterSpacing: "-0.02em" }}
          >
            Introductory appointment
          </h3>
          <p className="mt-4 max-w-lg text-sm leading-7 text-stone-600">
            Secure your first conversation with the studio. Enter payment details in the
            secure form below (powered by Stripe); we follow up by email to schedule.
          </p>
        </div>
        {priceDisplay ? (
          <div className="mt-2 shrink-0 md:mt-10 md:text-right">
            <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400">Session fee</p>
            <p className="mt-2 font-light text-3xl tabular-nums text-stone-900 md:text-4xl">
              {priceDisplay}
            </p>
            <p className="mt-1 text-xs text-stone-400">One-time · before taxes</p>
          </div>
        ) : null}
      </div>

      <ul className="mt-8 space-y-4 border-t border-[color:var(--border)] pt-8">
        {highlights.map((item) => (
          <li key={item.title} className="flex gap-4">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-[color:var(--accent)]">
              <CheckIcon className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-sm font-medium text-stone-800">{item.title}</p>
              <p className="mt-1 text-sm leading-6 text-stone-500">{item.body}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 border-t border-[color:var(--border)] pt-8">
        <label htmlFor="consult-email" className="mb-2 block text-sm font-medium text-stone-700">
          Email for scheduling{" "}
          <span className="font-normal text-stone-400">(optional)</span>
        </label>
        <input
          id="consult-email"
          name="consult-email"
          type="email"
          autoComplete="email"
          value={prefillEmail}
          onChange={(e) => setPrefillEmail(e.target.value)}
          disabled={Boolean(clientSecret)}
          placeholder="you@example.com"
          className="w-full max-w-md border-b border-[color:var(--border)] bg-transparent px-0 py-3 text-stone-900 placeholder-stone-400 outline-none transition focus:border-stone-900 disabled:opacity-50"
        />
        <p className="mt-2 text-xs text-stone-400">
          Pre-fills checkout so confirmations reach the right inbox.
        </p>
      </div>

      {error && (
        <p className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}

      {!clientSecret ? (
        <>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={startCheckout}
              disabled={loading || !stripePublishableKey}
              className="inline-flex w-full items-center justify-center border border-stone-900 bg-stone-900 px-8 py-3.5 text-sm font-medium tracking-[0.18em] text-white transition hover:bg-stone-800 disabled:opacity-40 sm:w-auto"
            >
              {loading ? "Preparing secure form…" : "Continue to payment"}
            </button>
            <a
              href="#inquiry-form"
              className="text-center text-sm text-stone-500 underline underline-offset-4 transition hover:text-stone-900 sm:text-left"
            >
              Not ready to pay — send an inquiry instead
            </a>
          </div>
          {!stripePublishableKey ? (
            <p className="mt-4 text-sm text-amber-900/80">
              Add <code className="text-xs">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to
              your environment to enable the payment form.
            </p>
          ) : null}
        </>
      ) : (
        <div className="mt-8 space-y-4">
          <div className="flex flex-col gap-3 border-t border-[color:var(--border)] pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-stone-800">Secure payment</p>
            <button
              type="button"
              onClick={teardownCheckout}
              className="text-sm text-stone-500 underline underline-offset-4 hover:text-stone-900"
            >
              Cancel and close form
            </button>
          </div>
          <div
            ref={setCheckoutHost}
            className="min-h-[480px] w-full overflow-hidden rounded-sm border border-[color:var(--border)] bg-white"
          />
        </div>
      )}

      <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[color:var(--border)] pt-6 text-xs text-stone-400">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1 w-1 rounded-full bg-[color:var(--accent-soft)]" aria-hidden />
          Cards, Apple Pay &amp; Google Pay via Stripe
        </span>
        <span className="hidden sm:inline text-stone-300">·</span>
        <span>Apple Pay in Safari (iOS 17+)</span>
        <span className="hidden sm:inline text-stone-300">·</span>
        <span>Subject to studio availability</span>
      </p>
    </div>
  );
}
