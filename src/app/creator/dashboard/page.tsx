"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Clock,
  Briefcase,
  Check,
  Sparkles,
  ArrowUpRight,
  Package,
  Plus,
  Trash2,
  X,
  Bot,
  User,
  Video,
  Copy,
  ExternalLink,
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

const UGC_PACKAGE_TEMPLATES = [
  {
    type: "ugc_video",
    label: "1x 30s Human UGC Video Ad",
    category: "human",
  },
  {
    type: "ugc_hooks_bundle",
    label: "3x UGC Video Ad Hooks Bundle",
    category: "human",
  },
  {
    type: "unboxing_review",
    label: "Product Unboxing & Review Video",
    category: "human",
  },
  { type: "ai_ugc_avatar", label: "1x AI Avatar UGC Video Ad", category: "ai" },
  {
    type: "ai_voiceover_script",
    label: "AI Script + Voiceover UGC Ad",
    category: "ai",
  },
] as const;

export default function CreatorDashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [matchingCampaigns, setMatchingCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

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

  const copyStorefrontLink = () => {
    if (!profile?.user_name) return;
    const url = `${window.location.origin}/${profile.user_name}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  function updatePackage(
    index: number,
    field: keyof CreatorPackage,
    value: string | number,
  ) {
    setPackages((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function addPackage() {
    setPackages((prev) => [...prev, { type: "custom", label: "", price: 0 }]);
  }

  function removePackage(index: number) {
    setPackages((prev) => prev.filter((_, i) => i !== index));
  }

  function addPackageFromTemplate(tpl: (typeof UGC_PACKAGE_TEMPLATES)[number]) {
    if (packages.some((p) => p.type === tpl.type)) return;
    setPackages((prev) => [
      ...prev,
      { type: tpl.type, label: tpl.label, price: 0 },
    ]);
  }

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

    setCreator((prev) =>
      prev
        ? {
            ...prev,
            creator_category: creatorCategory,
            packages: validPackages,
          }
        : null,
    );
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
          <div className="rounded-2xl border border-surface-200 bg-white p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-surface-500 uppercase tracking-wider">
                UGC Packages
              </span>
              <button
                type="button"
                onClick={() => setShowPackageModal(true)}
                className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 flex items-center justify-center transition-colors shrink-0"
                title="Add UGC Package"
                aria-label="Add UGC Package"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-black text-surface-900 leading-none">
                {creator?.packages?.length || 0}
              </p>
              <p className="mt-1 text-[11px] font-medium text-surface-500 truncate">
                UGC packages listed
              </p>
            </div>
          </div>
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

      {/* Mobile-First Native Slide-Up Bottom Sheet Modal */}
      {showPackageModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-surface-950/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
          {/* Backdrop Click */}
          <div
            className="fixed inset-0"
            onClick={() => setShowPackageModal(false)}
          />

          <div className="relative w-full max-w-xl rounded-t-3xl sm:rounded-3xl bg-white p-4 sm:p-7 shadow-2xl space-y-4 z-10 max-h-[92vh] flex flex-col justify-between overflow-hidden">
            {/* Mobile Touch Handle Bar */}
            <div className="sm:hidden w-12 h-1.5 bg-surface-200 rounded-full mx-auto shrink-0 mb-1" />

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-surface-100 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                  <Video className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-surface-900 leading-tight">
                    UGC Profile & Packages
                  </h2>
                  <p className="text-xs text-surface-500">
                    Set rates for Human & AI UGC
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPackageModal(false)}
                className="text-surface-400 hover:text-surface-600 p-2 transition-colors min-h-11 min-w-11 flex items-center justify-center"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <div className="space-y-4 overflow-y-auto pr-1 flex-1 py-1">
              {packageError && (
                <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 font-medium border border-red-200">
                  {packageError}
                </div>
              )}

              {packageSaveSuccess && (
                <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 font-medium border border-emerald-200 flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  UGC Profile & Packages saved!
                </div>
              )}

              {/* Creator Category Selection */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-surface-700 uppercase tracking-wider block">
                  Select Creator Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCreatorCategory("human_ugc")}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all min-h-14 ${
                      creatorCategory === "human_ugc"
                        ? "bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-200 font-bold"
                        : "bg-surface-50 border-surface-200 text-surface-600 hover:bg-surface-100"
                    }`}
                  >
                    <User className="h-4 w-4 mb-1 text-emerald-600" />
                    <span className="text-[11px]">Human UGC</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreatorCategory("ai_ugc")}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all min-h-14 ${
                      creatorCategory === "ai_ugc"
                        ? "bg-purple-50 border-purple-500 text-purple-900 ring-2 ring-purple-200 font-bold"
                        : "bg-surface-50 border-surface-200 text-surface-600 hover:bg-surface-100"
                    }`}
                  >
                    <Bot className="h-4 w-4 mb-1 text-purple-600" />
                    <span className="text-[11px]">AI UGC</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreatorCategory("hybrid")}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all min-h-14 ${
                      creatorCategory === "hybrid"
                        ? "bg-brand-50 border-brand-500 text-brand-900 ring-2 ring-brand-200 font-bold"
                        : "bg-surface-50 border-surface-200 text-surface-600 hover:bg-surface-100"
                    }`}
                  >
                    <Sparkles className="h-4 w-4 mb-1 text-brand-600" />
                    <span className="text-[11px]">Hybrid</span>
                  </button>
                </div>
              </div>

              {/* Quick Add Templates (Mobile Scrollable Bar) */}
              <div className="space-y-2 pt-1">
                <label className="text-[11px] font-bold text-surface-700 uppercase tracking-wider block">
                  Quick Add Templates
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-hide -mx-1 px-1">
                  {UGC_PACKAGE_TEMPLATES.map((t) => (
                    <button
                      key={t.type}
                      type="button"
                      onClick={() => addPackageFromTemplate(t)}
                      disabled={packages.some((p) => p.type === t.type)}
                      className="px-3.5 py-2 rounded-full text-xs font-semibold border border-surface-200 hover:border-brand-300 hover:bg-brand-50 text-surface-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 min-h-10"
                    >
                      + {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile-First Package Items */}
              <div className="space-y-3 pt-1">
                <label className="text-[11px] font-bold text-surface-700 uppercase tracking-wider block">
                  Active Packages
                </label>
                {packages.length === 0 ? (
                  <div className="py-6 text-center border-2 border-dashed border-surface-200 rounded-xl">
                    <Package className="h-6 w-6 text-surface-300 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-surface-600">
                      No packages added yet
                    </p>
                    <p className="text-[11px] text-surface-400 mt-0.5">
                      Use quick-add templates above
                    </p>
                  </div>
                ) : (
                  packages.map((pkg, i) => (
                    <div
                      key={i}
                      className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center rounded-xl border border-surface-200 bg-surface-50/80 p-3 sm:p-3.5 space-y-2 sm:space-y-0"
                    >
                      <div className="flex-1 min-w-0">
                        <label className="text-[10px] font-bold text-surface-400 sm:hidden block mb-1">
                          PACKAGE NAME
                        </label>
                        <input
                          type="text"
                          value={pkg.label}
                          onChange={(e) =>
                            updatePackage(i, "label", e.target.value)
                          }
                          placeholder="Package name (e.g., 1x 30s UGC Video)"
                          className="w-full rounded-xl border border-surface-200 bg-white px-3.5 py-2.5 text-xs font-medium outline-none focus:border-brand-400 transition-colors min-h-11"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 sm:w-32">
                          <label className="text-[10px] font-bold text-surface-400 sm:hidden block mb-1">
                            RATE (₦)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-surface-400">
                              ₦
                            </span>
                            <input
                              type="number"
                              value={pkg.price || ""}
                              onChange={(e) =>
                                updatePackage(
                                  i,
                                  "price",
                                  Number(e.target.value),
                                )
                              }
                              placeholder="0"
                              className="w-full rounded-xl border border-surface-200 bg-white py-2.5 pl-7 pr-3 text-xs font-bold text-surface-900 outline-none focus:border-brand-400 transition-colors min-h-11"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePackage(i)}
                          className="text-surface-400 hover:text-red-500 transition-colors p-2.5 rounded-xl border border-surface-200 sm:border-0 bg-white sm:bg-transparent min-h-11 min-w-11 flex items-center justify-center shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}

                <button
                  type="button"
                  onClick={addPackage}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors pt-1 min-h-11"
                >
                  <Plus className="h-4 w-4" /> Add custom package
                </button>
              </div>
            </div>

            {/* Mobile Sticky Modal Action Bar */}
            <div className="flex items-center justify-end gap-2.5 border-t border-surface-100 pt-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowPackageModal(false)}
                className="flex-1 sm:flex-initial rounded-xl border border-surface-200 px-4 py-2.5 text-xs font-semibold text-surface-600 hover:bg-surface-50 transition-colors min-h-11"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePackages}
                disabled={savingPackages}
                className="flex-1 sm:flex-initial rounded-xl bg-brand-600 text-white hover:bg-brand-700 px-6 py-2.5 text-xs font-bold shadow-xs transition-all disabled:opacity-50 min-h-11"
              >
                {savingPackages ? "Saving..." : "Save UGC Profile"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
