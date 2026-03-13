import Link from "next/link";
import { Logo } from "@/components/Logo";
import { SignOutButton } from "@/components/SignOutButton";

const phases = [
  { name: "Pre-design", done: true, date: "Jan 15, 2026" },
  { name: "Schematic Design", done: true, date: "Feb 20, 2026" },
  { name: "Design Development", done: false, date: "Apr 10, 2026", current: true },
  { name: "Construction Documents", done: false, date: "Jun 1, 2026" },
  { name: "Construction Admin", done: false, date: "TBD" },
];

const invoices = [
  { id: "INV-001", desc: "Pre-design retainer", amount: "$5,000", status: "paid", date: "Jan 10" },
  { id: "INV-002", desc: "Schematic Design", amount: "$8,000", status: "paid", date: "Feb 15" },
  { id: "INV-003", desc: "Design Development – Phase 1", amount: "$6,500", status: "due", date: "Apr 1" },
];

const updates = [
  {
    date: "Mar 12, 2026",
    title: "Permit submitted to city",
    body: "We've submitted the building permit application to the city of Palo Alto. Typical review is 6–8 weeks.",
  },
  {
    date: "Feb 28, 2026",
    title: "Structural review complete",
    body: "The structural engineer has signed off on the lateral system. We're on track for CD phase in June.",
  },
  {
    date: "Feb 10, 2026",
    title: "Interior selections confirmed",
    body: "Tile, hardware, and cabinetry selections are finalized. Specifications will be included in the CD set.",
  },
];

const comments = [
  {
    author: "Sarah Chen",
    initials: "SC",
    time: "Mar 12 · 3:41 pm",
    text: "Can we discuss the kitchen island size on our next call? I'd like to explore a slightly wider version.",
    isGao: false,
  },
  {
    author: "Gao Architect",
    initials: "GA",
    time: "Mar 12 · 4:10 pm",
    text: "Absolutely — I'll pull up a few options before our Thursday meeting. We have some room to work with.",
    isGao: true,
  },
];

const galleryImages = [
  "/projects/courtyard-house/ext-front-far.jpg",
  "/projects/courtyard-house/ext-courtyard.jpg",
  "/projects/courtyard-house/int-living-room.jpg",
  "/projects/courtyard-house/int-kitchen.jpg",
  "/projects/courtyard-house/int-dining-room.jpg",
  "/projects/courtyard-house/int-master-bedroom-01.jpg",
];

