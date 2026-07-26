"use client";

import { useEffect, useState, use } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Bot,
  Sparkles,
  Package,
  ShieldCheck,
  Video,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { GlobalLoader } from "@/components/ui/global-loader";
import { BookPackageModal } from "@/components/storefront/book-package-modal";
import type { Creator, CreatorPackage, Profile } from "@/types";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default function PublicCreatorStorefrontPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const rawUsername = resolvedParams.username;
  const username = rawUsername ? rawUsername.toLowerCase().trim() : "";

  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundUser, setNotFoundUser] = useState(false);

  const [selectedPackage, setSelectedPackage] = useState<CreatorPackage | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    async function loadStorefront() {
      if (!username) {
        setNotFoundUser(true);
        setLoading(false);
        return;
      }

      // Fetch Profile by user_name (case-insensitive)
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .ilike("user_name", username)
        .maybeSingle();

      if (!profileData) {
        setNotFoundUser(true);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // Fetch Creator Record
      const { data: creatorData } = await supabase
        .from("creators")
        .select("*")
        .eq("id", profileData.id)
        .maybeSingle();

      if (creatorData) {
        setCreator(creatorData);
      }

      setLoading(false);
    }

    loadStorefront();
  }, [username, supabase]);

  if (loading) {
    return <GlobalLoader message="Opening Creator Storefront..." fullScreen={true} />;
  }

  if (notFoundUser || !profile) {
    notFound();
  }

  const category = creator?.creator_category || "human_ugc";
  const packagesList = (creator?.packages as CreatorPackage[]) || [];
  const niches = creator?.niches || [];

  const initials = profile.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "C";

  return (
    <div className="min-h-screen bg-surface-50/60 font-sans text-surface-900 antialiased select-none pb-20">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 border-b border-surface-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/icon.png"
              alt="ElAura Logo"
              width={26}
              height={26}
              className="rounded-lg shadow-xs"
            />
            <span className="font-black text-lg sm:text-xl tracking-tight text-surface-900">
              ElAura
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/creator"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100/80 px-3.5 py-2 rounded-xl transition-colors min-h-10 flex items-center"
            >
              Are you a Creator?
            </Link>
          </div>
        </div>
      </header>

      {/* Main Storefront Container */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* Hero Profile Header Card */}
        <div className="relative rounded-3xl border border-surface-200 bg-white p-6 sm:p-8 shadow-xl shadow-surface-200/40 overflow-hidden">
          {/* Ambient Top Glow Halo */}
          <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br from-brand-200/50 via-purple-200/40 to-pink-200/30 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {/* Avatar Profile Image */}
            <div className="relative shrink-0">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.full_name || "Creator Avatar"}
                  width={112}
                  height={112}
                  className="h-24 w-24 sm:h-28 sm:w-28 rounded-3xl object-cover shadow-md border-2 border-white ring-4 ring-brand-100/60"
                  priority
                />
              ) : (
                <div className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-3xl bg-brand-600 text-3xl font-black text-white shadow-md ring-4 ring-brand-100/60">
                  {initials}
                </div>
              )}

              {/* Verified Badge */}
              <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md ring-2 ring-white">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>

            {/* Profile Info Details */}
            <div className="space-y-3 flex-1 min-w-0">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-surface-900 tracking-tight">
                    {profile.full_name || "UGC Content Creator"}
                  </h1>

                  {/* Creator Category Badge */}
                  {category === "human_ugc" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                      <User className="h-3.5 w-3.5 text-emerald-600" />
                      Human UGC Creator
                    </span>
                  )}
                  {category === "ai_ugc" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-800 border border-purple-200">
                      <Bot className="h-3.5 w-3.5 text-purple-600" />
                      AI UGC Creator
                    </span>
                  )}
                  {category === "hybrid" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-800 border border-brand-200">
                      <Sparkles className="h-3.5 w-3.5 text-brand-600" />
                      Hybrid Creator
                    </span>
                  )}
                </div>

                <p className="text-sm font-semibold text-brand-600">
                  @{profile.user_name}
                </p>
              </div>

              {/* Bio */}
              <p className="text-xs sm:text-sm text-surface-600 max-w-2xl leading-relaxed">
                {creator?.bio ||
                  "Professional UGC content creator producing high-converting video ads, product unboxings, and engaging short-form content for brands."}
              </p>

              {/* Specialty Niches */}
              {niches.length > 0 && (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                  {niches.map((niche) => (
                    <span
                      key={niche}
                      className="rounded-full bg-surface-100/80 px-3 py-1 text-[11px] font-semibold text-surface-700 border border-surface-200/60"
                    >
                      {niche}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Listed UGC Packages Grid Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-brand-600" />
              <h2 className="text-lg sm:text-xl font-black text-surface-900 tracking-tight">
                UGC Video Packages & Rates
              </h2>
            </div>
            <span className="text-xs font-bold text-surface-400">
              {packagesList.length} Available
            </span>
          </div>

          {packagesList.length === 0 ? (
            <div className="rounded-3xl border border-surface-200 bg-white p-8 text-center space-y-2 shadow-2xs">
              <Video className="h-8 w-8 text-surface-300 mx-auto" />
              <p className="text-sm font-bold text-surface-800">
                No Video Packages Listed Yet
              </p>
              <p className="text-xs text-surface-500 max-w-xs mx-auto">
                This creator hasn&apos;t set up custom package rates yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {packagesList.map((pkg, index) => (
                <div
                  key={index}
                  className="rounded-3xl border border-surface-200 bg-white p-5 sm:p-6 shadow-md shadow-surface-200/30 flex flex-col justify-between space-y-4 hover:border-brand-300 transition-all group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center rounded-full bg-surface-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-surface-600">
                        {pkg.type === "custom" ? "Custom Video" : pkg.type.replace(/_/g, " ")}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-surface-900 leading-snug group-hover:text-brand-700 transition-colors">
                      {pkg.label}
                    </h3>
                  </div>

                  <div className="pt-3 border-t border-surface-100 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wider block">
                        STARTING AT
                      </span>
                      <p className="text-lg sm:text-xl font-black text-surface-900">
                        ₦{Number(pkg.price || 0).toLocaleString("en-US")}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPackage(pkg);
                        setIsBookingOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-brand-100/50 transition-all min-h-11 shrink-0"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Order Package</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Booking Modal */}
      {creator && (
        <BookPackageModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          creator={creator}
          selectedPackage={selectedPackage}
        />
      )}
    </div>
  );
}
