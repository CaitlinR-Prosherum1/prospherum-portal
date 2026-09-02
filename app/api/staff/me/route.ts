import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 },
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("staff_profiles")
      .select("id, first_name, last_name, role, active")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Staff profile lookup error:", profileError);

      return NextResponse.json(
        { error: "Unable to verify staff profile." },
        { status: 500 },
      );
    }

    if (!profile || !profile.active) {
      return NextResponse.json(
        { error: "Staff access is inactive." },
        { status: 403 },
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
      },
      profile,
    });
  } catch (error) {
    console.error("Staff verification error:", error);

    return NextResponse.json(
      { error: "Unable to verify staff account." },
      { status: 500 },
    );
  }
}
