"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Upload, ExternalLink, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { createClient } from "@/lib/supabase"
import { formatCurrency, formatDate } from "@/lib/utils"
import { MILESTONE_STATE_LABELS, MILESTONE_STATE_COLORS } from "@/lib/constants"
import { useToast } from "@/components/ui/toast"
import Link from "next/link"
import type { Milestone, Profile, Campaign } from "@/types"

export default function MilestoneDetailPage() {
  const params = useParams()
  const milestoneId = params.milestoneId as string
  const campaignId = params.id as string
  const router = useRouter()
  const supabase = createClient()
  const { addToast } = useToast()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [milestone, setMilestone] = useState<Milestone | null>(null)
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [content, setContent] = useState("")
  const [externalUrls, setExternalUrls] = useState<string[]>([""])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/auth/login"); return }

      const { data: prof } = await supabase
        .from("profiles").select("*").eq("id", user.id).single()
      if (!prof?.role) { router.push("/onboarding"); return }
      setProfile(prof)

      const { data: ms } = await supabase
        .from("milestones").select("*").eq("id", milestoneId).single()
      if (!ms) { router.push(`/campaigns/${campaignId}`); return }
      setMilestone(ms)

      const { data: camp } = await supabase
        .from("campaigns").select("*").eq("id", campaignId).single()
      setCampaign(camp)

      setLoading(false)
    }
    load()
  }, [router, supabase, campaignId, milestoneId])

  function addUrlField() {
    setExternalUrls([...externalUrls, ""])
  }

  function removeUrlField(index: number) {
    if (externalUrls.length > 1) {
      setExternalUrls(externalUrls.filter((_, i) => i !== index))
    }
  }

  function updateUrl(index: number, value: string) {
    const updated = [...externalUrls]
    updated[index] = value
    setExternalUrls(updated)
  }

  async function handleSubmit() {
    if (!content.trim() && externalUrls.every(u => !u.trim())) {
      addToast({ title: "Validation Error", description: "Please provide content or at least one URL.", variant: "destructive" })
      return
    }

    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from("submissions").insert({
      milestone_id: milestoneId,
      creator_id: user.id,
      content: content || null,
      file_urls: [],
      external_urls: externalUrls.filter(u => u.trim()),
    })

    if (error) {
      addToast({ title: "Error", description: error.message, variant: "destructive" })
    } else {
      await supabase
        .from("milestones")
        .update({ state: "UNDER_REVIEW" })
        .eq("id", milestoneId)

      addToast({ title: "Submitted!", description: "Your content has been submitted for review.", variant: "success" })
      router.push(`/campaigns/${campaignId}`)
    }
    setSubmitting(false)
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

  if (!milestone) return null

  const isCreator = profile?.role === "creator"
  const isFunded = milestone.state === "FUNDED"

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <Link href={`/campaigns/${campaignId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{milestone.title}</h1>
              <Badge className={MILESTONE_STATE_COLORS[milestone.state]}>
                {MILESTONE_STATE_LABELS[milestone.state]}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {campaign?.title} &middot; {formatCurrency(Number(milestone.amount))}
            </p>
          </div>
        </div>

        {milestone.description && (
          <Card>
            <CardHeader>
              <CardTitle>Milestone Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{milestone.description}</p>
            </CardContent>
          </Card>
        )}

        {isCreator && isFunded && (
          <Card>
            <CardHeader>
              <CardTitle>Submit Content</CardTitle>
              <CardDescription>
                Upload your deliverables for this milestone. You can provide text, external URLs, or file uploads.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">Content Description</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Describe what you have created and any notes for the brand..."
                  rows={5}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>External URLs</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addUrlField} className="gap-1">
                    <Plus className="h-3 w-3" />
                    Add URL
                  </Button>
                </div>
                {externalUrls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={url}
                      onChange={(e) => updateUrl(index, e.target.value)}
                      placeholder="https://drive.google.com/your-file"
                      className="flex-1"
                    />
                    {externalUrls.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeUrlField(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <Button onClick={handleSubmit} disabled={submitting} className="w-full gap-2">
                <Upload className="h-4 w-4" />
                {submitting ? "Submitting..." : "Submit Milestone Content"}
              </Button>
            </CardContent>
          </Card>
        )}

        {isCreator && !isFunded && milestone.state !== "UNDER_REVIEW" && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                {milestone.state === "UNFUNDED" && "This milestone has not been funded yet. Wait for the brand to fund it."}
                {milestone.state === "COMPLETED" && "This milestone has been completed and funds released."}
                {milestone.state === "DISPUTED" && "This milestone is under dispute. Please wait for resolution."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
