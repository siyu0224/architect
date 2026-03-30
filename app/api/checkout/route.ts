import { getSiteOrigin, getStripe } from "@/lib/stripe";
import { appendDebug } from "@/lib/debug-log";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!priceId?.trim()) {
    return NextResponse.json(
      { error: "Payments are not configured (missing STRIPE_PRICE_ID)" },
      { status: 503 }
    );
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Payments are not configured (missing STRIPE_SECRET_KEY)" },
      { status: 503 }
    );
  }

  let customerEmail: string | undefined;
  try {
    const body = (await request.json().catch(() => ({}))) as {
      customerEmail?: string;
    };
    if (body.customerEmail && typeof body.customerEmail === "string") {
      const e = body.customerEmail.trim().toLowerCase();
      if (e.length > 3 && e.includes("@")) customerEmail = e;
    }
  } catch {
    // optional body
  }

  try {
    const stripe = getStripe();
    const origin = getSiteOrigin();
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      mode: "payment",
      line_items: [{ price: priceId.trim(), quantity: 1 }],
      return_url: `${origin}/payment/return?session_id={CHECKOUT_SESSION_ID}`,
      customer_email: customerEmail,
      allow_promotion_codes: true,
      billing_address_collection: "required",
      metadata: {
        site: "gao-architect",
      },
      custom_text: {
        submit: {
          message:
            "You’ll return to our site to confirm. We’ll email you to schedule your conversation.",
        },
      },
    });

    if (!session.client_secret) {
      await appendDebug({
        sessionId: "e4b94e",
        runId: "pre",
        hypothesisId: "H2",
        location: "api/checkout/route.ts",
        message: "session missing client_secret",
        data: { ok: false },
        timestamp: Date.now(),
      });
      return NextResponse.json(
        { error: "Could not create checkout session" },
        { status: 500 }
      );
    }

    await appendDebug({
      sessionId: "e4b94e",
      runId: "pre",
      hypothesisId: "H2",
      location: "api/checkout/route.ts",
      message: "session created",
      data: { ok: true, hasClientSecret: true },
      timestamp: Date.now(),
    });
    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (e) {
    console.error("Stripe checkout error:", e);
    await appendDebug({
      sessionId: "e4b94e",
      runId: "pre",
      hypothesisId: "H2",
      location: "api/checkout/route.ts",
      message: "stripe create threw",
      data: { ok: false },
      timestamp: Date.now(),
    });
    return NextResponse.json({ error: "Could not start checkout" }, { status: 500 });
  }
}
