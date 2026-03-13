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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-stone-100">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 md:px-10">
        <Link href="/" className="flex items-center gap-3">
          <Logo className="h-9 w-9" />
          <span className="text-xs font-light tracking-[0.25em] uppercase text-stone-900">
            Gao Architect
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs tracking-widest uppercase text-stone-500 hover:text-stone-900 transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <div className="w-px h-4 bg-stone-200" />
          <ClientPortalButton />
        </div>

        <div className="md:hidden flex items-center gap-4">
          <ClientPortalButton />
          <button
            type="button"
            className="p-2 -mr-2 text-stone-600"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-stone-100 bg-white px-6 py-4">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block py-3 text-xs tracking-widest uppercase text-stone-600"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="border-t border-stone-100 mt-2 pt-4">
            <Link
              href="/client"
              className="block py-2 text-xs tracking-widest uppercase text-stone-400"
              onClick={() => setOpen(false)}
            >
              Client Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
