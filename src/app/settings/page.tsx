"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { createClient } from "@/lib/supabase"
import type { Profile, CreatorProfile, BrandProfile } from "@/types"
import { useToast } from "@/components/ui/toast"

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null)
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { addToast } = useToast()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/auth/login"); return }

      const { data: prof } = await supabase
        .from("profiles").select("*").eq("id", user.id).single()
      if (!prof?.role) { router.push("/onboarding"); return }
      setProfile(prof)

      if (prof.role === "creator") {
        const { data: cp } = await supabase
          .from("creator_profiles").select("*").eq("id", user.id).single()
        setCreatorProfile(cp)
      } else if (prof.role === "brand") {
        const { data: bp } = await supabase
          .from("brand_profiles").select("*").eq("id", user.id).single()
        setBrandProfile(bp)
      }

      setLoading(false)
    }
    load()
  }, [router, supabase])

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const formData = new FormData(e.currentTarget)
    const fullName = formData.get("full_name") as string

    const { error: profErr } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user.id)

    if (profErr) {
      addToast({ title: "Error", description: profErr.message, variant: "destructive" })
      setSaving(false)
      return
    }

    if (profile?.role === "creator") {
      const bankAccountNumber = formData.get("bank_account_number") as string
      const bankName = formData.get("bank_name") as string
      const bankCode = formData.get("bank_code") as string
      const phone = formData.get("phone") as string

      const { error } = await supabase.from("creator_profiles").upsert({
        id: user.id,
        bank_account_number: bankAccountNumber || null,
        bank_name: bankName || null,
        bank_code: bankCode || null,
        phone: phone || null,
      })
      if (error) {
        addToast({ title: "Error", description: error.message, variant: "destructive" })
        setSaving(false)
        return
      }
    } else if (profile?.role === "brand") {
      const companyName = formData.get("company_name") as string
      const companyDescription = formData.get("company_description") as string
      const website = formData.get("website") as string
      const industry = formData.get("industry") as string

      const { error } = await supabase.from("brand_profiles").upsert({
        id: user.id,
        company_name: companyName || null,
        company_description: companyDescription || null,
        website: website || null,
        industry: industry || null,
      })
      if (error) {
        addToast({ title: "Error", description: error.message, variant: "destructive" })
        setSaving(false)
        return
      }
    }

    addToast({ title: "Settings saved", variant: "success" })
    setSaving(false)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your profile and account details</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your basic profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  defaultValue={profile?.full_name ?? ""}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {profile?.role === "creator" && (
            <Card>
              <CardHeader>
                <CardTitle>Bank Account Details</CardTitle>
                <CardDescription>
                  Your bank account information for automated payouts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bank_name">Bank Name</Label>
                  <Input
                    id="bank_name"
                    name="bank_name"
                    defaultValue={creatorProfile?.bank_name ?? ""}
                    placeholder="e.g. GTBank, Access Bank"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank_code">Bank Code</Label>
                  <Input
                    id="bank_code"
                    name="bank_code"
                    defaultValue={creatorProfile?.bank_code ?? ""}
                    placeholder="e.g. 058"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bank_account_number">Account Number</Label>
                  <Input
                    id="bank_account_number"
                    name="bank_account_number"
                    defaultValue={creatorProfile?.bank_account_number ?? ""}
                    placeholder="e.g. 0123456789"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    defaultValue={creatorProfile?.phone ?? ""}
                    placeholder="e.g. +234 800 000 0000"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {profile?.role === "brand" && (
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Tell creators about your brand</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    name="company_name"
                    defaultValue={brandProfile?.company_name ?? ""}
                    placeholder="Your company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    name="industry"
                    defaultValue={brandProfile?.industry ?? ""}
                    placeholder="e.g. Fashion, Tech, Food"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    defaultValue={brandProfile?.website ?? ""}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_description">Description</Label>
                  <Input
                    id="company_description"
                    name="company_description"
                    defaultValue={brandProfile?.company_description ?? ""}
                    placeholder="Brief description of your brand"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
