"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase"
import { GlobalLoader } from "@/components/ui/global-loader"
import { ArrowLeft, Lock, Sparkles } from "lucide-react"

function JoinContent() {
  const router = useRouter()
  const supabase = createClient()
  const [userName, setUserName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkedSession, setCheckedSession] = useState(false)

  useEffect(() => {
    const pendingName = typeof window !== "undefined" ? localStorage.getItem("pending_user_name") || "" : ""
    setUserName(pendingName)

    if (!pendingName) {
      router.push("/creator")
      return
    }

    async function checkSession() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const cleanName = pendingName.toLowerCase()
        await supabase.from("profiles").upsert({
          id: user.id,
          user_name: cleanName,
          role: "creator",
          updated_at: new Date().toISOString(),
        })
        await supabase.from("creators").upsert({
          id: user.id,
          user_name: cleanName,
          full_name: user.user_metadata?.full_name ?? null,
        })
        try {
          localStorage.removeItem("pending_user_name")
        } catch {}

        router.push("/creator/dashboard")
        return
      }
      setCheckedSession(true)
    }
    checkSession()
  }, [router, supabase])

  async function handleGoogleSignIn() {
    setLoading(true)
    setError(null)
    const cleanName = userName.trim().toLowerCase()
    
    // Store in cookie so Server Action / Route Handler can read it post-OAuth
    if (typeof document !== "undefined") {
      document.cookie = `pending_user_name=${encodeURIComponent(cleanName)}; path=/; max-age=600; SameSite=Lax`
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          user_name: cleanName,
          role: "creator",
        },
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  if (!checkedSession) {
    return <GlobalLoader message="Securing your username..." />
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-50/70 px-4 py-8 sm:py-12 overflow-y-auto select-none">
      <div className="w-full max-w-md my-auto space-y-4">
        {/* Back / Change Username Button */}
        <div className="flex items-center justify-start">
          <button
            type="button"
            onClick={() => router.push("/creator")}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-surface-600 hover:text-surface-900 transition-colors py-2 px-3.5 rounded-full bg-white hover:bg-surface-100 border border-surface-200 shadow-2xs min-h-10"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-surface-500" />
            <span>Change Username</span>
          </button>
        </div>

        {/* Premium Form Card */}
        <div className="rounded-3xl border border-surface-200 bg-white p-6 sm:p-8 shadow-xl shadow-surface-200/40 text-center space-y-6 relative overflow-hidden">
          {/* Subtle Ambient Background Halo */}
          <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-brand-100/50 blur-2xl pointer-events-none" />

          {/* Icon Badge */}
          <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 border border-brand-100 shadow-2xs">
            <Lock className="h-6 w-6" />
          </div>

          {/* Headline & Username Pill */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-surface-900 leading-tight">
              Locking In Your Profile
            </h1>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-4 py-1.5 text-sm font-black text-brand-700 border border-brand-200/80">
              <Sparkles className="h-4 w-4 text-brand-600" />
              <span>@{userName}</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-surface-500 max-w-xs mx-auto leading-relaxed">
            This username is available. Continue with Google to create your creator profile and start accepting brand deals.
          </p>

          {/* Styled Google Auth Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-surface-950 hover:bg-black active:scale-[0.98] text-white rounded-full px-6 py-3.5 text-sm font-bold transition-all disabled:opacity-60 shadow-lg shadow-surface-950/20 min-h-12 border border-surface-800"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Connecting...
              </span>
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {error && (
            <p className="mt-4 text-xs font-medium text-red-500 bg-red-50 p-3 rounded-xl border border-red-200">
              {error}
            </p>
          )}

          <p className="text-[11px] font-medium text-surface-400">
            🔒 Fast & passwordless authentication
          </p>
        </div>
      </div>
    </div>
  )
}

export default function CreatorJoinPage() {
  return (
    <Suspense fallback={<GlobalLoader message="Loading ElAura..." />}>
      <JoinContent />
    </Suspense>
  )
}
