import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      let role = "creator"

      if (user && state) {
        let userName = state

        if (state.includes(":")) {
          const colonIndex = state.indexOf(":")
          role = state.substring(0, colonIndex)
          userName = state.substring(colonIndex + 1)
        }

        const validRoles = ["creator", "brand"]
        if (!validRoles.includes(role)) role = "creator"

        if (/^[a-z0-9_]+$/.test(userName)) {
          await supabase.from("profiles").upsert({
            id: user.id,
            user_name: userName,
            role,
            full_name: user.user_metadata?.full_name ?? null,
            avatar_url: user.user_metadata?.avatar_url ?? null,
            updated_at: new Date().toISOString(),
          })

          if (role === "creator") {
            await supabase.from("creators").upsert({
              id: user.id,
              full_name: user.user_metadata?.full_name ?? null,
              user_name: userName,
            })
          } else if (role === "brand") {
            await supabase.from("brands").upsert({
              id: user.id,
              company_name: user.user_metadata?.full_name ?? null,
            })
          }
        }
      }

      const redirectPath = role === "creator"
        ? `/creator/onboarding?role=${role}`
        : `/onboarding?role=${role}`
      return NextResponse.redirect(`${origin}${redirectPath}`)
    }
  }

  return NextResponse.redirect(`${origin}/creator?error=Auth failed`)
}
