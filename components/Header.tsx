"use client";

import Link from "next/link";
import { useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { Logo } from "./Logo";

const nav = [
  { label: "Work", href: "#work" },
  { label: "Studio", href: "#studio" },
  { label: "Contact", href: "#contact" },
];

function ClientPortalButton() {
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/client/dashboard" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-full bg-stone-900 flex items-center justify-center text-[10px] text-white font-medium tracking-wide overflow-hidden">
            {user.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span>{user.firstName?.[0] ?? "C"}</span>
            )}
          </div>
          <span className="hidden md:block text-[10px] uppercase tracking-[0.25em] text-stone-500 group-hover:text-stone-900 transition-colors">
            My Portal
          </span>
        </Link>
        <button
          onClick={() => signOut({ redirectUrl: "/client" })}
          className="text-[10px] uppercase tracking-[0.25em] text-stone-300 hover:text-stone-800 transition-colors"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/client"
      className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-stone-400 hover:text-stone-900 transition-colors group"
    >
      <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="8" cy="5" r="2.5" />
        <path d="M2.5 13.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
      </svg>
      <span className="hidden md:block">Client Portal</span>
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto mt-4 max-w-7xl px-4 md:px-8">
        <div className="flex h-16 items-center justify-between rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-5 shadow-[0_18px_50px_rgba(56,40,27,0.08)] backdrop-blur-xl md:px-7">
          <Link href="/" className="flex items-center gap-3">
            <Logo className="h-9 w-9" />
            <span className="text-xs font-light tracking-[0.28em] uppercase text-stone-900">
              Gao Architect
            </span>
          </Link>

          <div className="hidden items-center gap-10 md:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[11px] uppercase tracking-[0.28em] text-stone-500 transition-colors hover:text-stone-900"
              >
                {item.label}
              </Link>
            ))}
            <div className="h-4 w-px bg-[color:var(--border)]" />
            <ClientPortalButton />
          </div>

          <div className="flex items-center gap-4 md:hidden">
            <ClientPortalButton />
            <button
              type="button"
              className="-mr-2 p-2 text-stone-600"
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {open ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="mx-auto mt-2 max-w-7xl px-4 md:hidden md:px-8">
          <div className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-6 py-4 shadow-[0_18px_50px_rgba(56,40,27,0.08)] backdrop-blur-xl">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-3 text-xs uppercase tracking-[0.28em] text-stone-600"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-[color:var(--border)] pt-4">
              <Link
                href="/client"
                className="block py-2 text-xs uppercase tracking-[0.28em] text-stone-400"
                onClick={() => setOpen(false)}
              >
                Client Portal
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
