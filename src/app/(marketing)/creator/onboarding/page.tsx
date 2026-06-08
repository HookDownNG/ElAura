"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { saveCreatorOnboarding } from "@/lib/creator-actions"
import { Check, ChevronLeft, ChevronRight, Users, Globe, Package, Image, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const PLATFORMS = [
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "x", label: "X (Twitter)" },
] as const

const NICHE_OPTIONS = [
  "Tech/Software", "Fashion & Beauty", "Lifestyle", "Food/Cooking",
  "Finance/Crypto", "Gaming", "Entertainment/Comedy", "Travel",
  "Fitness/Health", "Education", "Music", "Sports",
] as const

const TIER_OPTIONS = [
  { value: "nano", label: "Nano Creator", desc: "Under 5k followers" },
  { value: "micro", label: "Micro Creator", desc: "5k – 50k followers" },
  { value: "macro", label: "Macro Creator", desc: "50k – 500k followers" },
  { value: "mega", label: "Mega Creator", desc: "500k+ followers" },
] as const

const LANGUAGES = [
  "English", "French", "Portuguese", "Arabic", "Swahili",
  "Yoruba", "Hausa", "Igbo", "Amharic", "Other",
] as const

const TURNAROUND_OPTIONS = [3, 5, 7, 14] as const

const USAGE_RIGHTS_OPTIONS = [
  { value: "none", label: "No usage rights included" },
  { value: "30_days", label: "30 days" },
  { value: "90_days", label: "90 days" },
  { value: "perpetual", label: "Perpetual rights" },
] as const

const PACKAGE_TEMPLATES = [
  { type: "tiktok_reel", label: "TikTok / Reel (Short-form vertical)" },
  { type: "instagram_carousel", label: "Instagram Carousel / Post" },
  { type: "youtube_video", label: "YouTube Dedicated Video (Long-form)" },
] as const

const STEPS = [
  { id: "social", label: "Social Profiles", icon: Users },
  { id: "niche", label: "Niche & Audience", icon: Globe },
  { id: "packages", label: "Packages & Pricing", icon: Package },
  { id: "portfolio", label: "Portfolio & Payout", icon: Image },
]

type SocialPlatform = { platform: string; handle: string }
type AudienceLocation = { country: string; city: string }
type CreatorPackage = { type: string; label: string; price: number }

function OnboardingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [platformHandles, setPlatformHandles] = useState<Record<string, string>>({})
  const [audienceLocations, setAudienceLocations] = useState<AudienceLocation[]>([{ country: "", city: "" }])
  const [contentLanguage, setContentLanguage] = useState("")

  const [selectedNiches, setSelectedNiches] = useState<string[]>([])
  const [audienceDemographic, setAudienceDemographic] = useState("")
  const [audienceTier, setAudienceTier] = useState<string | null>(null)

  const [packages, setPackages] = useState<CreatorPackage[]>([])
  const [turnaroundDays, setTurnaroundDays] = useState<number>(5)
  const [usageRights, setUsageRights] = useState("")

  const [bio, setBio] = useState("")
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>([""])
  const [payoutMethod, setPayoutMethod] = useState("")
  const [payoutCurrency, setPayoutCurrency] = useState("NGN")

  useEffect(() => {
    checkSession()
  }, [])

  async function checkSession() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/creator")
      return
    }
    setLoading(false)
  }

  function togglePlatform(platform: string) {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform],
    )
  }

  function updateHandle(platform: string, handle: string) {
    setPlatformHandles(prev => ({ ...prev, [platform]: handle }))
  }

  function updateLocation(index: number, field: keyof AudienceLocation, value: string) {
    setAudienceLocations(prev => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  function addLocation() {
    if (audienceLocations.length < 3) {
      setAudienceLocations(prev => [...prev, { country: "", city: "" }])
    }
  }

  function removeLocation(index: number) {
    setAudienceLocations(prev => prev.filter((_, i) => i !== index))
  }

  function toggleNiche(niche: string) {
    setSelectedNiches(prev =>
      prev.includes(niche)
        ? prev.filter(n => n !== niche)
        : prev.length < 3 ? [...prev, niche] : prev,
    )
  }

  function updatePackage(index: number, field: keyof CreatorPackage, value: string | number) {
    setPackages(prev => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  function addPackage() {
    setPackages(prev => [...prev, { type: "custom", label: "", price: 0 }])
  }

  function removePackage(index: number) {
    setPackages(prev => prev.filter((_, i) => i !== index))
  }

  function addPackageFromTemplate(tpl: typeof PACKAGE_TEMPLATES[number]) {
    if (packages.some(p => p.type === tpl.type)) return
    setPackages(prev => [...prev, { type: tpl.type, label: tpl.label, price: 0 }])
  }

  function updatePortfolioUrl(index: number, value: string) {
    setPortfolioUrls(prev => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  function addPortfolioUrl() {
    if (portfolioUrls.length < 5) {
      setPortfolioUrls(prev => [...prev, ""])
    }
  }

  function removePortfolioUrl(index: number) {
    setPortfolioUrls(prev => prev.filter((_, i) => i !== index))
  }

  function canProceed(): boolean {
    switch (step) {
      case 0:
        return selectedPlatforms.length > 0 &&
          selectedPlatforms.every(p => platformHandles[p]?.trim())
      case 1:
        return selectedNiches.length > 0 && audienceTier !== null
      case 2:
        return packages.length > 0 && packages.every(p => p.price > 0)
      case 3:
        return bio.trim().length > 0
      default:
        return false
    }
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)

    const formData = new FormData()
    const socialPlatforms: SocialPlatform[] = selectedPlatforms.map(p => ({
      platform: p,
      handle: platformHandles[p] || "",
    }))
    formData.set("social_platforms", JSON.stringify(socialPlatforms))
    formData.set("audience_locations", JSON.stringify(audienceLocations.filter(l => l.country && l.city)))
    formData.set("content_language", contentLanguage)
    formData.set("niches", JSON.stringify(selectedNiches))
    formData.set("audience_demographic", audienceDemographic)
    formData.set("audience_tier", audienceTier || "")
    formData.set("packages", JSON.stringify(packages.filter(p => p.price > 0)))
    formData.set("turnaround_days", String(turnaroundDays))
    formData.set("usage_rights", usageRights)
    formData.set("bio", bio.trim())
    formData.set("portfolio_urls", JSON.stringify(portfolioUrls.filter(u => u.trim())))
    formData.set("payout_method", payoutMethod)
    formData.set("payout_currency", payoutCurrency)

    const result = await saveCreatorOnboarding(formData)
    if (result?.error) {
      setError(result.error)
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    )
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
              const Icon = s.icon
              const isActive = i === step
              const isComplete = i < step
              return (
                <div key={s.id} className="flex flex-col items-center">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                    isComplete && "border-brand-600 bg-brand-600 text-white",
                    isActive && "border-brand-600 text-brand-600",
                    !isActive && !isComplete && "border-surface-300 text-surface-400",
                  )}>
                    {isComplete ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={cn(
                    "mt-1.5 text-xs font-medium hidden sm:block",
                    (isActive || isComplete) ? "text-brand-600" : "text-surface-400",
                  )}>
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mt-4 flex gap-1">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  i < step ? "bg-brand-600" : i === step ? "bg-brand-400" : "bg-surface-200",
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
                <h2 className="text-lg font-bold text-surface-900">Social Profile & Audience</h2>
                <p className="mt-1 text-sm text-surface-500">Connect your social accounts so brands can see your metrics</p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-surface-900">Which platforms do you offer services on?</label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map(p => (
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
                  <label className="text-sm font-semibold text-surface-900">Your handles</label>
                  {selectedPlatforms.map(p => (
                    <div key={p}>
                      <label className="mb-1.5 block text-xs font-medium text-surface-500">
                        {PLATFORMS.find(x => x.value === p)?.label} handle
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-surface-400">@</span>
                        <input
                          type="text"
                          value={platformHandles[p] || ""}
                          onChange={e => updateHandle(p, e.target.value)}
                          placeholder="username"
                          className="w-full rounded-xl border border-surface-200 bg-white py-3 pl-8 pr-4 text-sm outline-none focus:border-brand-400 transition-colors placeholder:text-surface-300"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-4">
                <label className="text-sm font-semibold text-surface-900">Top audience locations (up to 3)</label>
                {audienceLocations.map((loc, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={loc.country}
                        onChange={e => updateLocation(i, "country", e.target.value)}
                        placeholder="Country (e.g., Nigeria)"
                        className="w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-400 transition-colors placeholder:text-surface-300"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={loc.city}
                        onChange={e => updateLocation(i, "city", e.target.value)}
                        placeholder="City (e.g., Lagos)"
                        className="w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-400 transition-colors placeholder:text-surface-300"
                      />
                    </div>
                    {audienceLocations.length > 1 && (
                      <button type="button" onClick={() => removeLocation(i)}
                        className="mt-3 text-surface-400 hover:text-red-500 transition-colors">
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                {audienceLocations.length < 3 && (
                  <button type="button" onClick={addLocation}
                    className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
                    + Add location
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-surface-900">Primary content language</label>
                <select
                  value={contentLanguage}
                  onChange={e => setContentLanguage(e.target.value)}
                  className="w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-400 transition-colors"
                >
                  <option value="">Select language</option>
                  {LANGUAGES.map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-7">
              <div>
                <h2 className="text-lg font-bold text-surface-900">Niche & Content Category</h2>
                <p className="mt-1 text-sm text-surface-500">Tag yourself so brands can find you in search</p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-surface-900">Core content niches (select up to 3)</label>
                <div className="flex flex-wrap gap-2">
                  {NICHE_OPTIONS.map(n => (
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
                <p className="text-xs text-surface-400">{selectedNiches.length}/3 selected</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-surface-900">Audience size</label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {TIER_OPTIONS.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setAudienceTier(t.value)}
                      className={cn(
                        "text-left rounded-xl border p-4 transition-all",
                        audienceTier === t.value
                          ? "bg-brand-50 border-brand-400 ring-2 ring-brand-200"
                          : "bg-white border-surface-200 hover:border-brand-200",
                      )}
                    >
                      <p className={cn("text-sm font-bold", audienceTier === t.value ? "text-brand-700" : "text-surface-900")}>
                        {t.label}
                      </p>
                      <p className="text-xs text-surface-400 mt-0.5">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-surface-900">Target audience demographic</label>
                <input
                  type="text"
                  value={audienceDemographic}
                  onChange={e => setAudienceDemographic(e.target.value)}
                  placeholder="e.g., Gen Z, Tech Professionals, Corporate Workers"
                  className="w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-400 transition-colors placeholder:text-surface-300"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-7">
              <div>
                <h2 className="text-lg font-bold text-surface-900">Packages & Pricing</h2>
                <p className="mt-1 text-sm text-surface-500">Define what you offer and what you charge</p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-surface-900">Quick-add package templates</label>
                <div className="flex flex-wrap gap-2">
                  {PACKAGE_TEMPLATES.map(t => (
                    <button
                      key={t.type}
                      type="button"
                      onClick={() => addPackageFromTemplate(t)}
                      disabled={packages.some(p => p.type === t.type)}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium border transition-all",
                        packages.some(p => p.type === t.type)
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
                <label className="text-sm font-semibold text-surface-900">Your packages</label>
                {packages.map((pkg, i) => (
                  <div key={i} className="flex gap-3 items-start rounded-xl border border-surface-200 bg-surface-50 p-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={pkg.label}
                        onChange={e => updatePackage(i, "label", e.target.value)}
                        placeholder="Package name"
                        className="w-full rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 transition-colors placeholder:text-surface-300"
                      />
                    </div>
                    <div className="w-28">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-surface-400">₦</span>
                        <input
                          type="number"
                          value={pkg.price || ""}
                          onChange={e => updatePackage(i, "price", Number(e.target.value))}
                          placeholder="0"
                          className="w-full rounded-lg border border-surface-200 bg-white py-2 pl-7 pr-3 text-sm outline-none focus:border-brand-400 transition-colors placeholder:text-surface-300"
                        />
                      </div>
                    </div>
                    <button type="button" onClick={() => removePackage(i)}
                      className="mt-1 text-surface-400 hover:text-red-500 transition-colors">
                      ✕
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addPackage}
                  className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
                  + Add custom package
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-surface-900">Standard turnaround time</label>
                <select
                  value={turnaroundDays}
                  onChange={e => setTurnaroundDays(Number(e.target.value))}
                  className="w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-400 transition-colors"
                >
                  {TURNAROUND_OPTIONS.map(d => (
                    <option key={d} value={d}>{d} days</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-surface-900">Content usage rights</label>
                <div className="space-y-2">
                  {USAGE_RIGHTS_OPTIONS.map(r => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setUsageRights(r.value)}
                      className={cn(
                        "w-full text-left rounded-xl border p-3 transition-all",
                        usageRights === r.value
                          ? "bg-brand-50 border-brand-400"
                          : "bg-white border-surface-200 hover:border-brand-200",
                      )}
                    >
                      <p className={cn("text-sm font-medium", usageRights === r.value ? "text-brand-700" : "text-surface-900")}>
                        {r.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-7">
              <div>
                <h2 className="text-lg font-bold text-surface-900">Portfolio & Payout</h2>
                <p className="mt-1 text-sm text-surface-500">Show brands your best work and set up how you get paid</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-surface-900">Bio</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Describe your content style and why brands love working with you (2-3 sentences)"
                  rows={3}
                  className="w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-400 transition-colors placeholder:text-surface-300 resize-none"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-surface-900">Portfolio URLs (3-5 of your best pieces)</label>
                {portfolioUrls.map((url, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <input
                      type="url"
                      value={url}
                      onChange={e => updatePortfolioUrl(i, e.target.value)}
                      placeholder="https://... (Instagram, TikTok, YouTube link)"
                      className="flex-1 rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-400 transition-colors placeholder:text-surface-300"
                    />
                    {portfolioUrls.length > 1 && (
                      <button type="button" onClick={() => removePortfolioUrl(i)}
                        className="mt-3 text-surface-400 hover:text-red-500 transition-colors">
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                {portfolioUrls.length < 5 && (
                  <button type="button" onClick={addPortfolioUrl}
                    className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
                    + Add link
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-surface-900">Payout currency</label>
                  <select
                    value={payoutCurrency}
                    onChange={e => setPayoutCurrency(e.target.value)}
                    className="w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-400 transition-colors"
                  >
                    <option value="NGN">NGN (₦) — Nigerian Naira</option>
                    <option value="USD">USD ($) — US Dollar</option>
                    <option value="KES">KES — Kenyan Shilling</option>
                    <option value="GHS">GHS — Ghanaian Cedi</option>
                    <option value="ZAR">ZAR — South African Rand</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-surface-900">Payout method</label>
                  <input
                    type="text"
                    value={payoutMethod}
                    onChange={e => setPayoutMethod(e.target.value)}
                    placeholder="e.g., Bank Transfer, PayPal"
                    className="w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-400 transition-colors placeholder:text-surface-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between border-t border-surface-200 pt-6">
            <button
              type="button"
              onClick={() => setStep(prev => Math.max(0, prev - 1))}
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
                onClick={() => setStep(prev => prev + 1)}
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
  )
}

export default function CreatorOnboardingPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  )
}
