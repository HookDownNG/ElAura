"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  Send,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

import { createClient } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  MILESTONE_STATE_LABELS,
  MILESTONE_STATE_COLORS,
} from "@/lib/constants";
import Link from "next/link";
import type { Campaign, Milestone, Application, Profile } from "@/types";

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = params.id as string;
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [application, setApplication] = useState<Application | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (!prof?.role) {
        router.push("/onboarding");
        return;
      }
      setProfile(prof);

      const { data: camp } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", campaignId)
        .single();
      if (!camp) {
        router.push("/campaigns");
        return;
      }
      setCampaign(camp);

      const { data: ms } = await supabase
        .from("milestones")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("created_at", { ascending: true });
      setMilestones(ms ?? []);

      if (prof.role === "creator") {
        const { data: app } = await supabase
          .from("applications")
          .select("*")
          .eq("campaign_id", campaignId)
          .eq("creator_id", user.id)
          .single();
        setApplication(app);
      }

      setLoading(false);
    }
    load();
  }, [router, supabase, campaignId]);

  async function handleApply() {
    if (!message.trim()) return;
    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("applications").insert({
      campaign_id: campaignId,
      creator_id: user.id,
      message,
      status: "pending",
    });

    if (!error) {
      setApplication({
        id: "",
        campaign_id: campaignId,
        creator_id: user.id,
        message,
        status: "pending",
        created_at: new Date().toISOString(),
      });
    }
    setSubmitting(false);
  }

  async function handleAcceptApplication(appId: string) {
    const { error } = await supabase
      .from("applications")
      .update({ status: "accepted" })
      .eq("id", appId);

    if (!error) {
      setApplication((prev) =>
        prev?.id === appId ? { ...prev!, status: "accepted" } : prev,
      );
    }
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
    );
  }

  if (!campaign) return null;

  const isBrandOwner =
    profile?.role === "brand" && profile.id === campaign.brand_id;

  return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/campaigns">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{campaign.title}</h1>
              <Badge
                variant={campaign.status === "active" ? "default" : "secondary"}
              >
                {campaign.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Created {formatDate(campaign.created_at)}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {campaign.description}
                </p>
                {campaign.guidelines && (
                  <div className="mt-4">
                    <h4 className="mb-2 text-sm font-medium">Guidelines</h4>
                    <p className="text-sm text-muted-foreground">
                      {campaign.guidelines}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Milestones ({milestones.length})</CardTitle>
                <CardDescription>
                  Total budget: {formatCurrency(Number(campaign.budget))}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {milestones.map((ms) => (
                  <div
                    key={ms.id}
                    className="rounded-lg border border-border p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{ms.title}</p>
                        {ms.description && (
                          <p className="text-sm text-muted-foreground">
                            {ms.description}
                          </p>
                        )}
                      </div>
                      <Badge className={MILESTONE_STATE_COLORS[ms.state]}>
                        {MILESTONE_STATE_LABELS[ms.state]}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {formatCurrency(Number(ms.amount))}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Budget</span>
                  <span className="font-medium">
                    {formatCurrency(Number(campaign.budget))}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Deadline</span>
                  <span className="font-medium">
                    {formatDate(campaign.deadline)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Milestones</span>
                  <span className="font-medium">{milestones.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Funded</span>
                  <span className="font-medium">
                    {milestones.filter((m) => m.state !== "UNFUNDED").length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {profile?.role === "creator" && campaign.status === "active" && (
              <Card>
                <CardHeader>
                  <CardTitle>Apply to Campaign</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {application ? (
                    <div className="space-y-2">
                      <Badge
                        variant={
                          application.status === "accepted"
                            ? "default"
                            : application.status === "rejected"
                              ? "destructive"
                              : "secondary"
                        }
                        className="w-full justify-center py-2"
                      >
                        {application.status === "accepted"
                          ? "Accepted"
                          : application.status === "rejected"
                            ? "Rejected"
                            : "Application Submitted"}
                      </Badge>
                    </div>
                  ) : (
                    <>
                      <Textarea
                        placeholder="Tell the brand why you are a great fit..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                      <Button
                        className="w-full gap-2"
                        onClick={handleApply}
                        disabled={submitting || !message.trim()}
                      >
                        <Send className="h-4 w-4" />
                        Submit Application
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {isBrandOwner && (
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href={`/campaigns/${campaignId}/milestones`}>
                    <Button variant="outline" className="w-full gap-2">
                      <DollarSign className="h-4 w-4" />
                      Manage Milestones
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
  );
}
