"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Wallet,
  ExternalLink,
  DollarSign,
  FileText,
  Clock,
  Briefcase,
  Copy,
  Check,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Star,
  Package,
  Plus,
  Trash2,
  X,
  Share2,
} from "lucide-react";

import { createClient } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Profile, Creator, Campaign, Application, CreatorPackage } from "@/types";

const PACKAGE_TEMPLATES = [
  { type: "tiktok_reel", label: "TikTok / Reel (Short vertical)" },
  { type: "instagram_carousel", label: "Instagram Carousel / Post" },
  { type: "youtube_video", label: "YouTube Video (Long-form)" },
] as const;

export default function CreatorDashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [matchingCampaigns, setMatchingCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  // In-App Package Manager State
  const [showPackageModal, setShowPackageModal] = useState(false);
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

  function updatePackage(index: number, field: keyof CreatorPackage, value: string | number) {
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

  function addPackageFromTemplate(tpl: (typeof PACKAGE_TEMPLATES)[number]) {
    if (packages.some((p) => p.type === tpl.type)) return;
    setPackages((prev) => [
      ...prev,
      { type: tpl.type as any, label: tpl.label, price: 0 },
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

    const { error } = await supabase
      .from("creators")
      .upsert({
        id: user.id,
        user_name: profile?.user_name || creator?.user_name || null,
        packages: validPackages,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      setPackageError(error.message);
      setSavingPackages(false);
      return;
    }

    setCreator((prev) => (prev ? { ...prev, packages: validPackages } : null));
    setPackageSaveSuccess(true);
    setSavingPackages(false);
    setTimeout(() => {
      setPackageSaveSuccess(false);
      setShowPackageModal(false);
    }, 1200);
  }

  const pendingApps = applications.filter((a) => a.status === "pending");
  const acceptedApps = applications.filter((a) => a.status === "accepted");
  const hasPackages = creator?.packages && creator.packages.length > 0;

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-brand-600 border-t-transparent" />
          <p className="text-xs font-medium text-surface-500">Loading Creator Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50/60 pb-24 md:pb-12 pt-4 sm:pt-8 px-3.5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5 sm:space-y-8">

        {/* Welcome Header */}
        <div className="rounded-2xl bg-white p-5 sm:p-6 border border-surface-200 shadow-2xs space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-surface-900">
                  Welcome, {profile?.full_name?.split(" ")[0] || creator?.full_name?.split(" ")[0] || "Creator"}! 👋
                </h1>
                <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-bold text-brand-700 border border-brand-100">
                  Verified Creator
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-surface-500">
                Manage your storefront, brand pitches, and escrow payouts.
              </p>
            </div>
          </div>

          {/* Quick Action Scrollable Bar (Mobile Optimized) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-hide -mx-1 px-1">
            <button
              onClick={() => setShowPackageModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50/90 px-3.5 py-2.5 text-xs font-bold text-brand-700 hover:bg-brand-100 transition-colors shrink-0 min-h-[42px]"
            >
              <Package className="h-4 w-4" />
              <span>{hasPackages ? "Manage Packages" : "+ Add Packages"}</span>
            </button>

            {profile?.user_name && (
              <>
                <button
                  onClick={copyStorefrontLink}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-surface-200 bg-surface-50 px-3.5 py-2.5 text-xs font-semibold text-surface-700 hover:bg-surface-100 transition-colors shrink-0 min-h-[42px]"
                >
                  {copiedLink ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-surface-500" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>

                <a
                  href={`/${profile.user_name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-brand-700 shadow-2xs transition-all shrink-0 min-h-[42px]"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Storefront</span>
                </a>
              </>
            )}
          </div>
        </div>

        {/* Setup Packages Banner (If no packages added yet) */}
        {!hasPackages && (
          <div className="rounded-2xl border border-brand-200 bg-gradient-to-r from-brand-50/80 via-purple-50/50 to-white p-4 sm:p-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Package className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-surface-900">
                  Set Up Packages & Pricing
                </h3>
                <p className="text-xs text-surface-600 mt-0.5">
                  Define your rates so brands can book you directly from your bio link.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPackageModal(true)}
              className="w-full sm:w-auto shrink-0 rounded-xl bg-brand-600 text-white hover:bg-brand-700 px-4 py-2.5 text-xs font-bold transition-colors shadow-xs min-h-[42px]"
            >
              Add Packages Now
            </button>
          </div>
        )}

        {/* Payout Wallet Banner (If bank account missing) */}
        {(!creator?.bank_account_number || !creator?.bank_name) && (
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Wallet className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-amber-950">
                  Set Up Payout Wallet
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  Link your Nigerian bank account to receive automated escrow payouts.
                </p>
              </div>
            </div>
            <Link href="/settings" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto shrink-0 rounded-xl bg-amber-600 text-white hover:bg-amber-700 px-4 py-2.5 text-xs font-bold transition-colors shadow-xs min-h-[42px]">
                Add Bank Account
              </button>
            </Link>
          </div>
        )}

        {/* Stats Grid (Mobile 2x2 or 1x4 stacked) */}
        <div className="grid gap-3 sm:gap-5 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-surface-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-surface-500 uppercase tracking-wider">
                Contracts
              </span>
              <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                <Briefcase className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-surface-900">
              {applications.length}
            </p>
            <p className="mt-0.5 text-[11px] text-surface-500 truncate">
              {acceptedApps.length} active
            </p>
          </div>

          <div className="rounded-2xl border border-surface-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-surface-500 uppercase tracking-wider">
                Pitches
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-surface-900">
              {pendingApps.length}
            </p>
            <p className="mt-0.5 text-[11px] text-surface-500 truncate">
              Awaiting review
            </p>
          </div>

          <div className="rounded-2xl border border-surface-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-surface-500 uppercase tracking-wider">
                Packages
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Package className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-black text-surface-900">
              {creator?.packages?.length || 0}
            </p>
            <p className="mt-0.5 text-[11px] text-surface-500 truncate">
              Services listed
            </p>
          </div>

          <div className="rounded-2xl border border-surface-200 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-surface-500 uppercase tracking-wider">
                Escrow
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-black text-emerald-600">
              Guaranteed
            </p>
            <p className="mt-0.5 text-[11px] text-surface-500 truncate">
              100% Protected
            </p>
          </div>
        </div>

        {/* Content Section: My Applications & Brand Brief Matching */}
        <div className="grid gap-5 sm:gap-8 lg:grid-cols-2">
          {/* Applications / Contracts Panel */}
          <div className="rounded-2xl border border-surface-200 bg-white p-5 sm:p-6 shadow-2xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-surface-900">My Applications & Pitches</h2>
                  <p className="text-xs text-surface-500">Track your pitches and active brand deliverables</p>
                </div>
                <FileText className="h-5 w-5 text-surface-400 shrink-0" />
              </div>

              {applications.length === 0 ? (
                <div className="py-10 text-center border-2 border-dashed border-surface-200 rounded-xl px-4">
                  <Briefcase className="h-7 w-7 text-surface-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-surface-800">No active applications yet</p>
                  <p className="text-[11px] text-surface-400 mt-1 max-w-xs mx-auto">
                    Browse open brand briefs below and submit your pitch to start earning.
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
                            : "Brand Brief Collaboration"}
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
                <button className="w-full rounded-xl border border-surface-200 bg-white py-2.5 text-xs font-bold text-surface-700 hover:bg-surface-50 transition-colors min-h-[42px]">
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
                  <h2 className="text-base sm:text-lg font-bold text-surface-900">Matching Brand Briefs</h2>
                  <p className="text-xs text-surface-500">Active briefs accepting creator applications</p>
                </div>
                <Sparkles className="h-5 w-5 text-brand-600 shrink-0" />
              </div>

              {matchingCampaigns.length === 0 ? (
                <div className="py-10 text-center border-2 border-dashed border-surface-200 rounded-xl px-4">
                  <Sparkles className="h-7 w-7 text-surface-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-surface-800">No active briefs right now</p>
                  <p className="text-[11px] text-surface-400 mt-1 max-w-xs mx-auto">
                    New brand campaigns are added daily. Check back soon!
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
              <button className="w-full rounded-xl bg-brand-600 hover:bg-brand-700 text-white py-2.5 text-xs font-bold transition-colors shadow-xs min-h-[42px]">
                Explore All Brand Briefs
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* In-App Package Manager Modal / Mobile Bottom Sheet */}
      {showPackageModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-surface-950/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
          {/* Backdrop Click */}
          <div
            className="fixed inset-0"
            onClick={() => setShowPackageModal(false)}
          />

          <div className="relative w-full max-w-xl rounded-t-3xl sm:rounded-3xl bg-white p-5 sm:p-8 shadow-2xl space-y-5 z-10 max-h-[88vh] flex flex-col justify-between">
            {/* Mobile Drag Indicator Bar */}
            <div className="sm:hidden w-12 h-1.5 bg-surface-200 rounded-full mx-auto -mt-1 mb-1" />

            <div className="space-y-4 overflow-y-auto pr-1">
              <div className="flex items-center justify-between border-b border-surface-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-surface-900">Packages & Pricing</h2>
                    <p className="text-xs text-surface-500">Set rates for brand bookings</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPackageModal(false)}
                  className="text-surface-400 hover:text-surface-600 p-1.5 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {packageError && (
                <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 font-medium border border-red-200">
                  {packageError}
                </div>
              )}

              {packageSaveSuccess && (
                <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 font-medium border border-emerald-200 flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  Packages saved successfully!
                </div>
              )}

              {/* Quick Templates */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-surface-700 uppercase tracking-wider block">
                  Quick Add Templates
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PACKAGE_TEMPLATES.map((t) => (
                    <button
                      key={t.type}
                      type="button"
                      onClick={() => addPackageFromTemplate(t)}
                      disabled={packages.some((p) => p.type === t.type)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium border border-surface-200 hover:border-brand-300 hover:bg-brand-50 text-surface-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all min-h-[36px]"
                    >
                      + {t.label.split("(")[0].trim()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Package Items */}
              <div className="space-y-3 pt-1">
                <label className="text-[11px] font-bold text-surface-700 uppercase tracking-wider block">
                  Your Packages
                </label>
                {packages.length === 0 ? (
                  <div className="py-6 text-center border-2 border-dashed border-surface-200 rounded-xl">
                    <Package className="h-6 w-6 text-surface-300 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-surface-600">No packages added yet</p>
                    <p className="text-[11px] text-surface-400 mt-0.5">Use quick-add templates above</p>
                  </div>
                ) : (
                  packages.map((pkg, i) => (
                    <div
                      key={i}
                      className="flex gap-2.5 items-center rounded-xl border border-surface-200 bg-surface-50/70 p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={pkg.label}
                          onChange={(e) => updatePackage(i, "label", e.target.value)}
                          placeholder="Package name"
                          className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-brand-400 transition-colors min-h-[38px]"
                        />
                      </div>
                      <div className="w-28 sm:w-32 shrink-0">
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-surface-400">
                            ₦
                          </span>
                          <input
                            type="number"
                            value={pkg.price || ""}
                            onChange={(e) => updatePackage(i, "price", Number(e.target.value))}
                            placeholder="0"
                            className="w-full rounded-lg border border-surface-200 bg-white py-2 pl-6 pr-2 text-xs font-bold text-surface-900 outline-none focus:border-brand-400 transition-colors min-h-[38px]"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePackage(i)}
                        className="text-surface-400 hover:text-red-500 transition-colors p-1.5 shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}

                <button
                  type="button"
                  onClick={addPackage}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors pt-1 min-h-[36px]"
                >
                  <Plus className="h-4 w-4" /> Add custom package
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 border-t border-surface-100 pt-3">
              <button
                type="button"
                onClick={() => setShowPackageModal(false)}
                className="rounded-xl border border-surface-200 px-4 py-2.5 text-xs font-semibold text-surface-600 hover:bg-surface-50 transition-colors min-h-[42px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePackages}
                disabled={savingPackages}
                className="rounded-xl bg-brand-600 text-white hover:bg-brand-700 px-5 py-2.5 text-xs font-bold shadow-xs transition-all disabled:opacity-50 min-h-[42px]"
              >
                {savingPackages ? "Saving..." : "Save Packages"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
