import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

function checkPassword(request: NextRequest): boolean {
  const pw = request.headers.get("x-admin-password");
  const adminPw = process.env.ADMIN_PASSWORD || "grizzly2026";
  return pw === adminPw;
}

// GET: Fetch pending and all messages for admin review
export async function GET(request: NextRequest) {
  if (!checkPassword(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();

  try {
    // Fetch pending messages
    const { data: pending } = await supabase
      .from("kindness_messages")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    // Fetch all messages (most recent 500)
    const { data: all } = await supabase
      .from("kindness_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    // Compute stats
    const allMessages = all || [];
    const stats = {
      total: allMessages.length,
      approved: allMessages.filter((m) => m.status === "approved").length,
      pending: allMessages.filter((m) => m.status === "pending").length,
      rejected: allMessages.filter((m) => m.status === "rejected").length,
    };

    return NextResponse.json({
      pending: pending || [],
      all: allMessages,
      stats,
    });
  } catch (err) {
    console.error("Admin fetch error:", err);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

// POST: Approve or reject a message
export async function POST(request: NextRequest) {
  if (!checkPassword(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, action } = await request.json();

    if (!id || !["approve", "reject", "delete"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    if (action === "delete") {
      const { error } = await supabase
        .from("kindness_messages")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Delete error:", error);
        return NextResponse.json(
          { error: "Failed to delete message" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, deleted: true });
    }

    const newStatus = action === "approve" ? "approved" : "rejected";

    const { error } = await supabase
      .from("kindness_messages")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.error("Moderation update error:", error);
      return NextResponse.json(
        { error: "Failed to update message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (err) {
    console.error("Admin POST error:", err);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
