"use client";

import { usePathname } from "next/navigation";
import { LandingNavbar } from "@/components/layout/landing-navbar";
import { LandingFooter } from "@/components/layout/landing-footer";
import { CreatorNavbar } from "@/components/layout/creator-navbar";

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/creator/dashboard");

  if (isDashboard) {
    return (
      <div className="min-h-screen flex flex-col bg-surface-50">
        <CreatorNavbar />
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <LandingNavbar />
      <main className="flex-1">{children}</main>
      <LandingFooter />
    </div>
  );
}
