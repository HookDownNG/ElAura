"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { saveStorefront } from "@/lib/auth-actions"

const NICHE_OPTIONS = [
  "UGC", "Fashion", "Tech", "Lifestyle", "Beauty",
  "Fitness", "Food", "Gaming", "Music", "Comedy",
  "Education", "Travel", "Sports", "Business",
]

const TIER_OPTIONS = [
  { value: "nano", label: "Nano Creator", desc: "Under 5k followers" },
  { value: "micro", label: "Micro Creator", desc: "5k – 50k followers" },
  { value: "macro", label: "Macro Creator", desc: "50k – 500k followers" },
  { value: "mega", label: "Mega Creator", desc: "500k+ followers" },
] as const

function StorefrontContent() {
  const searchParams = useSearchParams()
  const user_name = searchParams.get("user_name") || ""
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<"auth" | "storefront">("auth")
  const [userName, setUserName] = useState("")
  const [selectedNiches, setSelectedNiches] = useState<string[]>([])
  const [audienceTier, setAudienceTier] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user_name) {
      router.push("/creator")
      return
    }
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push(`/join?user_name=${encodeURIComponent(user_name)}`)
        return
      }
      setStep("storefront")
    }
    checkAuth()
  }, [user_name, router, supabase])

  function toggleNiche(niche: string) {
    setSelectedNiches(prev =>
      prev.includes(niche)
        ? prev.filter(n => n !== niche)
        : [...prev, niche],
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!userName.trim() || selectedNiches.length === 0 || !audienceTier) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.set("user_name", userName.trim())
    formData.set("niches", JSON.stringify(selectedNiches))
    formData.set("audience_tier", audienceTier)

    const result = await saveStorefront(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  if (step === "auth") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="text-center mb-10">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
            <svg className="h-7 w-7 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-surface-900">
            Set Up Your Creator Storefront
          </h1>
          <p className="text-surface-500 text-sm mt-2">
            Locking in @{user_name} — just a few more details
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* User Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-surface-900">
              Username
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="yourname"
              className="w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-400 transition-colors placeholder:text-surface-300"
            />
            <p className="text-xs text-surface-400">
              This will be your public profile URL: elaura.com/{userName || "yourname"}
            </p>
          </div>

          {/* Niche Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-surface-900">
              What do you create?
            </label>
            <div className="flex flex-wrap gap-2">
              {NICHE_OPTIONS.map((niche) => (
                <button
                  key={niche}
                  type="button"
                  onClick={() => toggleNiche(niche)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    selectedNiches.includes(niche)
                      ? "bg-brand-600 text-white border-brand-600"
                      : "bg-white text-surface-600 border-surface-200 hover:border-brand-200"
                  }`}
                >
                  {niche}
                </button>
              ))}
            </div>
          </div>

          {/* Audience Tier */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-surface-900">
              Audience Size
            </label>
            <div className="grid sm:grid-cols-2 gap-3">
              {TIER_OPTIONS.map((tier) => (
                <button
                  key={tier.value}
                  type="button"
                  onClick={() => setAudienceTier(tier.value)}
                  className={`text-left rounded-xl border p-4 transition-all ${
                    audienceTier === tier.value
                      ? "bg-brand-50 border-brand-400 ring-2 ring-brand-200"
                      : "bg-white border-surface-200 hover:border-brand-200"
                  }`}
                >
                  <p className={`text-sm font-bold ${audienceTier === tier.value ? "text-brand-700" : "text-surface-900"}`}>
                    {tier.label}
                  </p>
                  <p className="text-xs text-surface-400 mt-0.5">{tier.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-full px-6 py-3.5 text-sm font-semibold transition-all disabled:opacity-60 shadow-lg shadow-brand-100/50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Setting up...
              </span>
            ) : (
              "Start Your Journey"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function StorefrontPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    }>
      <StorefrontContent />
    </Suspense>
  )
}
