import Stripe from "stripe";
import { appendDebug } from "@/lib/debug-log";

const zeroDecimalCurrencies = new Set([
  "bif",
  "clp",
  "djf",
  "gnf",
  "jpy",
  "kmf",
  "krw",
  "mga",
  "pyg",
  "rwf",
  "ugx",
  "vnd",
  "vuv",
  "xaf",
  "xof",
  "xpf",
]);

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(key);
}

/** Formats `STRIPE_PRICE_ID` for display (falls back to env override on failure). */
export async function getConsultingPriceDisplay(): Promise<string | null> {
  const priceId = process.env.STRIPE_PRICE_ID?.trim();
  if (!priceId || !process.env.STRIPE_SECRET_KEY?.trim()) {
    return null;
  }
  try {
    const stripe = getStripe();
    const price = await stripe.prices.retrieve(priceId);
    if (price.unit_amount == null || !price.currency) {
      return null;
    }
    const c = price.currency.toLowerCase();
    const amount =
      price.unit_amount / (zeroDecimalCurrencies.has(c) ? 1 : 100);
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: price.currency.toUpperCase(),
      maximumFractionDigits: zeroDecimalCurrencies.has(c) ? 0 : 2,
    }).format(amount);
    await appendDebug({
      sessionId: "e4b94e",
      runId: "pre",
      hypothesisId: "H3",
      location: "lib/stripe.ts:getConsultingPriceDisplay",
      message: "price retrieved",
      data: { ok: true },
      timestamp: Date.now(),
    });
    return formatted;
  } catch {
    await appendDebug({
      sessionId: "e4b94e",
      runId: "pre",
      hypothesisId: "H3",
      location: "lib/stripe.ts:getConsultingPriceDisplay",
      message: "price retrieve failed",
      data: { ok: false },
      timestamp: Date.now(),
    });
    return null;
  }
}

export function getSiteOrigin(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}
