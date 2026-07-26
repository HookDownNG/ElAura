"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { saveStorefront } from "@/lib/auth-actions"
import { GlobalLoader } from "@/components/ui/global-loader"
import { Bot, User, Sparkles } from "lucide-react"

const NICHE_OPTIONS = [
  "UGC Video Ads", "E-commerce Unboxing", "Fashion & Beauty", "Tech & Software", "Lifestyle",
  "Fitness & Health", "Food & Cooking", "Gaming", "Music", "Comedy",
  "Education", "Travel", "Sports", "Business & Finance",
]

const CATEGORY_OPTIONS = [
  { value: "human_ugc", label: "Human UGC Creator", desc: "On-camera filming, unboxing, real presenter", icon: User },
  { value: "ai_ugc", label: "AI UGC Creator", desc: "AI Avatars, AI Voiceovers, AI Video Generation", icon: Bot },
  { value: "hybrid", label: "Hybrid UGC Creator", desc: "Mix of real human filming and AI tools", icon: Sparkles },
] as const

function StorefrontContent() {
  const searchParams = useSearchParams()
  const user_name = searchParams.get("user_name") || ""
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<"auth" | "storefront">("auth")
  const [userName, setUserName] = useState("")
  const [selectedNiches, setSelectedNiches] = useState<string[]>([])
  const [creatorCategory, setCreatorCategory] = useState<string>("human_ugc")
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
        router.push(`/creator/join?user_name=${encodeURIComponent(user_name)}`)
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

    if (!userName.trim() || selectedNiches.length === 0) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.set("user_name", userName.trim())
    formData.set("niches", JSON.stringify(selectedNiches))
    formData.set("creator_category", creatorCategory)

    const result = await saveStorefront(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  if (step === "auth") {
    return <GlobalLoader message="Loading storefront setup..." />
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        <div className="text-center mb-10">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
            <Sparkles className="h-7 w-7 text-brand-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-surface-900">
            Set Up Your UGC Creator Profile
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

          {/* Creator Category */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-surface-900">
              Creator Type
            </label>
            <div className="grid sm:grid-cols-3 gap-3">
              {CATEGORY_OPTIONS.map((cat) => {
                const Icon = cat.icon
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCreatorCategory(cat.value)}
                    className={`text-left rounded-xl border p-4 transition-all ${
                      creatorCategory === cat.value
                        ? "bg-brand-50 border-brand-400 ring-2 ring-brand-200"
                        : "bg-white border-surface-200 hover:border-brand-200"
                    }`}
                  >
                    <Icon className="h-5 w-5 mb-1.5 text-brand-600" />
                    <p className={`text-xs font-bold ${creatorCategory === cat.value ? "text-brand-700" : "text-surface-900"}`}>
                      {cat.label}
                    </p>
                    <p className="text-[11px] text-surface-400 mt-1 leading-tight">{cat.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Niche Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-surface-900">
              Content Specialties
            </label>
            <div className="flex flex-wrap gap-2">
              {NICHE_OPTIONS.map((niche) => (
                <button
                  key={niche}
                  type="button"
                  onClick={() => toggleNiche(niche)}
                  className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${
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
              "Complete Profile"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function StorefrontPage() {
  return (
    <Suspense fallback={<GlobalLoader message="Loading ElAura..." />}>
      <StorefrontContent />
    </Suspense>
  )
}
