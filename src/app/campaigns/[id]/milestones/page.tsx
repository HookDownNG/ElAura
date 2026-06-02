"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, DollarSign, CheckCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { createClient } from "@/lib/supabase"
import { formatCurrency } from "@/lib/utils"
import { MILESTONE_STATE_LABELS, MILESTONE_STATE_COLORS } from "@/lib/constants"
import Link from "next/link"
import type { Campaign, Milestone, Profile } from "@/types"
import { useToast } from "@/components/ui/toast"

export default function MilestonesPage() {
  const params = useParams()
  const campaignId = params.id as string
  const router = useRouter()
  const supabase = createClient()
  const { addToast } = useToast()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/auth/login"); return }

      const { data: prof } = await supabase
        .from("profiles").select("*").eq("id", user.id).single()
      if (!prof?.role) { router.push("/onboarding"); return }
      setProfile(prof)

      const { data: camp } = await supabase
        .from("campaigns").select("*").eq("id", campaignId).single()
      if (!camp || camp.brand_id !== user.id) { router.push("/campaigns"); return }
      setCampaign(camp)

      const { data: ms } = await supabase
        .from("milestones").select("*").eq("campaign_id", campaignId)
        .order("created_at", { ascending: true })
      setMilestones(ms ?? [])

      setLoading(false)
    }
    load()
  }, [router, supabase, campaignId])

  async function fundMilestone(milestoneId: string) {
    const { error } = await supabase
      .from("milestones")
      .update({ state: "FUNDED" })
      .eq("id", milestoneId)

    if (error) {
      addToast({ title: "Error", description: error.message, variant: "destructive" })
    } else {
      setMilestones(prev =>
        prev.map(m => m.id === milestoneId ? { ...m, state: "FUNDED" } : m)
      )
      addToast({ title: "Milestone Funded", description: "Funds are now locked in escrow.", variant: "success" })
    }
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

  if (!campaign) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href={`/campaigns/${campaignId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{campaign.title} - Milestones</h1>
            <p className="text-muted-foreground">
              Manage milestone funding and review
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {milestones.map((ms) => (
            <Card key={ms.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{ms.title}</CardTitle>
                  <Badge className={MILESTONE_STATE_COLORS[ms.state]}>
                    {MILESTONE_STATE_LABELS[ms.state]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {ms.description && (
                  <p className="text-sm text-muted-foreground">{ms.description}</p>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{formatCurrency(Number(ms.amount))}</span>
                </div>
                <div className="flex gap-2">
                  {ms.state === "UNFUNDED" && (
                    <Button onClick={() => fundMilestone(ms.id)} className="gap-2">
                      <DollarSign className="h-4 w-4" />
                      Fund Milestone
                    </Button>
                  )}
                  {ms.state === "UNDER_REVIEW" && (
                    <>
                      <Button className="gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Approve & Release
                      </Button>
                      <Button variant="outline" className="gap-2 text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        Raise Dispute
                      </Button>
                    </>
                  )}
                  {ms.state === "FUNDED" && (
                    <p className="text-sm text-emerald-400 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Funds secured in escrow. Awaiting creator submission.
                    </p>
                  )}
                  {ms.state === "COMPLETED" && (
                    <p className="text-sm text-blue-400 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Milestone completed and funds released.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
