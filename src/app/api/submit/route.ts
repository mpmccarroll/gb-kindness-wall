import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { moderateMessage, moderateName } from "@/lib/moderation";
import { computeCategory, SubmissionPayload, GRADES } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body: SubmissionPayload = await request.json();

    // --- Validate required fields ---
    if (!body.author_name?.trim()) {
      return NextResponse.json(
        { error: "Please enter your name." },
        { status: 400 }
      );
    }
    if (!body.author_grade || !GRADES.includes(body.author_grade)) {
      return NextResponse.json(
        { error: "Please select your grade." },
        { status: 400 }
      );
    }
    if (!body.recipient_name?.trim()) {
      return NextResponse.json(
        { error: "Please enter the name of the person you're thanking." },
        { status: 400 }
      );
    }
    if (
      !body.recipient_role ||
      !["student", "teacher", "staff", "parent"].includes(body.recipient_role)
    ) {
      return NextResponse.json(
        { error: "Please select who they are." },
        { status: 400 }
      );
    }
    if (!body.message?.trim() || body.message.trim().length < 5) {
      return NextResponse.json(
        { error: "Your kindness message needs to be at least 5 characters." },
        { status: 400 }
      );
    }
    if (body.message.length > 300) {
      return NextResponse.json(
        { error: "Your message is too long (max 300 characters)." },
        { status: 400 }
      );
    }

    // --- Moderate names ---
    const authorNameCheck = moderateName(body.author_name);
    if (!authorNameCheck.approved) {
      return NextResponse.json(
        {
          error:
            "Hmm, there's something wrong with the name you entered. Please use your real first name!",
        },
        { status: 400 }
      );
    }

    const recipientNameCheck = moderateName(body.recipient_name);
    if (!recipientNameCheck.approved) {
      return NextResponse.json(
        {
          error:
            "Hmm, there's something wrong with that name. Please check and try again!",
        },
        { status: 400 }
      );
    }

    // --- Moderate message ---
    const modResult = moderateMessage(body.message);

    if (!modResult.approved && !modResult.flagged) {
      // Hard reject — profanity or structural failure
      return NextResponse.json(
        {
          error:
            "Your message couldn't be posted. Remember, the Kindness Wall is for nice and positive messages only! Please try again. 🐻",
          flagged: true,
        },
        { status: 400 }
      );
    }

    // Compute which wall category this belongs to
    const category = computeCategory(
      body.recipient_role,
      body.recipient_grade || null
    );

    // Determine status
    const status = modResult.flagged ? "pending" : "approved";

    // --- Store in database ---
    const supabase = createServerClient();
    const { error: dbError } = await supabase
      .from("kindness_messages")
      .insert({
        author_name: body.author_name.trim(),
        author_grade: body.author_grade,
        recipient_name: body.recipient_name.trim(),
        recipient_role: body.recipient_role,
        recipient_grade: body.recipient_grade || null,
        message: body.message.trim(),
        status,
        category,
        moderation_reason: modResult.reason || null,
      });

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Something went wrong. Please try again!" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      status,
      message:
        status === "pending"
          ? "Your message is being reviewed and will appear shortly!"
          : "Your kindness has been posted to the wall!",
    });
  } catch (err) {
    console.error("Submit error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again!" },
      { status: 500 }
    );
  }
}
