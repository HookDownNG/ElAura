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

  // App / Studio pages for logged-in creators
  const isAppPage =
    pathname?.startsWith("/creator/dashboard") ||
    pathname?.startsWith("/creator/packages") ||
    pathname?.startsWith("/creator/storefront") ||
    pathname?.startsWith("/creator/onboarding") ||
    pathname?.startsWith("/creator/settings");

  // Clean full-screen auth/join flow
  const isJoinFlow = pathname === "/creator/join";

  if (isAppPage) {
    return (
      <div className="min-h-screen flex flex-col bg-surface-50">
        <CreatorNavbar />
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  if (isJoinFlow) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  // Public Creator Storefront Page (/creator/[username])
  const isPublicStorefront =
    pathname?.startsWith("/creator/") &&
    pathname !== "/creator";

  if (isPublicStorefront) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  // Public Creator Marketing Landing Page (/creator)
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <LandingNavbar />
      <main className="flex-1">{children}</main>
      <LandingFooter />
    </div>
  );
}
