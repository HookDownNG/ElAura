"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export async function saveCreatorOnboarding(formData: FormData) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_name")
    .eq("id", user.id)
    .single()

  const platformsRaw = formData.get("social_platforms") as string
  const locationsRaw = formData.get("audience_locations") as string
  const packagesRaw = formData.get("packages") as string
  const portfolioRaw = formData.get("portfolio_urls") as string

  let socialPlatforms = []
  let audienceLocations = []
  let packages = []
  let portfolioUrls = []

  try { socialPlatforms = JSON.parse(platformsRaw) } catch {}
  try { audienceLocations = JSON.parse(locationsRaw) } catch {}
  try { packages = JSON.parse(packagesRaw) } catch {}
  try { portfolioUrls = JSON.parse(portfolioRaw) } catch {}

  const nichesRaw = formData.get("niches") as string
  let niches: string[] = []
  try { niches = JSON.parse(nichesRaw) } catch {}

  const { error } = await supabase.from("creators").upsert({
    id: user.id,
    user_name: profile?.user_name ?? null,
    niches,
    audience_tier: formData.get("audience_tier") as string || null,
    bio: formData.get("bio") as string || null,
    social_platforms: socialPlatforms,
    audience_locations: audienceLocations,
    content_language: formData.get("content_language") as string || null,
    audience_demographic: formData.get("audience_demographic") as string || null,
    packages,
    turnaround_days: formData.get("turnaround_days") ? Number(formData.get("turnaround_days")) : null,
    usage_rights: formData.get("usage_rights") as string || null,
    portfolio_urls: portfolioUrls,
    payout_method: formData.get("payout_method") as string || null,
    payout_currency: formData.get("payout_currency") as string || "NGN",
  })

  if (error) return { error: error.message }

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ id: user.id, role: "creator" })

  if (profileError) return { error: profileError.message }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}
