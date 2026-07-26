"use client";

import { useEffect, useState, use } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Bot,
  Sparkles,
  ShieldCheck,
  Video,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { GlobalLoader } from "@/components/ui/global-loader";
import { BookPackageModal } from "@/components/storefront/book-package-modal";
import { VideoSampleModal } from "@/components/storefront/video-sample-modal";
import { InlineVideoPreview } from "@/components/storefront/inline-video-preview";
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

  const [selectedPackage, setSelectedPackage] = useState<CreatorPackage | null>(
    null,
  );
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [avatarImageError, setAvatarImageError] = useState(false);

  const [previewVideo, setPreviewVideo] = useState<{
    url: string;
    title: string;
  } | null>(null);

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
    return <GlobalLoader message="Opening Storefront..." fullScreen={true} />;
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
    <div className="min-h-screen bg-surface-50/70 font-sans text-surface-900 antialiased select-none pb-24">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 border-b border-surface-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 sm:h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/icon.png"
              alt="ElAura Logo"
              width={24}
              height={24}
              className="rounded-md"
            />
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-surface-900">
              ElAura
            </span>
          </Link>

          <Link
            href="/creator"
            className="text-xs font-semibold text-surface-700 hover:text-surface-900 border border-surface-200 bg-surface-50 px-3 py-1.5 rounded-lg transition-colors min-h-9 flex items-center gap-1"
          >
            <span>Are you a Creator?</span>
            <ArrowRight className="h-3.5 w-3.5 text-surface-400" />
          </Link>
        </div>
      </header>

      {/* Main Storefront Container */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        {/* Hero Profile Header Card */}
        <div className="rounded-2xl border border-surface-200 bg-white p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {/* Avatar Profile Image */}
            <div className="relative shrink-0">
              {profile.avatar_url && !avatarImageError ? (
                <div className="relative h-24 w-24 sm:h-26 sm:w-26 rounded-2xl overflow-hidden border border-surface-200 shadow-xs">
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name || "Creator Avatar"}
                    fill
                    unoptimized
                    onError={() => setAvatarImageError(true)}
                    className="object-cover"
                    priority
                  />
                </div>
              ) : (
                <div className="flex h-24 w-24 sm:h-26 sm:w-26 items-center justify-center rounded-2xl bg-surface-900 text-2xl font-black text-white">
                  {initials}
                </div>
              )}

              {/* Verified Badge */}
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-surface-900 text-white shadow-xs">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* Profile Info Details */}
            <div className="space-y-3 flex-1 min-w-0">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-surface-900 tracking-tight">
                  {profile.full_name || "UGC Content Creator"}
                </h1>

                <p className="text-xs font-semibold text-surface-500">
                  @{profile.user_name}
                </p>

                {/* Creator Category Badge Below Name & Handle */}
                <div className="pt-1">
                  {category === "human_ugc" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-0.5 text-xs font-bold text-emerald-800">
                      <User className="h-3.5 w-3.5 text-emerald-600" />
                      On-Camera Creator
                    </span>
                  )}
                  {category === "ai_ugc" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3 py-0.5 text-xs font-bold text-purple-800">
                      <Bot className="h-3.5 w-3.5 text-purple-600" />
                      AI UGC Creator
                    </span>
                  )}
                  {category === "hybrid" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-0.5 text-xs font-bold text-brand-800">
                      <Sparkles className="h-3.5 w-3.5 text-brand-600" />
                      Hybrid Creator
                    </span>
                  )}
                </div>
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
                      className="rounded-md bg-surface-100/70 px-2.5 py-1 text-[11px] font-medium text-surface-700 border border-surface-200/50"
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
          <div className="flex items-center justify-between border-b border-surface-200/80 pb-3">
            <h2 className="text-base sm:text-lg font-bold text-surface-900 tracking-tight">
              UGC Packages & Rates
            </h2>
            <span className="text-xs font-medium text-surface-500">
              {packagesList.length} Offered
            </span>
          </div>

          {packagesList.length === 0 ? (
            <div className="rounded-2xl border border-surface-200 bg-white p-8 text-center space-y-2 shadow-2xs">
              <Video className="h-6 w-6 text-surface-400 mx-auto" />
              <p className="text-sm font-semibold text-surface-800">
                No Video Packages Listed
              </p>
              <p className="text-xs text-surface-500 max-w-xs mx-auto">
                This creator hasn&apos;t set up custom package rates yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {packagesList.map((pkg, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-surface-200 bg-white p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-brand-300 transition-colors"
                >
                  <div className="space-y-2">
                    {/* TikTok/Reels Style Inline Video Preview */}
                    {pkg.sample_video_url && (
                      <InlineVideoPreview
                        videoUrl={pkg.sample_video_url}
                        title={pkg.label}
                        onExpand={() =>
                          setPreviewVideo({
                            url: pkg.sample_video_url!,
                            title: pkg.label,
                          })
                        }
                      />
                    )}

                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wider block">
                        {pkg.type === "custom"
                          ? "Custom Video"
                          : pkg.type.replace(/_/g, " ")}
                      </span>

                      <h3 className="text-sm font-bold text-surface-900 leading-snug">
                        {pkg.label}
                      </h3>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-surface-100 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wider block">
                        RATE
                      </span>
                      <p className="text-base sm:text-lg font-extrabold text-surface-900">
                        ₦{Number(pkg.price || 0).toLocaleString("en-US")}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPackage(pkg);
                        setIsBookingOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-brand-100/50 transition-all min-h-11 shrink-0"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Order Package</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* In-App Video Sample Preview Modal */}
      <VideoSampleModal
        isOpen={!!previewVideo}
        onClose={() => setPreviewVideo(null)}
        videoUrl={previewVideo?.url || null}
        packageTitle={previewVideo?.title}
      />

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
