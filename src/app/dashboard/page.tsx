"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DollarSign, FileText, Users, TrendingUp, Plus, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { createClient } from "@/lib/supabase"
import { formatCurrency, formatDate } from "@/lib/utils"
import { MILESTONE_STATE_LABELS, MILESTONE_STATE_COLORS } from "@/lib/constants"
import Link from "next/link"
import type { Profile, Campaign, Milestone, Application } from "@/types"

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/auth/login"); return }

      const { data: prof } = await supabase
        .from("profiles").select("*").eq("id", user.id).single()
      if (!prof?.role) { router.push("/onboarding"); return }
      setProfile(prof)

      if (prof.role === "brand") {
        const { data: camps } = await supabase
          .from("campaigns").select("*").eq("brand_id", user.id).order("created_at", { ascending: false })
        setCampaigns(camps ?? [])

        const campaignIds = camps?.map(c => c.id) ?? []
        if (campaignIds.length > 0) {
          const { data: ms } = await supabase
            .from("milestones").select("*").in("campaign_id", campaignIds)
          setMilestones(ms ?? [])

          const { data: apps } = await supabase
            .from("applications").select("*, creator:creator_id(*)").in("campaign_id", campaignIds)
          setApplications(apps ?? [])
        }
      } else {
        const { data: apps } = await supabase
          .from("applications").select("*, campaign:campaign_id(*)").eq("creator_id", user.id)
          .order("created_at", { ascending: false })
        setApplications(apps ?? [])
      }

      setLoading(false)
    }
    loadDashboard()
  }, [router, supabase])

  const totalBudget = campaigns.reduce((sum, c) => sum + Number(c.budget), 0)
  const fundedMilestones = milestones.filter(m => m.state === "FUNDED")
  const pendingApps = applications.filter(a => a.status === "pending")
  const activeCampaigns = campaigns.filter(c => c.status === "active")

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {profile?.full_name}
            </p>
          </div>
          {profile?.role === "brand" && (
            <Link href="/campaigns/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Campaign
              </Button>
            </Link>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {profile?.role === "brand" ? "Total Campaign Budget" : "Active Contracts"}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {profile?.role === "brand" ? formatCurrency(totalBudget) : applications.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {profile?.role === "brand" ? `${activeCampaigns.length} active campaigns` : "Total applications"}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {profile?.role === "brand" ? "Active Campaigns" : "Pending Applications"}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {profile?.role === "brand" ? activeCampaigns.length : pendingApps.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {profile?.role === "brand" ? "Ongoing campaigns" : "Awaiting response"}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Funded Milestones</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{fundedMilestones.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Out of {milestones.length} total milestones
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Applications</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{applications.length}</div>
                  <p className="text-xs text-muted-foreground">Total received</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Milestones</CardTitle>
              <CardDescription>Latest escrow activity</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : milestones.length === 0 ? (
                <p className="text-sm text-muted-foreground">No milestones yet</p>
              ) : (
                <div className="space-y-3">
                  {milestones.slice(0, 5).map((ms) => (
                    <div key={ms.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{ms.title}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(Number(ms.amount))}</p>
                      </div>
                      <Badge className={MILESTONE_STATE_COLORS[ms.state]}>
                        {MILESTONE_STATE_LABELS[ms.state]}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>Latest collaboration requests</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : applications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No applications yet</p>
              ) : (
                <div className="space-y-3">
                  {applications.slice(0, 5).map((app) => (
                    <div key={app.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {app.campaign && 'title' in app.campaign
                            ? (app.campaign as Campaign).title
                            : (app.creator?.full_name ?? "Unknown")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(app.created_at)}
                        </p>
                      </div>
                      <Badge variant={app.status === "accepted" ? "default" : app.status === "rejected" ? "destructive" : "secondary"}>
                        {app.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
