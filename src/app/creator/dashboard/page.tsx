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
  TrendingUp,
  Briefcase,
  Copy,
  Check,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Star,
} from "lucide-react";

import { createClient } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  MILESTONE_STATE_LABELS,
  MILESTONE_STATE_COLORS,
} from "@/lib/constants";
import type { Profile, Creator, Campaign, Milestone, Application } from "@/types";

export default function CreatorDashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [matchingCampaigns, setMatchingCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
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

      // 3. Fetch Applications submitted by Creator
      const { data: apps } = await supabase
        .from("applications")
        .select("*, campaign:campaign_id(*)")
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false });

      setApplications(apps ?? []);

      // 4. Fetch Active Brand Briefs / Campaigns matching creator niches
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

  const pendingApps = applications.filter((a) => a.status === "pending");
  const acceptedApps = applications.filter((a) => a.status === "accepted");

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-brand-600 border-t-transparent" />
          <p className="text-sm font-medium text-surface-500">Loading Creator Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-white p-6 border border-surface-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-surface-900">
                Welcome back, {profile?.full_name || creator?.full_name || "Creator"}! 👋
              </h1>
              <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                Verified Creator
              </span>
            </div>
            <p className="mt-1 text-sm text-surface-500">
              Manage your brand collaborations, storefront, and track your escrow earnings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {profile?.user_name && (
              <>
                <button
                  onClick={copyStorefrontLink}
                  className="inline-flex items-center gap-2 rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm font-semibold text-surface-700 hover:bg-surface-100 transition-colors"
                >
                  {copiedLink ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-600" />
                      <span className="text-emerald-600">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-surface-500" />
                      <span>Copy Storefront</span>
                    </>
                  )}
                </button>

                <a
                  href={`/${profile.user_name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 shadow-sm transition-all hover:scale-[1.02]"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Storefront
                </a>
              </>
            )}
          </div>
        </div>

        {/* Payout Wallet Banner (If bank account missing) */}
        {(!creator?.bank_account_number || !creator?.bank_name) && (
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-amber-950">
                  Set Up Your Payout Wallet
                </h3>
                <p className="text-xs sm:text-sm text-amber-800 mt-0.5">
                  Link your Nigerian bank account to receive automated escrow payouts when deliverables are approved.
                </p>
              </div>
            </div>
            <Link href="/settings">
              <button className="w-full sm:w-auto shrink-0 rounded-xl bg-amber-600 text-white hover:bg-amber-700 px-5 py-2.5 text-sm font-semibold transition-colors shadow-sm">
                Add Bank Account
              </button>
            </Link>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
                Total Contracts
              </span>
              <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <Briefcase className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-black text-surface-900">
              {applications.length}
            </p>
            <p className="mt-1 text-xs text-surface-500">
              {acceptedApps.length} active collaborations
            </p>
          </div>

          <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
                Pending Pitches
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-black text-surface-900">
              {pendingApps.length}
            </p>
            <p className="mt-1 text-xs text-surface-500">
              Awaiting brand review
            </p>
          </div>

          <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
                Audience Tier
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Star className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-black text-surface-900 capitalize">
              {creator?.audience_size || "Creator"}
            </p>
            <p className="mt-1 text-xs text-surface-500">
              {creator?.niches?.slice(0, 2).join(", ") || "General Content"}
            </p>
          </div>

          <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
                Escrow Security
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-black text-emerald-600">
              100% Guaranteed
            </p>
            <p className="mt-1 text-xs text-surface-500">
              Funds locked before work starts
            </p>
          </div>
        </div>

        {/* Content Section: My Applications & Brand Brief Matching */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Applications / Contracts Panel */}
          <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-surface-900">My Applications & Contracts</h2>
                  <p className="text-xs text-surface-500 mt-0.5">Track your pitches and active brand deliverables</p>
                </div>
                <FileText className="h-5 w-5 text-surface-400" />
              </div>

              {applications.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-surface-200 rounded-xl">
                  <Briefcase className="h-8 w-8 text-surface-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-surface-800">No applications yet</p>
                  <p className="text-xs text-surface-400 mt-1 max-w-xs mx-auto">
                    Browse open brand briefs below and submit your pitch to start earning.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.slice(0, 5).map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between rounded-xl border border-surface-100 bg-surface-50/60 p-4 transition-all hover:border-brand-200"
                    >
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-surface-900">
                          {app.campaign && "title" in app.campaign
                            ? (app.campaign as Campaign).title
                            : "Brand Brief Collaboration"}
                        </p>
                        <p className="text-xs text-surface-500">
                          Pitched on {formatDate(app.created_at)}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
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
              <Link href="/contracts" className="block mt-6">
                <button className="w-full rounded-xl border border-surface-200 bg-white py-2.5 text-xs font-bold text-surface-700 hover:bg-surface-50 transition-colors">
                  View All Contracts
                </button>
              </Link>
            )}
          </div>

          {/* Brand Brief Matching Panel */}
          <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-surface-900">Matching Brand Briefs</h2>
                  <p className="text-xs text-surface-500 mt-0.5">Available campaigns accepting creator pitches</p>
                </div>
                <Sparkles className="h-5 w-5 text-brand-600" />
              </div>

              {matchingCampaigns.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-surface-200 rounded-xl">
                  <Sparkles className="h-8 w-8 text-surface-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-surface-800">No active briefs right now</p>
                  <p className="text-xs text-surface-400 mt-1 max-w-xs mx-auto">
                    New brand campaigns are added daily. Check back soon!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {matchingCampaigns.map((camp) => (
                    <div
                      key={camp.id}
                      className="flex items-center justify-between rounded-xl border border-surface-100 bg-white p-4 hover:border-brand-300 shadow-2xs transition-all"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-surface-900">
                          {camp.title}
                        </p>
                        <p className="text-xs text-surface-500 line-clamp-1">
                          {camp.description}
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-sm font-extrabold text-brand-700">
                          {formatCurrency(Number(camp.budget))}
                        </p>
                        <Link
                          href={`/campaigns/${camp.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 mt-1"
                        >
                          Apply <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link href="/campaigns" className="block mt-6">
              <button className="w-full rounded-xl bg-brand-600 hover:bg-brand-700 text-white py-2.5 text-xs font-bold transition-colors shadow-xs">
                Explore All Brand Briefs
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
