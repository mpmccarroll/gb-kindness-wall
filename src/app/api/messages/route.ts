import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { WALL_TABS } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const countsOnly = searchParams.get("counts") === "true";

  try {
    if (countsOnly) {
      // Return message counts per category (for tab badges)
      const counts: Record<string, number> = {};

      for (const tab of WALL_TABS) {
        const { count, error } = await supabase
          .from("kindness_messages")
          .select("*", { count: "exact", head: true })
          .eq("status", "approved")
          .eq("category", tab.key);

        if (!error && count !== null) {
          counts[tab.key] = count;
        }
      }

      return NextResponse.json({ counts });
    }

    // Fetch messages for a specific category
    const category = searchParams.get("category") || "K";

    const { data, error } = await supabase
      .from("kindness_messages")
      .select("*")
      .eq("status", "approved")
      .eq("category", category)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("Fetch error:", error);
      return NextResponse.json(
        { error: "Failed to load messages" },
        { status: 500 }
      );
    }

    return NextResponse.json({ messages: data || [] });
  } catch (err) {
    console.error("Messages API error:", err);
    return NextResponse.json(
      { error: "Failed to load messages" },
      { status: 500 }
    );
  }
}
