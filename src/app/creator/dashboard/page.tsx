"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Clock,
  Briefcase,
  Sparkles,
  ArrowUpRight,
  Plus,
  Video,
  Edit2,
} from "lucide-react";

import { createClient } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";
import type {
  Profile,
  Creator,
  Campaign,
  Application,
  CreatorPackage,
  CreatorCategory,
} from "@/types";
import { GlobalLoader } from "@/components/ui/global-loader";
import { UgcPackageModal } from "@/components/creator/ugc-package-modal";
import { CreatorBioModal } from "@/components/creator/creator-bio-modal";

export default function CreatorDashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [matchingCampaigns, setMatchingCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  // In-App Package & Category Manager State
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showBioModal, setShowBioModal] = useState(false);

  const [creatorCategory, setCreatorCategory] =
    useState<CreatorCategory>("human_ugc");
  const [packages, setPackages] = useState<CreatorPackage[]>([]);
  const [savingPackages, setSavingPackages] = useState(false);
  const [packageSaveSuccess, setPackageSaveSuccess] = useState(false);
  const [packageError, setPackageError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadCreatorDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/creator");
        return;
      }

      // Fetch Profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch Creator Record
      const { data: creatorData } = await supabase
        .from("creators")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (creatorData) {
        setCreator(creatorData);
        if (creatorData.creator_category) {
          setCreatorCategory(creatorData.creator_category as CreatorCategory);
        }
        if (Array.isArray(creatorData.packages)) {
          setPackages(creatorData.packages as CreatorPackage[]);
        }
      }

      // Fetch My Applications
      const { data: appsData } = await supabase
        .from("applications")
        .select("*, campaign:campaigns(*)")
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false });

      if (appsData) {
        setApplications(appsData as Application[]);
      }

      // Fetch Active Matching Briefs
      const { data: briefsData } = await supabase
        .from("campaigns")
        .select("*, brand:brands(*)")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(6);

      if (briefsData) {
        setMatchingCampaigns(briefsData as Campaign[]);
      }

      setLoading(false);
    }

    loadCreatorDashboard();
  }, [router, supabase]);

  const hasPackages =
    (creator?.packages && creator.packages.length > 0) || packages.length > 0;

  async function handleSavePackages() {
    setSavingPackages(true);
    setPackageError(null);
    setPackageSaveSuccess(false);

    const validPackages = packages.filter((p) => p.label.trim() && p.price > 0);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setPackageError("Not authenticated");
      setSavingPackages(false);
      return;
    }

    const { error: saveError } = await supabase.from("creators").upsert({
      id: user.id,
      user_name: profile?.user_name || creator?.user_name || null,
      creator_category: creatorCategory,
      packages: validPackages,
      updated_at: new Date().toISOString(),
    });

    if (saveError) {
      setPackageError(saveError.message);
      setSavingPackages(false);
      return;
    }

    setCreator((prev) => ({
      id: user.id,
      user_name: profile?.user_name || prev?.user_name || null,
      full_name: profile?.full_name || prev?.full_name || null,
      bio: prev?.bio || null,
      creator_category: creatorCategory,
      niches: prev?.niches || [],
      social_platforms: prev?.social_platforms || [],
      packages: validPackages,
      portfolio_urls: prev?.portfolio_urls || [],
      created_at: prev?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    setPackages(validPackages);
    setPackageSaveSuccess(true);
    setSavingPackages(false);

    setTimeout(() => {
      setPackageSaveSuccess(false);
      setShowPackageModal(false);
    }, 1500);
  }

  if (loading) {
    return (
      <GlobalLoader message="Loading Creator Dashboard..." fullScreen={true} />
    );
  }

  return (
    <div className="min-h-screen bg-surface-50/60 pb-24 md:pb-12 pt-4 sm:pt-8 px-3.5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5 sm:space-y-8">
        {/* Setup Packages Banner (ONLY RENDERED IF USER HAS 0 PACKAGES IN DB) */}
        {!hasPackages && (
          <div className="rounded-2xl border border-brand-200 bg-linear-to-r from-brand-50/80 via-purple-50/40 to-white p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Video className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-surface-900">
                  Set Up Your UGC Video Packages
                </h3>
                <p className="text-xs text-surface-600 mt-0.5">
                  Define rates for On-Camera UGC Videos, AI Avatars, or UGC Hooks so
                  brands can hire you.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowPackageModal(true)}
              className="w-full sm:w-auto shrink-0 rounded-xl bg-brand-600 text-white hover:bg-brand-700 px-4 py-2.5 text-xs font-bold transition-all shadow-md shadow-brand-100/50 min-h-11"
            >
              Add Packages Now
            </button>
          </div>
        )}

        {/* Setup Bio Banner (ONLY RENDERED IF USER HAS NO BIO) */}
        {!creator?.bio && (
          <div className="rounded-2xl border border-brand-200 bg-linear-to-r from-brand-50/80 via-emerald-50/40 to-white p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-surface-900">
                  Add Your Creator Bio & Intro
                </h3>
                <p className="text-xs text-surface-600 mt-0.5">
                  Tell visiting brands about your video style, experience, and niches.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowBioModal(true)}
              className="w-full sm:w-auto shrink-0 rounded-xl bg-brand-600 text-white hover:bg-brand-700 px-4 py-2.5 text-xs font-bold transition-all shadow-md shadow-brand-100/50 min-h-11"
            >
              Add Bio Now
            </button>
          </div>
        )}

        {/* Stats Grid (3 Cards) */}
        <div className="grid gap-3 sm:gap-5 grid-cols-1 sm:grid-cols-3">
          <div className="rounded-2xl border border-surface-200 bg-white p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-surface-500 uppercase tracking-wider">
                UGC Contracts
              </span>
              <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <Briefcase className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-black text-surface-900 leading-none">
                {applications.length}
              </p>
              <p className="mt-1 text-[11px] font-medium text-surface-500 truncate">
                Active & completed brand deals
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-surface-200 bg-white p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-surface-500 uppercase tracking-wider">
                Pending Pitches
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-black text-surface-900 leading-none">
                {applications.filter((a) => a.status === "pending").length}
              </p>
              <p className="mt-1 text-[11px] font-medium text-surface-500 truncate">
                Awaiting brand review
              </p>
            </div>
          </div>

          {/* UGC Packages Card */}
          <Link
            href="/creator/packages"
            className="rounded-2xl border border-surface-200 bg-white p-4 sm:p-5 shadow-2xs flex flex-col justify-between hover:border-brand-300 transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-surface-500 uppercase tracking-wider group-hover:text-brand-600 transition-colors">
                UGC Packages
              </span>
              <div
                className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white flex items-center justify-center transition-colors shrink-0"
                title="Manage UGC Packages"
              >
                <Plus className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-black text-surface-900 leading-none">
                {creator?.packages?.length ?? packages.length}
              </p>
              <p className="mt-1 text-[11px] font-medium text-surface-500 truncate group-hover:text-surface-700 transition-colors">
                Click to view & edit packages →
              </p>
            </div>
          </Link>
        </div>

        {/* Creator Bio Display Card */}
        <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-surface-100 pb-2.5">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand-600" />
              <h3 className="text-xs font-bold text-surface-900 uppercase tracking-wider">
                My Creator Bio
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowBioModal(true)}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Edit Bio</span>
            </button>
          </div>
          <p className="text-xs sm:text-sm text-surface-600 leading-relaxed italic">
            {creator?.bio || "No bio added yet. Click 'Edit Bio' to introduce yourself to visiting brands."}
          </p>
        </div>

        {/* Content Section: My Applications & Brand Brief Matching */}
        <div className="grid gap-5 sm:gap-8 lg:grid-cols-2">
          {/* Applications / Contracts Panel */}
          <div className="rounded-2xl border border-surface-200 bg-white p-4 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-surface-900">
                My Applications ({applications.length})
              </h2>
              <Link
                href="/contracts"
                className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1"
              >
                View all <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-surface-200 rounded-xl">
                <FileText className="h-8 w-8 text-surface-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-surface-500">
                  You haven&apos;t pitched to any brand briefs yet
                </p>
                <Link
                  href="/campaigns"
                  className="mt-3 inline-block rounded-xl bg-brand-50 px-4 py-2 text-xs font-bold text-brand-700 hover:bg-brand-100 transition-colors"
                >
                  Browse Active Briefs
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.slice(0, 4).map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-surface-100 hover:bg-surface-50 transition-colors"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-surface-900">
                        {app.campaign?.title || "UGC Video Brief"}
                      </h4>
                      <p className="text-[11px] text-surface-400">
                        Pitched: {formatDate(app.created_at)}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                        app.status === "accepted"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : app.status === "rejected"
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Matching Brand Briefs Panel */}
          <div className="rounded-2xl border border-surface-200 bg-white p-4 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-surface-900">
                Matching UGC Briefs
              </h2>
              <Link
                href="/campaigns"
                className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1"
              >
                Browse all briefs <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {matchingCampaigns.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-surface-200 rounded-xl">
                <Sparkles className="h-8 w-8 text-surface-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-surface-500">
                  No active brand briefs matching your profile right now
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {matchingCampaigns.slice(0, 4).map((brief) => (
                  <div
                    key={brief.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-surface-100 hover:border-brand-300 hover:bg-brand-50/20 transition-all group"
                  >
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-surface-900 group-hover:text-brand-600 transition-colors">
                        {brief.title}
                      </h4>
                      <p className="text-[11px] text-surface-500">
                        Budget:{" "}
                        <span className="font-bold text-surface-800">
                          {formatCurrency(brief.budget)}
                        </span>
                      </p>
                    </div>
                    <Link
                      href={`/campaigns/${brief.id}`}
                      className="rounded-xl border border-surface-200 bg-white px-3 py-1.5 text-xs font-bold text-surface-700 hover:bg-surface-50 transition-colors shrink-0"
                    >
                      Pitch Brief
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* UGC Package Modal */}
      <UgcPackageModal
        isOpen={showPackageModal}
        onClose={() => setShowPackageModal(false)}
        creatorCategory={creatorCategory}
        setCreatorCategory={setCreatorCategory}
        packages={packages}
        setPackages={setPackages}
        onSave={handleSavePackages}
        saving={savingPackages}
        error={packageError}
        success={packageSaveSuccess}
      />

      {/* Creator Bio Modal */}
      <CreatorBioModal
        isOpen={showBioModal}
        onClose={() => setShowBioModal(false)}
        currentBio={creator?.bio || ""}
        onBioSaved={(newBio) => {
          setCreator((prev) =>
            prev
              ? { ...prev, bio: newBio }
              : ({ id: profile?.id || "", bio: newBio } as Creator),
          );
        }}
      />
    </div>
  );
}
