"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { createClient } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  MILESTONE_STATE_LABELS,
  MILESTONE_STATE_COLORS,
} from "@/lib/constants";
import { exportToCSV } from "@/lib/csv-export";
import type { Profile, Campaign, Milestone, Application } from "@/types";

export default function ContractsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
      setProfile(prof);

      if (prof.role === "brand") {
        const { data: camps } = await supabase
          .from("campaigns")
          .select("*, milestones:milestones(*)")
          .eq("brand_id", user.id)
          .order("created_at", { ascending: false });
        setContracts(camps ?? []);
      } else {
        const { data: apps } = await supabase
          .from("applications")
          .select("*, campaign:campaign_id(*, milestones:milestones(*))")
          .eq("creator_id", user.id)
          .eq("status", "accepted")
          .order("created_at", { ascending: false });
        setContracts((apps ?? []).map((a) => a.campaign).filter(Boolean));
      }

      setLoading(false);
    }
    load();
  }, [router, supabase]);

  return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {profile?.role === "brand" ? "All Contracts" : "My Contracts"}
            </h1>
            <p className="text-muted-foreground">
              {profile?.role === "brand"
                ? "View all your campaign contracts and milestones"
                : "View all your accepted collaborations"}
            </p>
          </div>
          {profile?.role === "brand" && contracts.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                const data = contracts.map((c: any) => {
                  const milestones = c.milestones ?? [];
                  const funded = milestones.filter(
                    (m: Milestone) => m.state !== "UNFUNDED",
                  ).length;
                  return {
                    Campaign: c.title,
                    Budget: Number(c.budget),
                    Milestones: milestones.length,
                    Funded: funded,
                    Status: c.status,
                    Deadline: formatDate(c.deadline),
                    Created: formatDate(c.created_at),
                  };
                });
                exportToCSV(data, "hookdown-contracts");
              }}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contracts</CardTitle>
            <CardDescription>
              {contracts.length} contract{contracts.length !== 1 ? "s" : ""}{" "}
              total
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 w-full animate-pulse rounded-md bg-muted"
                  />
                ))}
              </div>
            ) : contracts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No contracts yet
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Milestones</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((contract: any) => {
                    const milestones = contract.milestones ?? [];
                    const fundedCount = milestones.filter(
                      (m: Milestone) => m.state !== "UNFUNDED",
                    ).length;
                    return (
                      <TableRow key={contract.id}>
                        <TableCell className="font-medium">
                          {contract.title}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(Number(contract.budget))}
                        </TableCell>
                        <TableCell>
                          {fundedCount}/{milestones.length} funded
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              contract.status === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {contract.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(contract.deadline)}
                        </TableCell>
                        <TableCell>
                          <Link href={`/campaigns/${contract.id}`}>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
  );
}
