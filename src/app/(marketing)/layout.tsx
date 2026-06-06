"use client";

import { LandingNavbar } from "@/components/layout/landing-navbar";
import { LandingFooter } from "@/components/layout/landing-footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LandingNavbar />
      {children}
      <LandingFooter />
    </>
  );
}
