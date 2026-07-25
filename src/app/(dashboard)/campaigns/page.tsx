"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Search, MapPin, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { createClient } from "@/lib/supabase";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Campaign, Profile } from "@/types";

export default function CampaignsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [search, setSearch] = useState("");
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
        const { data } = await supabase
          .from("campaigns")
          .select("*")
          .eq("brand_id", user.id)
          .order("created_at", { ascending: false });
        setCampaigns(data ?? []);
      } else {
        const { data } = await supabase
          .from("campaigns")
          .select("*, brand:brand_id(*)")
          .eq("status", "active")
          .order("created_at", { ascending: false });
        setCampaigns(data ?? []);
      }
      setLoading(false);
    }
    load();
  }, [router, supabase]);

  const filtered = campaigns.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {profile?.role === "brand" ? "My Campaigns" : "Browse Campaigns"}
            </h1>
            <p className="text-muted-foreground">
              {profile?.role === "brand"
                ? "Manage your brand campaigns"
                : "Find and apply to brand campaigns"}
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

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-16 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-lg font-medium">No campaigns found</p>
            <p className="text-sm text-muted-foreground">
              {profile?.role === "brand"
                ? "Create your first campaign to start collaborating with creators"
                : "No active campaigns available at the moment"}
            </p>
            {profile?.role === "brand" && (
              <Link href="/campaigns/new">
                <Button className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Create Campaign
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((campaign) => (
              <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                <Card className="h-full transition-colors hover:border-primary">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">
                        {campaign.title}
                      </CardTitle>
                      <Badge
                        variant={
                          campaign.status === "active" ? "default" : "secondary"
                        }
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {campaign.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      {formatCurrency(Number(campaign.budget))}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Deadline: {formatDate(campaign.deadline)}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <span>View Details</span>
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
  );
}
