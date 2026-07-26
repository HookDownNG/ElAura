import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const queryUserName = searchParams.get("user_name")
  const queryRole = searchParams.get("role")
  const cookieUserName = request.cookies.get("pending_user_name")?.value || null

  // Handle proxy headers for VS Code Dev Tunnels, custom domains, and localhost
  const forwardedHost = request.headers.get("x-forwarded-host")
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https"
  const origin = forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : request.nextUrl.origin

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Fetch existing profile
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id, role, user_name")
          .eq("id", user.id)
          .maybeSingle()

        const metaUserName = user.user_metadata?.user_name || null
        const metaRole = user.user_metadata?.role || null

        const rawUserName = cookieUserName || queryUserName || metaUserName || existingProfile?.user_name || null
        const cleanUserName = rawUserName ? decodeURIComponent(rawUserName).toLowerCase().trim() : null
        const role = existingProfile?.role || queryRole || metaRole || "creator"

        const fullName = user.user_metadata?.full_name ?? user.user_metadata?.name ?? null
        const avatarUrl = user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null

        // 1. Upsert Profile (role & user_name)
        await supabase.from("profiles").upsert({
          id: user.id,
          email: user.email ?? null,
          full_name: fullName,
          avatar_url: avatarUrl,
          role,
          user_name: cleanUserName,
          updated_at: new Date().toISOString(),
        })

        // 2. Upsert Creator row if role is creator
        if (role === "creator") {
          await supabase.from("creators").upsert({
            id: user.id,
            user_name: cleanUserName,
            full_name: fullName,
            updated_at: new Date().toISOString(),
          })
        }

        const targetPath = role === "brand" ? "/dashboard" : "/creator/dashboard"
        const response = NextResponse.redirect(`${origin}${targetPath}`)
        response.cookies.delete("pending_user_name")
        return response
      }
      return NextResponse.redirect(`${origin}/creator/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/creator?error=Auth failed`)
}
