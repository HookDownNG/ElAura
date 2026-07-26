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

export default function CreatorDashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [matchingCampaigns, setMatchingCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  // In-App Package & Category Manager State
  const [showPackageModal, setShowPackageModal] = useState(false);
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

      // 1. Fetch Profile
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!prof) {
        router.push("/creator");
        return;
      }
      setProfile(prof);

      // 2. Fetch Creator Data
      const { data: creatorData } = await supabase
        .from("creators")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      setCreator(creatorData);
      if (creatorData?.packages) {
        setPackages(creatorData.packages);
      }
      if (creatorData?.creator_category) {
        setCreatorCategory(creatorData.creator_category);
      }

      // 3. Fetch Applications submitted by Creator
      const { data: apps } = await supabase
        .from("applications")
        .select("*, campaign:campaign_id(*)")
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false });

      setApplications(apps ?? []);

      // 4. Fetch Active Brand Briefs
      const { data: activeCamps } = await supabase
        .from("campaigns")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(6);

      setMatchingCampaigns(activeCamps ?? []);
      setLoading(false);
    }

    loadCreatorDashboard();
  }, [router, supabase]);

  async function handleSavePackages() {
    setSavingPackages(true);
    setPackageError(null);

    const validPackages = packages.filter((p) => p.label.trim() && p.price > 0);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setPackageError("Not authenticated");
      setSavingPackages(false);
      return;
    }

    const { error } = await supabase.from("creators").upsert({
      id: user.id,
      user_name: profile?.user_name || creator?.user_name || null,
      creator_category: creatorCategory,
      packages: validPackages,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      setPackageError(error.message);
      setSavingPackages(false);
      return;
    }

    setCreator((prev) => ({
      id: user.id,
      user_name: profile?.user_name || prev?.user_name || null,
      full_name: profile?.full_name || prev?.full_name || null,
      creator_category: creatorCategory,
      packages: validPackages,
      bank_account_number: prev?.bank_account_number || null,
      bank_name: prev?.bank_name || null,
      bank_code: prev?.bank_code || null,
      phone: prev?.phone || null,
      shipping_address: prev?.shipping_address || null,
      niches: prev?.niches || [],
      bio: prev?.bio || null,
      social_platforms: prev?.social_platforms || [],
      portfolio_urls: prev?.portfolio_urls || [],
      created_at: prev?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    setPackageSaveSuccess(true);
    setSavingPackages(false);
    setTimeout(() => {
      setPackageSaveSuccess(false);
      setShowPackageModal(false);
    }, 1200);
  }

  const pendingApps = applications.filter((a) => a.status === "pending");
  const acceptedApps = applications.filter((a) => a.status === "accepted");
  const hasPackages = Boolean(creator?.packages && creator.packages.length > 0);

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
          <div className="rounded-2xl border border-brand-200 bg-linear-to-r from-brand-50/80 via-purple-50/50 to-white p-4 sm:p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Video className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-surface-900">
                  Set Up Your UGC Video Packages
                </h3>
                <p className="text-xs text-surface-600 mt-0.5">
                  Define rates for Human UGC Videos, AI Avatars, or UGC Hooks so
                  brands can hire you.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowPackageModal(true)}
              className="w-full sm:w-auto shrink-0 rounded-xl bg-brand-600 text-white hover:bg-brand-700 px-4 py-2.5 text-xs font-bold transition-colors shadow-xs min-h-11"
            >
              Add Packages Now
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
                {acceptedApps.length} active briefs
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-surface-200 bg-white p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-surface-500 uppercase tracking-wider">
                Pending Pitches
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-black text-surface-900 leading-none">
                {pendingApps.length}
              </p>
              <p className="mt-1 text-[11px] font-medium text-surface-500 truncate">
                Awaiting review
              </p>
            </div>
          </div>

          {/* UGC Packages Card */}
          <Link
            href="/creator/packages"
            className="rounded-2xl border border-surface-200 bg-white p-4 sm:p-5 shadow-2xs flex flex-col justify-between hover:border-purple-300 hover:shadow-sm transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-surface-500 uppercase tracking-wider group-hover:text-purple-600 transition-colors">
                UGC Packages
              </span>
              <div
                className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-100 flex items-center justify-center transition-colors shrink-0"
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
                View & edit packages
              </p>
            </div>
          </Link>
        </div>

        {/* Content Section: My Applications & Brand Brief Matching */}
        <div className="grid gap-5 sm:gap-8 lg:grid-cols-2">
          {/* Applications / Contracts Panel */}
          <div className="rounded-2xl border border-surface-200 bg-white p-5 sm:p-6 shadow-2xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-surface-900">
                    My UGC Applications & Pitches
                  </h2>
                  <p className="text-xs text-surface-500">
                    Track your pitches and video deliverables
                  </p>
                </div>
                <FileText className="h-5 w-5 text-surface-400 shrink-0" />
              </div>

              {applications.length === 0 ? (
                <div className="py-10 text-center border-2 border-dashed border-surface-200 rounded-xl px-4">
                  <Briefcase className="h-7 w-7 text-surface-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-surface-800">
                    No active applications yet
                  </p>
                  <p className="text-[11px] text-surface-400 mt-1 max-w-xs mx-auto">
                    Browse open brand UGC briefs below and submit your video
                    proposal.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {applications.slice(0, 5).map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between rounded-xl border border-surface-100 bg-surface-50/60 p-3.5 transition-all hover:border-brand-200"
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <p className="text-xs font-bold text-surface-900 truncate">
                          {app.campaign && "title" in app.campaign
                            ? (app.campaign as Campaign).title
                            : "UGC Video Brief"}
                        </p>
                        <p className="text-[11px] text-surface-500">
                          Pitched on {formatDate(app.created_at)}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                          app.status === "accepted"
                            ? "bg-emerald-100 text-emerald-800"
                            : app.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {applications.length > 5 && (
              <Link href="/contracts" className="block pt-2">
                <button
                  type="button"
                  className="w-full rounded-xl border border-surface-200 bg-white py-2.5 text-xs font-bold text-surface-700 hover:bg-surface-50 transition-colors min-h-11"
                >
                  View All Contracts
                </button>
              </Link>
            )}
          </div>

          {/* Brand Brief Matching Panel */}
          <div className="rounded-2xl border border-surface-200 bg-white p-5 sm:p-6 shadow-2xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-surface-900">
                    Open UGC Brand Briefs
                  </h2>
                  <p className="text-xs text-surface-500">
                    Active campaigns seeking Human & AI UGC creators
                  </p>
                </div>
                <Sparkles className="h-5 w-5 text-brand-600 shrink-0" />
              </div>

              {matchingCampaigns.length === 0 ? (
                <div className="py-10 text-center border-2 border-dashed border-surface-200 rounded-xl px-4">
                  <Sparkles className="h-7 w-7 text-surface-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-surface-800">
                    No active briefs right now
                  </p>
                  <p className="text-[11px] text-surface-400 mt-1 max-w-xs mx-auto">
                    New brand UGC briefs are added daily. Check back soon!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {matchingCampaigns.map((camp) => (
                    <div
                      key={camp.id}
                      className="flex items-center justify-between rounded-xl border border-surface-100 bg-white p-3.5 hover:border-brand-300 shadow-2xs transition-all"
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <p className="text-xs font-bold text-surface-900 truncate">
                          {camp.title}
                        </p>
                        <p className="text-[11px] text-surface-500 line-clamp-1">
                          {camp.description}
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <p className="text-xs font-black text-brand-700">
                          {formatCurrency(Number(camp.budget))}
                        </p>
                        <Link
                          href={`/campaigns/${camp.id}`}
                          className="inline-flex items-center gap-0.5 text-[11px] font-bold text-brand-600 hover:text-brand-700 mt-0.5"
                        >
                          Apply <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link href="/campaigns" className="block pt-2">
              <button
                type="button"
                className="w-full rounded-xl bg-brand-600 hover:bg-brand-700 text-white py-2.5 text-xs font-bold transition-colors shadow-xs min-h-11"
              >
                Explore All Brand Briefs
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* UGC Packages & Creator Type Modal Component */}
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
    </div>
  );
}
