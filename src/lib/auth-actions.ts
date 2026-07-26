"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import type { CreatorCategory } from "@/types"

export async function signOut() {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/")
}

export async function saveStorefront(formData: FormData) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const userName = formData.get("user_name") as string
  const nichesRaw = formData.get("niches") as string
  const creatorCategory = (formData.get("creator_category") as CreatorCategory) || "human_ugc"

  let niches: string[] = []
  try {
    niches = JSON.parse(nichesRaw)
  } catch {
    return { error: "Invalid niches format" }
  }

  const { error } = await supabase.from("creators").upsert({
    id: user.id,
    full_name: user.user_metadata?.full_name ?? null,
    user_name: userName,
    creator_category: creatorCategory,
    niches,
  })

  if (error) return { error: error.message }

  revalidatePath("/", "layout")
  redirect("/creator/dashboard")
}
