"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase";
import { updateProfile } from "@/lib/auth-actions";
import type { UserRole } from "@/types";

function OnboardingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const selectedRole = (searchParams.get("role") || "brand") as UserRole;
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/creator");
      return;
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim()) return;

    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.set("full_name", companyName.trim());
    formData.set("role", selectedRole);

    const result = await updateProfile(formData);
    if (result?.error) {
      setError(result.error);
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <Card className="w-full max-w-lg border-brand-200 shadow-lg shadow-brand-100/20">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
            <Building2 className="h-7 w-7 text-brand-600" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-surface-900">
            Set up your brand profile
          </CardTitle>
          <CardDescription className="text-sm text-surface-500">
            Tell us your company name to get started
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="company_name" className="text-sm font-medium text-surface-900">
                Company or Brand Name
              </label>
              <Input
                id="company_name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter your brand name"
                required
                className="h-11 border-surface-300 focus-visible:ring-brand-500"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-brand-600 hover:bg-brand-700"
              disabled={!companyName.trim() || submitting}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Setting up...
                </span>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}
