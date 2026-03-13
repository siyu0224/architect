"use client";

import { usePathname } from "next/navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/client" || pathname?.startsWith("/client/signup");

  if (isAuthPage) {
    return (
      <div className="fixed inset-0 z-[100] flex">
        {children}
      </div>
    );
  }

  return <>{children}</>;
}
