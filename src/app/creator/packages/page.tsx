"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  CheckCircle2,
  User,
  Bot,
  Sparkles,
  Clapperboard,
  Play,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { GlobalLoader } from "@/components/ui/global-loader";
import { UGC_PACKAGE_TEMPLATES } from "@/components/creator/ugc-package-modal";
import { VideoSampleModal } from "@/components/storefront/video-sample-modal";
import type {
  Creator,
  CreatorPackage,
  CreatorCategory,
  Profile,
} from "@/types";

export default function CreatorPackagesPage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [creatorCategory, setCreatorCategory] =
    useState<CreatorCategory>("human_ugc");
  const [packages, setPackages] = useState<CreatorPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<{
    url: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    async function loadPackagesData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Load Profile and Creator concurrently in parallel
      const [{ data: profileData }, { data: creatorData }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("creators").select("*").eq("id", user.id).maybeSingle(),
      ]);

      if (profileData) {
        setProfile(profileData);
      }

      if (creatorData) {
        setCreator(creatorData);
        if (creatorData.creator_category) {
          setCreatorCategory(creatorData.creator_category as CreatorCategory);
        }
        if (Array.isArray(creatorData.packages)) {
          setPackages(creatorData.packages as CreatorPackage[]);
        }
      }

      setLoading(false);
    }

    loadPackagesData();
  }, [router, supabase]);

  function addPackageFromTemplate(tpl: (typeof UGC_PACKAGE_TEMPLATES)[number]) {
    if (packages.some((p) => p.type === tpl.type)) return;
    setPackages((prev) => [
      { type: tpl.type as CreatorPackage["type"], label: tpl.label, price: 0 },
      ...prev,
    ]);
  }

  function addPackage() {
    setPackages((prev) => [
      {
        type: "custom",
        label: "Custom UGC Video Package",
        price: 0,
      },
      ...prev,
    ]);
  }

  function updatePackage(
    index: number,
    field: keyof CreatorPackage,
    value: string | number,
  ) {
    setPackages((prev) =>
      prev.map((pkg, i) => (i === index ? { ...pkg, [field]: value } : pkg)),
    );
  }

  function removePackage(index: number) {
    setPackages((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);

    const validPackages = packages.filter((p) => p.label.trim() && p.price > 0);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Not authenticated");
      setSaving(false);
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
      setError(saveError.message);
      setSaving(false);
      return;
    }

    setPackages(validPackages);
    setSuccess(true);
    setSaving(false);

    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  }

  if (loading) {
    return (
      <GlobalLoader message="Loading your UGC Packages..." fullScreen={true} />
    );
  }

  return (
    <div className="min-h-screen bg-surface-50/60 pb-28 md:pb-16 pt-4 sm:pt-8 px-3.5 sm:px-6 lg:px-8 select-none">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Top Header & Title */}
        <div className="flex items-center justify-between gap-4 border-b border-surface-200/80 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-surface-900 tracking-tight">
              UGC Packages & Rates
            </h1>
            <p className="text-xs text-surface-500">
              Set rates and offerings for On-Camera & AI UGC video campaigns
            </p>
          </div>
        </div>

        {/* Feedback Notifications */}
        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-xs text-red-600 font-medium border border-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl bg-emerald-50 p-4 text-xs text-emerald-800 font-semibold border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Your UGC Packages & Creator Profile have been saved successfully!
          </div>
        )}

        {/* 1. Creator Type Selector */}
        <div className="rounded-2xl border border-surface-200 bg-white p-4 sm:p-6 shadow-2xs space-y-3">
          <label className="text-xs font-bold text-surface-700 uppercase tracking-wider block">
            1. Select Creator Type
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setCreatorCategory("human_ugc")}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left min-h-14 ${
                creatorCategory === "human_ugc"
                  ? "bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-200 font-bold"
                  : "bg-surface-50 border-surface-200 text-surface-700 hover:bg-surface-100"
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold">On-Camera UGC</p>
                <p className="text-[11px] text-surface-500">
                  Real videos & unboxings
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setCreatorCategory("ai_ugc")}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left min-h-14 ${
                creatorCategory === "ai_ugc"
                  ? "bg-purple-50 border-purple-500 text-purple-900 ring-2 ring-purple-200 font-bold"
                  : "bg-surface-50 border-surface-200 text-surface-700 hover:bg-surface-100"
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold">AI UGC</p>
                <p className="text-[11px] text-surface-500">
                  AI avatars & voiceovers
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setCreatorCategory("hybrid")}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left min-h-14 ${
                creatorCategory === "hybrid"
                  ? "bg-brand-50 border-brand-500 text-brand-900 ring-2 ring-brand-200 font-bold"
                  : "bg-surface-50 border-surface-200 text-surface-700 hover:bg-surface-100"
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold">Hybrid Creator</p>
                <p className="text-[11px] text-surface-500">
                  Both Real & AI UGC
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Quick Add Templates */}
        <div className="rounded-2xl border border-surface-200 bg-white p-4 sm:p-6 shadow-2xs space-y-3">
          <label className="text-xs font-bold text-surface-700 uppercase tracking-wider block">
            2. Quick-Add Preset Templates
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
            {UGC_PACKAGE_TEMPLATES.map((t) => (
              <button
                key={t.type}
                type="button"
                onClick={() => addPackageFromTemplate(t)}
                disabled={packages.some((p) => p.type === t.type)}
                className="px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-surface-200 hover:border-brand-300 hover:bg-brand-50 text-surface-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 min-h-11"
              >
                + {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Listed UGC Packages Editor */}
        <div className="rounded-2xl border border-surface-200 bg-white p-4 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-surface-700 uppercase tracking-wider block">
              3. Listed Video Packages ({packages.length})
            </label>

            {/* User Customization: Plus Icon Only Button */}
            <button
              type="button"
              onClick={addPackage}
              className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 hover:bg-brand-100 flex items-center justify-center transition-colors shrink-0"
              title="Add Custom Package"
              aria-label="Add Custom Package"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {packages.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-surface-200 rounded-2xl px-4">
              <Clapperboard className="h-6 w-6 text-surface-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-surface-800">
                No UGC Packages Listed Yet
              </p>
              <p className="text-xs text-surface-500 mt-1 max-w-xs mx-auto">
                Use the Quick-Add Preset Templates above or click + to add a
                custom video package to showcase your rates to brands.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {packages.map((pkg, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-3 rounded-xl border border-surface-200 bg-surface-50/60 p-3.5 sm:p-4"
                >
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    {/* Package Title */}
                    <div className="flex-1 min-w-0">
                      <label className="text-[10px] font-bold text-surface-400 block mb-1">
                        PACKAGE TITLE
                      </label>
                      <input
                        type="text"
                        value={pkg.label}
                        onChange={(e) =>
                          updatePackage(i, "label", e.target.value)
                        }
                        placeholder="Package name (e.g., 1x 30s UGC Video Ad)"
                        className="w-full rounded-xl border border-surface-200 bg-white px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-brand-400 transition-colors min-h-11"
                      />
                    </div>

                    {/* Rate / Price Input with Comma Formatting */}
                    <div className="flex items-center gap-2">
                      <div className="w-full sm:w-36">
                        <label className="text-[10px] font-bold text-surface-400 block mb-1">
                          RATE (₦)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-surface-400">
                            ₦
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={
                              pkg.price
                                ? Number(pkg.price).toLocaleString("en-US")
                                : ""
                            }
                            onChange={(e) => {
                              const rawDigits = e.target.value.replace(
                                /[^0-9]/g,
                                "",
                              );
                              updatePackage(
                                i,
                                "price",
                                rawDigits ? Number(rawDigits) : 0,
                              );
                            }}
                            placeholder="0"
                            className="w-full rounded-xl border border-surface-200 bg-white py-2.5 pl-7 pr-3 text-xs font-bold text-surface-900 outline-none focus:border-brand-400 transition-colors min-h-11"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removePackage(i)}
                        className="text-surface-400 hover:text-red-600 transition-colors p-2.5 rounded-xl border border-surface-200 bg-white sm:bg-transparent min-h-11 min-w-11 flex items-center justify-center shrink-0 mt-4 sm:mt-0"
                        title="Remove Package"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Video Sample URL Row */}
                  <div className="pt-2 border-t border-surface-200/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-surface-500 block">
                        VIDEO SAMPLE URL (YOUTUBE / LOOM / MP4 LINK)
                      </label>
                      {pkg.sample_video_url && (
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewVideo({
                              url: pkg.sample_video_url!,
                              title: pkg.label,
                            })
                          }
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 hover:text-brand-700 transition-colors"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          <span>Preview Video</span>
                        </button>
                      )}
                    </div>
                    <input
                      type="url"
                      value={pkg.sample_video_url || ""}
                      onChange={(e) =>
                        updatePackage(i, "sample_video_url", e.target.value)
                      }
                      placeholder="https://youtube.com/watch?v=... or Loom / MP4 link"
                      className="w-full rounded-xl border border-surface-200 bg-white px-3.5 py-2.5 text-xs font-medium text-surface-900 outline-none focus:border-brand-400 transition-colors min-h-11"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* In-App Video Sample Preview Modal */}
      <VideoSampleModal
        isOpen={!!previewVideo}
        onClose={() => setPreviewVideo(null)}
        videoUrl={previewVideo?.url || null}
        packageTitle={previewVideo?.title}
      />

      {/* Mobile Floating Bottom Sticky Save Bar */}
      <div className="sm:hidden fixed bottom-14 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-surface-200 p-3 shadow-xl">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white py-3 text-xs font-bold transition-all shadow-md shadow-brand-100/50 disabled:opacity-50 min-h-11"
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>{saving ? "Saving..." : "Save Packages"}</span>
        </button>
      </div>
    </div>
  );
}
