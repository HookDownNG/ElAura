"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { createClient } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import type { Profile } from "@/types";

interface MilestoneInput {
  title: string;
  description: string;
  amount: string;
}

export default function NewCampaignPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    { title: "", description: "", amount: "" },
  ]);
  const router = useRouter();
  const supabase = createClient();

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
      if (prof.role !== "brand") {
        router.push("/dashboard");
        return;
      }
      setProfile(prof);
      setLoading(false);
    }
    load();
  }, [router, supabase]);

  function addMilestone() {
    setMilestones([...milestones, { title: "", description: "", amount: "" }]);
  }

  function removeMilestone(index: number) {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((_, i) => i !== index));
    }
  }

  function updateMilestone(
    index: number,
    field: keyof MilestoneInput,
    value: string,
  ) {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: value };
    setMilestones(updated);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const guidelines = formData.get("guidelines") as string;
    const deadline = formData.get("deadline") as string;
    const totalBudget = milestones.reduce(
      (sum, m) => sum + (parseFloat(m.amount) || 0),
      0,
    );

    if (!title || !description || !deadline) {
      setError("Please fill in all required fields");
      setSubmitting(false);
      return;
    }

    if (milestones.some((m) => !m.title || !m.amount)) {
      setError("Each milestone needs a title and amount");
      setSubmitting(false);
      return;
    }

    if (totalBudget <= 0) {
      setError("Total milestone budget must be greater than 0");
      setSubmitting(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const { data: campaign, error: campErr } = await supabase
      .from("campaigns")
      .insert({
        brand_id: user.id,
        title,
        description,
        guidelines: guidelines || null,
        budget: totalBudget,
        deadline: new Date(deadline).toISOString(),
        status: "active",
      })
      .select()
      .single();

    if (campErr) {
      setError(campErr.message);
      setSubmitting(false);
      return;
    }

    const milestoneInserts = milestones.map((m) => ({
      campaign_id: campaign.id,
      title: m.title,
      description: m.description || null,
      amount: parseFloat(m.amount),
      state: "UNFUNDED" as const,
    }));

    const { error: msErr } = await supabase
      .from("milestones")
      .insert(milestoneInserts);

    if (msErr) {
      setError(msErr.message);
      setSubmitting(false);
      return;
    }

    router.push(`/campaigns/${campaign.id}`);
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
    );
  }

  const totalBudget = milestones.reduce(
    (sum, m) => sum + (parseFloat(m.amount) || 0),
    0,
  );

  return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create Campaign</h1>
          <p className="text-muted-foreground">
            Post a new campaign brief for creators to discover and apply to
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
              <CardDescription>
                Provide the basic information about your campaign
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Campaign Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. Summer Fashion Campaign 2026"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe what you are looking for in a creator collaboration..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guidelines">
                  Guidelines / Brief (Optional)
                </Label>
                <Textarea
                  id="guidelines"
                  name="guidelines"
                  placeholder="Provide specific guidelines, branding requirements, content expectations..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Application Deadline *</Label>
                <Input id="deadline" name="deadline" type="date" required />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Milestones</CardTitle>
                <CardDescription>
                  Break your campaign budget into milestones. Total:{" "}
                  {formatCurrency(totalBudget)}
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMilestone}
                className="gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Milestone
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-border p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Milestone {index + 1}</p>
                    {milestones.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMilestone(index)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor={`milestone-title-${index}`}>
                        Title *
                      </Label>
                      <Input
                        id={`milestone-title-${index}`}
                        value={milestone.title}
                        onChange={(e) =>
                          updateMilestone(index, "title", e.target.value)
                        }
                        placeholder="e.g. Content Creation"
                        required
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor={`milestone-desc-${index}`}>
                        Description
                      </Label>
                      <Input
                        id={`milestone-desc-${index}`}
                        value={milestone.description}
                        onChange={(e) =>
                          updateMilestone(index, "description", e.target.value)
                        }
                        placeholder="What needs to be delivered?"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`milestone-amount-${index}`}>
                        Amount (NGN) *
                      </Label>
                      <Input
                        id={`milestone-amount-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={milestone.amount}
                        onChange={(e) =>
                          updateMilestone(index, "amount", e.target.value)
                        }
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating Campaign..." : "Create Campaign"}
            </Button>
          </div>
        </form>
      </div>
  );
}
