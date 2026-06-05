import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const user_name = searchParams.get("user_name");

  if (!user_name || !/^[a-z0-9_]+$/.test(user_name)) {
    return NextResponse.json(
      { available: false, error: "Invalid user_name format" },
      { status: 400 },
    );
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("creators")
    .select("user_name")
    .eq("user_name", user_name)
    .maybeSingle();

  if (error) {
    console.log("SOme error", error);
    return NextResponse.json(
      { available: false, error: "Something went wrong" },
      { status: 500 },
    );
  }

  return NextResponse.json({ available: !data });
}
