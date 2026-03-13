"use client";

import { useClerk } from "@clerk/nextjs";

export function SignOutButton() {
  const { signOut } = useClerk();
  return (
    <button
      onClick={() => signOut({ redirectUrl: "/" })}
      className="text-[10px] uppercase tracking-[0.25em] text-stone-400 hover:text-stone-800 transition-colors"
    >
      Sign out
    </button>
  );
}
