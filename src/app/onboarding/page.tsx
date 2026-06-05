"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, Users, Building2, ArrowLeft, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase"
import { updateProfile } from "@/lib/auth-actions"
import type { UserRole } from "@/types"

const roles = [
  {
    value: "creator" as UserRole,
    label: "Creator",
    description: "I create content and want brand collaborations",
    icon: Users,
  },
  {
    value: "brand" as UserRole,
    label: "Brand / Merchant",
    description: "I represent a business looking to work with creators",
    icon: Building2,
  },
]

export default function OnboardingPage() {
  const [step, setStep] = useState<"role" | "profile">("role")
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkSession()
  }, [router, supabase])

  async function checkSession() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/creator")
      return
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role) {
      router.push("/dashboard")
      return
    }
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedRole || !fullName.trim()) return

    setSubmitting(true)
    setError(null)

    const formData = new FormData()
    formData.set("full_name", fullName)
    formData.set("role", selectedRole)

    const result = await updateProfile(formData)
    if (result?.error) {
      setError(result.error)
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <Card className="w-full max-w-lg border-brand-200 shadow-lg shadow-brand-100/20">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
            <Sparkles className="h-7 w-7 text-brand-600" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-surface-900">
            {step === "role" ? "Welcome to Hookdown" : "One more thing"}
          </CardTitle>
          <CardDescription className="text-sm text-surface-500">
            {step === "role"
              ? "Tell us a bit about yourself to get started"
              : "Just need your name to finish setting up"}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {step === "role" ? (
            <div className="space-y-3">
              {roles.map((role) => {
                const Icon = role.icon
                const isSelected = selectedRole === role.value
                return (
                  <button
                    key={role.value}
                    onClick={() => { setSelectedRole(role.value); setStep("profile") }}
                    className={cn(
                      "group relative flex w-full items-start gap-4 rounded-xl border-2 p-4 text-left transition-all",
                      isSelected
                        ? "border-brand-500 bg-brand-50"
                        : "border-surface-200 bg-white hover:border-brand-300 hover:bg-brand-50/50",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                        isSelected
                          ? "bg-brand-600 text-white"
                          : "bg-brand-50 text-brand-600",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p className="font-semibold text-sm text-surface-900">{role.label}</p>
                      <p className="mt-0.5 text-xs text-surface-500 leading-relaxed">
                        {role.description}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                        isSelected
                          ? "border-brand-600 bg-brand-600 text-white"
                          : "border-surface-300",
                      )}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="rounded-xl border border-surface-200 bg-surface-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100">
                      {selectedRole === "creator" ? (
                        <Users className="h-4 w-4 text-brand-600" />
                      ) : (
                        <Building2 className="h-4 w-4 text-brand-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-surface-900">
                        {selectedRole === "creator" ? "Creator" : "Brand / Merchant"}
                      </p>
                      <p className="text-xs text-surface-500">Selected role</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep("role")}
                    className="inline-flex items-center gap-1 text-xs text-surface-400 hover:text-surface-700 transition-colors"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Change
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="full_name" className="text-sm font-medium text-surface-900">
                  Full Name
                </label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="h-11 border-surface-300 focus-visible:ring-brand-500"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full h-11 rounded-xl bg-brand-600 hover:bg-brand-700"
                disabled={!fullName.trim() || submitting}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Setting up...
                  </span>
                ) : (
                  "Complete Setup"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
