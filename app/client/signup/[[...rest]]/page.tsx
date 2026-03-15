import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { clerkPortalAppearance } from "@/lib/clerk-theme";

export default function ClientSignUp() {
  return (
    <div className="flex w-full h-full min-h-screen">

      {/* Left half — photo */}
      <div className="hidden lg:block w-1/2 relative shrink-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.pexels.com/photos/10610731/pexels-photo-10610731.jpeg?cs=srgb&dl=pexels-alleksana-10610731.jpg&fm=jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-14 left-12 right-12">
          <p className="text-white/40 text-[10px] uppercase tracking-[0.35em] mb-4">
            Client Portal
          </p>
          <p
            className="text-white text-2xl leading-snug"
            style={{ fontFamily: "Georgia, serif", fontWeight: 400 }}
          >
            Thoughtful spaces,<br />lasting relationships.
          </p>
        </div>
      </div>

      {/* Right half — gradient mesh */}
      <div className="w-full lg:w-1/2 flex flex-col min-h-screen relative overflow-hidden">

        {/* Base background */}
        <div className="absolute inset-0" style={{ background: "#e8e0d5" }} />

        {/* Gradient mesh blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute" style={{
            top: "-10%", right: "-10%",
            width: "65%", height: "65%",
            borderRadius: "50%",
            background: "radial-gradient(circle, #c8a882 0%, transparent 70%)",
            filter: "blur(48px)",
            opacity: 0.9,
          }} />
          <div className="absolute" style={{
            top: "25%", left: "-15%",
            width: "60%", height: "55%",
            borderRadius: "50%",
            background: "radial-gradient(circle, #b8866a 0%, transparent 70%)",
            filter: "blur(56px)",
            opacity: 0.6,
          }} />
          <div className="absolute" style={{
            top: "30%", left: "20%",
            width: "70%", height: "50%",
            borderRadius: "50%",
            background: "radial-gradient(circle, #d4b896 0%, transparent 70%)",
            filter: "blur(40px)",
            opacity: 0.7,
          }} />
          <div className="absolute" style={{
            bottom: "-10%", right: "-5%",
            width: "55%", height: "55%",
            borderRadius: "50%",
            background: "radial-gradient(circle, #9a7a62 0%, transparent 70%)",
            filter: "blur(60px)",
            opacity: 0.5,
          }} />
          <div className="absolute" style={{
            bottom: "5%", left: "5%",
            width: "45%", height: "40%",
            borderRadius: "50%",
            background: "radial-gradient(circle, #c9aa88 0%, transparent 70%)",
            filter: "blur(50px)",
            opacity: 0.6,
          }} />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full min-h-screen">

          {/* Top bar */}
          <div className="flex items-center justify-between px-10 py-7 shrink-0">
            <Link href="/" className="flex items-center gap-3">
              <Logo className="h-7 w-7" />
              <span className="text-[11px] font-light tracking-[0.25em] uppercase text-stone-800">
                Gao Architect
              </span>
            </Link>
            <Link
              href="/"
              className="text-[10px] tracking-[0.25em] uppercase text-stone-500 hover:text-stone-900 transition-colors"
            >
              ← Main site
            </Link>
          </div>

          {/* Centered glass card */}
          <div className="flex-1 flex items-center justify-center px-8 py-12">
            <div className="w-full max-w-sm">
              <p className="text-[10px] uppercase tracking-[0.35em] text-stone-600/70 mb-3">
                Client Portal
              </p>
              <h1
                className="text-[2.25rem] text-stone-900 leading-tight mb-8"
                style={{ fontFamily: "Georgia, serif", fontWeight: 400, letterSpacing: "-0.01em" }}
              >
                Join the portal.
              </h1>

              {/* Liquid glass card */}
              <div
                style={{
                  background: "rgba(255,255,255,0.28)",
                  backdropFilter: "blur(48px) saturate(160%)",
                  WebkitBackdropFilter: "blur(48px) saturate(160%)",
                  borderRadius: "24px",
                  border: "1px solid rgba(255,255,255,0.55)",
                  boxShadow: "0 8px 48px rgba(100,70,40,0.12), inset 0 1.5px 0 rgba(255,255,255,0.75), inset 0 -1px 0 rgba(255,255,255,0.1)",
                  overflow: "hidden",
                }}
              >
                <SignUp appearance={clerkPortalAppearance} />
              </div>

              {/* Sign in link */}
              <p className="text-center mt-5 text-[11px] text-stone-500">
                Already have an account?{" "}
                <Link
                  href="/client"
                  className="text-stone-800 underline underline-offset-4 hover:text-stone-900 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
