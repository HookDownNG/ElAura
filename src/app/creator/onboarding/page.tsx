"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { saveCreatorOnboarding } from "@/lib/creator-actions";
import { GlobalLoader } from "@/components/ui/global-loader";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Users,
  Package,
  Image,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PLATFORMS = [
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "x", label: "X (Twitter)" },
] as const;

const NICHE_OPTIONS = [
  "Tech/Software",
  "Fashion & Beauty",
  "Lifestyle",
  "Food/Cooking",
  "Finance/Crypto",
  "Gaming",
  "Entertainment/Comedy",
  "Travel",
  "Fitness/Health",
  "Education",
  "Music",
  "Sports",
] as const;

const TIER_OPTIONS = [
  { value: "nano", label: "Nano Creator", desc: "Under 5k followers" },
  { value: "micro", label: "Micro Creator", desc: "5k – 50k followers" },
  { value: "macro", label: "Macro Creator", desc: "50k – 500k followers" },
  { value: "mega", label: "Mega Creator", desc: "500k+ followers" },
] as const;

const PACKAGE_TEMPLATES = [
  { type: "tiktok_reel", label: "TikTok / Reel (Short-form vertical)" },
  { type: "instagram_carousel", label: "Instagram Carousel / Post" },
  { type: "youtube_video", label: "YouTube Dedicated Video (Long-form)" },
] as const;

const STEPS = [
  { id: "profile", label: "Profile & Audience", icon: Users },
  { id: "packages", label: "Packages & Pricing", icon: Package },
  { id: "portfolio", label: "Portfolio & Bio", icon: Image },
];

type SocialPlatform = { platform: string; handle: string };
type CreatorPackage = { type: string; label: string; price: number };

