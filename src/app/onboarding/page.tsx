"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Shield, Users, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase"
import { updateProfile } from "@/lib/auth-actions"
import type { UserRole } from "@/types"

export default function OnboardingPage() {
  const [step, setStep] = useState<"role" | "profile">("role")
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
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
    checkUser()
  }, [router, supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!selectedRole || !fullName.trim()) return

    const formData = new FormData()
    formData.set("full_name", fullName)
    formData.set("role", selectedRole)

    const result = await updateProfile(formData)
    if (result?.error) {
      setError(result.error)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle>Welcome to Hookdown</CardTitle>
          <CardDescription>Tell us a bit about yourself to get started</CardDescription>
        </CardHeader>
        <CardContent>
          {step === "role" ? (
            <div className="space-y-4">
              <Label className="text-center block">I am a...</Label>
              <div className="grid gap-4">
                <button
                  onClick={() => { setSelectedRole("creator"); setStep("profile") }}
                  className={cn(
                    "flex items-start gap-4 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary",
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Creator</p>
                    <p className="text-sm text-muted-foreground">
                      I am a content creator looking for brand collaborations
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => { setSelectedRole("brand"); setStep("profile") }}
                  className={cn(
                    "flex items-start gap-4 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary",
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Brand / Merchant</p>
                    <p className="text-sm text-muted-foreground">
                      I represent a business looking to collaborate with creators
                    </p>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm font-medium">
                  Selected: <span className="capitalize text-primary">{selectedRole}</span>
                </p>
                <button
                  type="button"
                  onClick={() => setStep("role")}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Change role
                </button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={!fullName.trim()}>
                Complete Setup
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
