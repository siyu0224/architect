import Link from "next/link";
import { redirect } from "next/navigation";
import { getStripe } from "@/lib/stripe";

export const metadata = {
  title: "Payment status | Gao Architect",
  description: "Consultation payment confirmation",
};

export default async function PaymentReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  if (!session_id) {
    redirect("/#consulting");
  }

  let paid = false;
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(session_id);
    paid = session.payment_status === "paid" && session.status === "complete";
  } catch {
    paid = false;
  }

  if (paid) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[color:var(--background)] px-6 py-16">
        <div className="w-full max-w-md border border-[color:var(--border)] border-l-[3px] border-l-[color:var(--accent)] bg-[color:var(--surface-strong)] px-8 py-12 text-center shadow-[0_1px_0_rgba(35,28,22,0.04)]">
          <p className="text-[10px] uppercase tracking-[0.38em] text-stone-400">
            Gao Architect
          </p>
          <h1
            className="mt-6 text-2xl text-stone-900 md:text-[1.75rem]"
            style={{ fontFamily: "var(--font-serif), Georgia, serif", letterSpacing: "-0.02em" }}
          >
            Payment received
          </h1>
          <p className="mt-5 text-sm leading-7 text-stone-600">
            Thank you. We&apos;ll email you shortly to schedule your introductory
            consultation.
          </p>
          <Link
            href="/#consulting"
            className="mt-10 inline-block border border-stone-900 bg-stone-900 px-8 py-3.5 text-sm font-medium tracking-[0.18em] text-white transition hover:bg-stone-800"
          >
            Back to site
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[color:var(--background)] px-6 py-16">
      <div className="w-full max-w-md border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-8 py-12 text-center">
        <p className="text-[10px] uppercase tracking-[0.38em] text-stone-400">
          Gao Architect
        </p>
        <h1
          className="mt-6 text-xl text-stone-900"
          style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
        >
          Payment not completed
        </h1>
        <p className="mt-4 text-sm leading-7 text-stone-600">
          We couldn&apos;t confirm a successful payment for this session. If you were
          charged, contact the studio with your receipt; otherwise you can try
          again from the consulting section.
        </p>
        <Link
          href="/#consulting"
          className="mt-8 inline-block border border-stone-900 px-8 py-3.5 text-sm font-medium tracking-[0.18em] text-stone-900 transition hover:bg-stone-900 hover:text-white"
        >
          Back to consulting
        </Link>
      </div>
    </div>
  );
}