function OnboardingContent() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [platformHandles, setPlatformHandles] = useState<
    Record<string, string>
  >({});

  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [audienceSize, setAudienceSize] = useState<string | null>(null);

  const [packages, setPackages] = useState<CreatorPackage[]>([]);

  const [bio, setBio] = useState("");
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>([""]);

  useEffect(() => {
    let isMounted = true;
    async function checkSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/creator");
        return;
      }
      router.push("/creator/dashboard");
    }
    checkSession();
    return () => {
      isMounted = false;
    };
  }, [router, supabase]);

  function togglePlatform(platform: string) {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform],
    );
  }

  function updateHandle(platform: string, handle: string) {
    setPlatformHandles((prev) => ({ ...prev, [platform]: handle }));
  }

  function toggleNiche(niche: string) {
    setSelectedNiches((prev) =>
      prev.includes(niche)
        ? prev.filter((n) => n !== niche)
        : prev.length < 3
          ? [...prev, niche]
          : prev,
    );
  }

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

  function addPackageFromTemplate(tpl: (typeof PACKAGE_TEMPLATES)[number]) {
    if (packages.some((p) => p.type === tpl.type)) return;
    setPackages((prev) => [
      ...prev,
      { type: tpl.type, label: tpl.label, price: 0 },
    ]);
  }

  function updatePortfolioUrl(index: number, value: string) {
    setPortfolioUrls((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function addPortfolioUrl() {
    if (portfolioUrls.length < 5) {
      setPortfolioUrls((prev) => [...prev, ""]);
    }
  }

  function removePortfolioUrl(index: number) {
    setPortfolioUrls((prev) => prev.filter((_, i) => i !== index));
  }

  function canProceed(): boolean {
    switch (step) {
      case 0:
        return (
          selectedPlatforms.length > 0 &&
          selectedPlatforms.every((p) => platformHandles[p]?.trim()) &&
          selectedNiches.length > 0 &&
          audienceSize !== null
        );
      case 1:
        return packages.length > 0 && packages.every((p) => p.price > 0);
      case 2:
        return bio.trim().length > 0;
      default:
        return false;
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    let pendingUserName = "";
    try {
      pendingUserName = localStorage.getItem("pending_user_name") || "";
    } catch {}

    const formData = new FormData();
    const socialPlatforms: SocialPlatform[] = selectedPlatforms.map((p) => ({
      platform: p,
      handle: platformHandles[p] || "",
    }));
    formData.set("social_platforms", JSON.stringify(socialPlatforms));
    formData.set("niches", JSON.stringify(selectedNiches));
    formData.set("audience_size", audienceSize || "");
    formData.set("user_name", pendingUserName);
    formData.set(
      "packages",
      JSON.stringify(packages.filter((p) => p.price > 0)),
    );
    formData.set("bio", bio.trim());
    formData.set(
      "portfolio_urls",
      JSON.stringify(portfolioUrls.filter((u) => u.trim())),
    );

    const result = await saveCreatorOnboarding(formData);
    if (result?.error) {
      setError(result.error);
      setSubmitting(false);
    } else {
      try {
        localStorage.removeItem("pending_user_name");
      } catch {}
    }
  }

  if (loading) {
    return <GlobalLoader message="Loading onboarding..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
            <Sparkles className="h-7 w-7 text-brand-600" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-surface-900">
            Set Up Your Creator Profile
          </h1>
          <p className="mt-2 text-sm text-surface-500">
            Build your marketplace profile so brands can find and buy from you
          </p>
        </div>

        {/* Step indicators */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isComplete = i < step;
              return (
                <div key={s.id} className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                      isComplete && "border-brand-600 bg-brand-600 text-white",
                      isActive && "border-brand-600 text-brand-600",
                      !isActive &&
                        !isComplete &&
                        "border-surface-300 text-surface-400",
                    )}
                  >
                    {isComplete ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "mt-1.5 text-xs font-medium text-center hidden sm:block",
                      isActive || isComplete
                        ? "text-brand-600"
                        : "text-surface-400",
                    )}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex gap-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  i < step
                    ? "bg-brand-600"
                    : i === step
                      ? "bg-brand-400"
                      : "bg-surface-200",
                )}
              />
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="rounded-2xl border border-surface-200 bg-white p-6 sm:p-8 shadow-sm">
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {step === 0 && (
            <div className="space-y-7">
              <div>
                <h2 className="text-lg font-bold text-surface-900">
                  Profile & Audience
                </h2>
                <p className="mt-1 text-sm text-surface-500">
                  Connect your socials and define your niche
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-surface-900">
                  Which platforms do you offer services on?
                </label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => togglePlatform(p.value)}
                      className={cn(
                        "px-4 py-2.5 rounded-full text-sm font-medium border transition-all",
                        selectedPlatforms.includes(p.value)
                          ? "bg-brand-600 text-white border-brand-600"
                          : "bg-white text-surface-600 border-surface-200 hover:border-brand-200",
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {selectedPlatforms.length > 0 && (
                <div className="space-y-4">
                  <label className="text-sm font-semibold text-surface-900">
                    Your handles
                  </label>
                  {selectedPlatforms.map((p) => (
                    <div key={p}>
                      <label className="mb-1.5 block text-xs font-medium text-surface-500">
                        {PLATFORMS.find((x) => x.value === p)?.label} handle
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-surface-400">
                          @
                        </span>
                        <input
                          type="text"
                          value={platformHandles[p] || ""}
                          onChange={(e) => updateHandle(p, e.target.value)}
                          placeholder="username"
                          className="w-full rounded-xl border border-surface-200 bg-white py-3 pl-8 pr-4 text-sm outline-none focus:border-brand-400 transition-colors placeholder:text-surface-300"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-3 pt-2 border-t border-surface-100">
                <label className="text-sm font-semibold text-surface-900">
                  Core content niches (select up to 3)
                </label>
                <div className="flex flex-wrap gap-2">
                  {NICHE_OPTIONS.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => toggleNiche(n)}
                      className={cn(
                        "px-4 py-2.5 rounded-full text-sm font-medium border transition-all",
                        selectedNiches.includes(n)
                          ? "bg-brand-600 text-white border-brand-600"
                          : "bg-white text-surface-600 border-surface-200 hover:border-brand-200",
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-surface-400">
                  {selectedNiches.length}/3 selected
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-surface-900">
                  Audience size
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {TIER_OPTIONS.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setAudienceSize(t.value)}
                      className={cn(
                        "text-left rounded-xl border p-4 transition-all",
                        audienceSize === t.value
                          ? "bg-brand-50 border-brand-400 ring-2 ring-brand-200"
                          : "bg-white border-surface-200 hover:border-brand-200",
                      )}
                    >
                      <p
                        className={cn(
                          "text-sm font-bold",
                          audienceSize === t.value
                            ? "text-brand-700"
                            : "text-surface-900",
                        )}
                      >
                        {t.label}
                      </p>
                      <p className="text-xs text-surface-400 mt-0.5">
                        {t.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-7">
              <div>
                <h2 className="text-lg font-bold text-surface-900">
                  Packages & Pricing
                </h2>
                <p className="mt-1 text-sm text-surface-500">
                  Define what you offer and what you charge
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-surface-900">
                  Quick-add package templates
                </label>
                <div className="flex flex-wrap gap-2">
                  {PACKAGE_TEMPLATES.map((t) => (
                    <button
                      key={t.type}
                      type="button"
                      onClick={() => addPackageFromTemplate(t)}
                      disabled={packages.some((p) => p.type === t.type)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium border transition-all",
                        packages.some((p) => p.type === t.type)
                          ? "bg-surface-100 text-surface-400 border-surface-200 cursor-not-allowed"
                          : "bg-white text-surface-600 border-surface-200 hover:border-brand-200",
                      )}
                    >
                      + {t.label.split("(")[0].trim()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-semibold text-surface-900">
                  Your packages
                </label>
                {packages.map((pkg, i) => (
                  <div
                    key={i}
                    className="flex gap-3 items-start rounded-xl border border-surface-200 bg-surface-50 p-4"
                  >
                    <div className="flex-1">
                      <input
                        type="text"
                        value={pkg.label}
                        onChange={(e) =>
                          updatePackage(i, "label", e.target.value)
                        }
                        placeholder="Package name"
                        className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 transition-colors placeholder:text-surface-300"
                      />
                    </div>
                    <div className="w-28">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-surface-400">
                          ₦
                        </span>
                        <input
                          type="number"
                          value={pkg.price || ""}
                          onChange={(e) =>
                            updatePackage(i, "price", Number(e.target.value))
                          }
                          placeholder="0"
                          className="w-full rounded-lg border border-surface-200 bg-white py-2 pl-7 pr-3 text-sm outline-none focus:border-brand-400 transition-colors placeholder:text-surface-300"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePackage(i)}
                      className="mt-1 text-surface-400 hover:text-red-500 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addPackage}
                  className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
                >
                  + Add custom package
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-7">
              <div>
                <h2 className="text-lg font-bold text-surface-900">
                  Portfolio & Bio
                </h2>
                <p className="mt-1 text-sm text-surface-500">
                  Show brands your best work and introduce yourself
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-surface-900">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe your content style and why brands love working with you (2-3 sentences)"
                  rows={3}
                  className="w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-400 transition-colors placeholder:text-surface-300 resize-none"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-surface-900">
                  Portfolio URLs (1-5 of your best pieces)
                </label>
                {portfolioUrls.map((url, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => updatePortfolioUrl(i, e.target.value)}
                      placeholder="https://... (Instagram, TikTok, YouTube link)"
                      className="flex-1 rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-400 transition-colors placeholder:text-surface-300"
                    />
                    {portfolioUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePortfolioUrl(i)}
                        className="mt-3 text-surface-400 hover:text-red-500 transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                {portfolioUrls.length < 5 && (
                  <button
                    type="button"
                    onClick={addPortfolioUrl}
                    className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
                  >
                    + Add link
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between border-t border-surface-200 pt-6">
            <button
              type="button"
              onClick={() => setStep((prev) => Math.max(0, prev - 1))}
              disabled={step === 0}
              className="inline-flex items-center gap-1.5 rounded-full border border-surface-200 px-5 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>

            <span className="text-xs text-surface-400">
              Step {step + 1} of {STEPS.length}
            </span>

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => prev + 1)}
                disabled={!canProceed()}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canProceed() || submitting}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </span>
                ) : (
                  "Complete Setup"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreatorOnboardingPage() {
  return (
    <Suspense fallback={<GlobalLoader message="Loading ElAura..." />}>
      <OnboardingContent />
    </Suspense>
  );
}