export default function ProjectDetail() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-stone-100 bg-white sticky top-0 z-10">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 md:px-10">
          <Link href="/" className="flex items-center gap-3">
            <Logo className="h-7 w-7" />
            <span className="text-xs font-light tracking-[0.25em] uppercase text-stone-900">
              Gao Architect
            </span>
          </Link>
          <div className="flex items-center gap-8">
            <Link
              href="/client/dashboard"
              className="text-[10px] uppercase tracking-[0.25em] text-stone-400 hover:text-stone-800 transition-colors"
            >
              ← Dashboard
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Hero image */}
      <div className="w-full h-[45vh] overflow-hidden bg-stone-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/projects/courtyard-house/ext-back-dawn-close.jpg"
          alt="Courtyard House"
          className="w-full h-full object-cover"
        />
      </div>

      <main className="flex-1 mx-auto w-full max-w-5xl px-6 md:px-10 py-16">

        {/* Project header */}
        <div className="border-b border-stone-100 pb-12 mb-14">
          <p className="text-[10px] uppercase tracking-[0.35em] text-stone-400 mb-4">
            Residential · Palo Alto, California
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <h1
              className="text-4xl md:text-5xl text-stone-900 leading-tight"
              style={{ fontFamily: "Georgia, serif", fontWeight: 400, letterSpacing: "-0.02em" }}
            >
              Courtyard House
            </h1>
            {/* Phase bar — large */}
            <div className="md:w-72 flex-shrink-0">
              <div className="flex gap-1 mb-2.5">
                {phases.map((phase, idx) => (
                  <div
                    key={idx}
                    className={`h-0.5 flex-1 transition-colors ${
                      phase.done
                        ? "bg-stone-900"
                        : phase.current
                        ? "bg-[var(--gao-red)]"
                        : "bg-stone-100"
                    }`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-stone-500 tracking-wide">
                <span className="font-medium text-stone-800">Design Development</span>
                <span className="text-stone-300 mx-1.5">·</span>
                Phase 3 of 5
              </p>
            </div>
          </div>
        </div>

        {/* Main two-column layout */}
        <div className="grid md:grid-cols-[1fr_2fr] gap-16 xl:gap-24">

          {/* Left sidebar */}
          <div className="space-y-14">

            {/* Phase timeline */}
            <section>
              <p className="text-[10px] uppercase tracking-[0.35em] text-stone-400 mb-7">
                Project Phase
              </p>
              <div className="space-y-0">
                {phases.map((phase, idx) => (
                  <div key={phase.name} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ring-2 ring-offset-2 ${
                        phase.done
                          ? "bg-stone-900 ring-stone-900"
                          : phase.current
                          ? "bg-[var(--gao-red)] ring-[var(--gao-red)]"
                          : "bg-stone-200 ring-stone-200"
                      }`} />
                      {idx < phases.length - 1 && (
                        <div className={`w-px flex-1 my-1 ${phase.done ? "bg-stone-200" : "bg-stone-100"}`} style={{ minHeight: "28px" }} />
                      )}
                    </div>
                    <div className="pb-5">
                      <p className={`text-sm leading-none ${
                        phase.done
                          ? "text-stone-400 line-through decoration-stone-300"
                          : phase.current
                          ? "text-stone-900 font-medium"
                          : "text-stone-300"
                      }`}>
                        {phase.name}
                        {phase.current && (
                          <span className="ml-2 text-[10px] uppercase tracking-[0.25em] text-[var(--gao-red)] font-normal no-underline" style={{ textDecoration: "none" }}>
                            Now
                          </span>
                        )}
                      </p>
                      <p className={`text-xs mt-1 ${phase.done ? "text-stone-300" : phase.current ? "text-stone-400" : "text-stone-200"}`}>
                        {phase.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Billing */}
            <section>
              <p className="text-[10px] uppercase tracking-[0.35em] text-stone-400 mb-7">
                Billing
              </p>
              <div className="space-y-5">
                {invoices.map((inv) => (
                  <div key={inv.id} className="flex items-start justify-between gap-3 pb-5 border-b border-stone-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-stone-800 truncate">{inv.desc}</p>
                      <p className="text-[10px] text-stone-400 mt-0.5 tracking-wide">{inv.id} · {inv.date}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm text-stone-900 tabular-nums">{inv.amount}</p>
                      <p className={`text-[10px] uppercase tracking-[0.2em] mt-0.5 ${
                        inv.status === "paid" ? "text-stone-300" : "text-[var(--gao-red)]"
                      }`}>
                        {inv.status === "paid" ? "Paid" : "Due →"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Contact */}
            <section>
              <p className="text-[10px] uppercase tracking-[0.35em] text-stone-400 mb-7">
                Reach Gao
              </p>
              <div className="space-y-4">
                <a
                  href="mailto:liusiyu0224@gmail.com"
                  className="flex items-center justify-between text-sm text-stone-700 hover:text-stone-900 transition-colors border-b border-stone-50 pb-4 group"
                >
                  <span>Email</span>
                  <span className="text-stone-300 group-hover:text-stone-600 transition-colors text-xs">→</span>
                </a>
                <a
                  href="tel:+1234567890"
                  className="flex items-center justify-between text-sm text-stone-700 hover:text-stone-900 transition-colors border-b border-stone-50 pb-4 group"
                >
                  <span>Phone</span>
                  <span className="text-stone-300 group-hover:text-stone-600 transition-colors text-xs">→</span>
                </a>
                <a
                  href="#"
                  className="flex items-center justify-between text-sm text-stone-700 hover:text-stone-900 transition-colors group"
                >
                  <span>Schedule a call</span>
                  <span className="text-stone-300 group-hover:text-stone-600 transition-colors text-xs">→</span>
                </a>
              </div>
            </section>
          </div>

          {/* Right main area */}
          <div className="space-y-16">

            {/* Project updates */}
            <section>
              <p className="text-[10px] uppercase tracking-[0.35em] text-stone-400 mb-8">
                Updates from Gao Architect
              </p>
              <div className="space-y-10">
                {updates.map((update) => (
                  <div key={update.title}>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-stone-400 mb-2">
                      {update.date}
                    </p>
                    <p
                      className="text-lg text-stone-900 mb-3"
                      style={{ fontFamily: "Georgia, serif", fontWeight: 400 }}
                    >
                      {update.title}
                    </p>
                    <p className="text-sm text-stone-500 leading-relaxed">{update.body}</p>
                    <div className="h-px bg-stone-50 mt-8" />
                  </div>
                ))}
              </div>
            </section>

            {/* Photo gallery strip */}
            <section>
              <p className="text-[10px] uppercase tracking-[0.35em] text-stone-400 mb-6">
                Design Gallery
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {galleryImages.map((src, i) => (
                  <div
                    key={src}
                    className={`overflow-hidden bg-stone-100 ${i === 0 ? "col-span-2 row-span-2" : ""}`}
                    style={{ aspectRatio: i === 0 ? "16/10" : "4/3" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt=""
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link
                  href="/work/courtyard-house"
                  className="text-[10px] uppercase tracking-[0.25em] text-stone-400 hover:text-stone-900 transition-colors border-b border-stone-200 pb-0.5"
                >
                  View full project →
                </Link>
              </div>
            </section>

            {/* Comments */}
            <section>
              <p className="text-[10px] uppercase tracking-[0.35em] text-stone-400 mb-8">
                Comments
              </p>
              <div className="space-y-6 mb-8">
                {comments.map((c) => (
                  <div
                    key={c.time}
                    className={`flex gap-3 ${c.isGao ? "flex-row-reverse" : ""}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-medium tracking-wide ${
                      c.isGao ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-500"
                    }`}>
                      {c.initials}
                    </div>
                    <div className={`flex-1 max-w-[80%] ${c.isGao ? "items-end flex flex-col" : ""}`}>
                      <p className="text-[10px] text-stone-400 mb-2">{c.author} · {c.time}</p>
                      <div className={`text-sm leading-relaxed px-4 py-3 ${
                        c.isGao
                          ? "bg-stone-900 text-white"
                          : "bg-stone-50 text-stone-700"
                      }`}>
                        {c.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comment input */}
              <div className="border border-stone-150 rounded-sm overflow-hidden" style={{ borderColor: "#e7e5e4" }}>
                <textarea
                  rows={3}
                  placeholder="Leave a comment or question for Gao…"
                  className="w-full text-sm text-stone-900 placeholder-stone-300 focus:outline-none resize-none bg-white px-5 pt-4 pb-2"
                />
                <div className="flex items-center justify-between px-5 pb-4 pt-2 border-t border-stone-100">
                  <p className="text-[10px] text-stone-300 tracking-wide">
                    Gao typically responds within 24 hours
                  </p>
                  <button className="text-[10px] uppercase tracking-[0.25em] bg-stone-900 text-white px-5 py-2.5 hover:bg-[var(--gao-red)] transition-colors duration-300">
                    Send
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-stone-100 py-6 mt-12">
        <div className="mx-auto max-w-5xl px-6 md:px-10 flex items-center justify-between">
          <p className="text-xs text-stone-300">© {new Date().getFullYear()} Gao Architect</p>
          <Link href="/" className="text-[10px] uppercase tracking-[0.25em] text-stone-300 hover:text-stone-500 transition-colors">
            Main site
          </Link>
        </div>
      </footer>
    </div>
  );
}
