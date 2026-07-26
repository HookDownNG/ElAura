import { LandingNavbar } from "@/components/layout/landing-navbar";
import { LandingFooter } from "@/components/layout/landing-footer";

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <LandingNavbar />
      <main className="flex-1">{children}</main>
      <LandingFooter />
    </div>
  );
}
