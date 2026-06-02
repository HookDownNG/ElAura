"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { createClient } from "@/lib/supabase"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useToast } from "@/components/ui/toast"
import type { Profile, Milestone } from "@/types"

export default function DisputesPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [disputedMilestones, setDisputedMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
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

      const { data: ms } = await supabase
        .from("milestones").select("*, campaign:campaign_id(*)").eq("state", "DISPUTED")
        .order("updated_at", { ascending: false })
      setDisputedMilestones(ms ?? [])

      setLoading(false)
    }
    load()
  }, [router, supabase])

  async function resolveDispute(id: string, action: "release" | "refund") {
    const newState = action === "release" ? "COMPLETED" : "UNFUNDED"
    const { error } = await supabase
      .from("milestones")
      .update({ state: newState })
      .eq("id", id)

    if (error) {
      addToast({ title: "Error", description: error.message, variant: "destructive" })
    } else {
      setDisputedMilestones(prev => prev.filter(m => m.id !== id))
      addToast({
        title: action === "release" ? "Funds Released" : "Funds Refunded",
        variant: "success",
      })
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dispute Management</h1>
          <p className="text-muted-foreground">Admin panel for resolving milestone disputes</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Disputes</CardTitle>
            <CardDescription>
              {disputedMilestones.length} milestone{disputedMilestones.length !== 1 ? "s" : ""} in dispute
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 w-full animate-pulse rounded-md bg-muted" />
                ))}
              </div>
            ) : disputedMilestones.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Shield className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-medium">No disputes</p>
                <p className="text-sm text-muted-foreground">
                  All milestones are running smoothly
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Milestone</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {disputedMilestones.map((ms: any) => (
                    <TableRow key={ms.id}>
                      <TableCell className="font-medium">{ms.title}</TableCell>
                      <TableCell>{formatCurrency(Number(ms.amount))}</TableCell>
                      <TableCell>{ms.campaign?.title ?? "N/A"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(ms.updated_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="gap-1"
                            onClick={() => resolveDispute(ms.id, "release")}
                          >
                            <CheckCircle className="h-3 w-3" />
                            Release
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-destructive"
                            onClick={() => resolveDispute(ms.id, "refund")}
                          >
                            <XCircle className="h-3 w-3" />
                            Refund
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
