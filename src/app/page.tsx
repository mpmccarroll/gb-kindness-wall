"use client";

import { useState } from "react";
import { Grade, RecipientRole, GRADES } from "@/lib/types";

const ROLE_OPTIONS: { value: RecipientRole; label: string; emoji: string }[] = [
  { value: "student", label: "Student", emoji: "🎒" },
  { value: "teacher", label: "Teacher", emoji: "📚" },
  { value: "staff", label: "School Staff", emoji: "🏫" },
  { value: "parent", label: "Parent", emoji: "👨‍👩‍👧‍👦" },
];

type FormState = "idle" | "submitting" | "success" | "flagged" | "locked" | "error";

export default function SubmitPage() {
  const [authorName, setAuthorName] = useState("");
  const [authorGrade, setAuthorGrade] = useState<Grade | "">("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientRole, setRecipientRole] = useState<RecipientRole | "">("");
  const [recipientGrade, setRecipientGrade] = useState<Grade | "">("");
  const [message, setMessage] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [flagCount, setFlagCount] = useState(0);

  const showRecipientGrade = recipientRole === "student";

  const canSubmit =
    authorName.trim() &&
    authorGrade &&
    recipientName.trim() &&
    recipientRole &&
    message.trim().length >= 5 &&
    (!showRecipientGrade || recipientGrade);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setFormState("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_name: authorName.trim(),
          author_grade: authorGrade,
          recipient_name: recipientName.trim(),
          recipient_role: recipientRole,
          recipient_grade: showRecipientGrade ? recipientGrade : null,
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.status !== "pending") {
        setFormState("success");
        // Reset form after a delay
        setTimeout(() => {
          setAuthorName("");
          setAuthorGrade("");
          setRecipientName("");
          setRecipientRole("");
          setRecipientGrade("");
          setMessage("");
          setFormState("idle");
        }, 3000);
      } else if (data.flagged || data.status === "pending") {
        // Content was flagged by moderation
        const newCount = flagCount + 1;
        setFlagCount(newCount);
        if (newCount >= 2) {
          setFormState("locked");
        } else {
          setFormState("flagged");
        }
      } else {
        setFormState("error");
        setErrorMsg(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setFormState("error");
      setErrorMsg("Could not connect. Please try again.");
    }
  }

  if (formState === "flagged") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center animate-fade-in max-w-md mx-auto">
          {/* Shocked/concerned bear face built with SVG */}
          <div className="mb-4">
            <svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto success-check">
              {/* Bear ears */}
              <circle cx="30" cy="25" r="18" fill="#7B1F32" />
              <circle cx="90" cy="25" r="18" fill="#7B1F32" />
              <circle cx="30" cy="25" r="11" fill="#E8712B" />
              <circle cx="90" cy="25" r="11" fill="#E8712B" />
              {/* Bear face */}
              <circle cx="60" cy="62" r="42" fill="#7B1F32" />
              {/* Inner face */}
              <circle cx="60" cy="66" r="34" fill="#9A2840" />
              {/* Eyes - wide open (shocked) */}
              <circle cx="44" cy="54" r="9" fill="white" />
              <circle cx="76" cy="54" r="9" fill="white" />
              <circle cx="44" cy="54" r="5" fill="#1A1A1A" />
              <circle cx="76" cy="54" r="5" fill="#1A1A1A" />
              {/* Eye shine */}
              <circle cx="46" cy="52" r="2" fill="white" />
              <circle cx="78" cy="52" r="2" fill="white" />
              {/* Nose */}
              <ellipse cx="60" cy="70" rx="7" ry="5" fill="#1A1A1A" />
              {/* Mouth - open O shape (shocked) */}
              <ellipse cx="60" cy="82" rx="8" ry="6" fill="#1A1A1A" />
              <ellipse cx="60" cy="81" rx="6" ry="4" fill="#5A1625" />
              {/* Eyebrows - raised */}
              <path d="M34 42 Q44 36 54 42" stroke="#1A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M66 42 Q76 36 86 42" stroke="#1A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="font-display text-2xl text-gb-maroon mb-3">
            Hmm, Let&apos;s Try Again!
          </h2>
          <p className="text-base text-gb-black/70 font-body leading-relaxed mb-4">
            Thank you for participating. It seems your message might not have
            been kind — or else our filter mis-interpreted it. Would you please
            submit something that aligns with the goal?
          </p>
          <p className="text-sm text-gb-black/50 font-body mb-6">
            Or you&apos;re welcome to skip — no worries at all!
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setMessage("");
                setFormState("idle");
              }}
              className="px-6 py-3 bg-gb-maroon text-white font-display rounded-full shadow-md hover:bg-gb-maroon-dark transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                setAuthorName("");
                setAuthorGrade("");
                setRecipientName("");
                setRecipientRole("");
                setRecipientGrade("");
                setMessage("");
                setFormState("idle");
              }}
              className="px-6 py-3 bg-white text-gb-black/60 font-body font-semibold rounded-full border-2 border-gb-maroon/20 hover:border-gb-maroon/40 transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (formState === "locked") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center animate-fade-in max-w-md mx-auto">
          <div className="mb-4">
            <svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto success-check">
              {/* Bear ears */}
              <circle cx="30" cy="25" r="18" fill="#7B1F32" />
              <circle cx="90" cy="25" r="18" fill="#7B1F32" />
              <circle cx="30" cy="25" r="11" fill="#E8712B" />
              <circle cx="90" cy="25" r="11" fill="#E8712B" />
              {/* Bear face */}
              <circle cx="60" cy="62" r="42" fill="#7B1F32" />
              <circle cx="60" cy="66" r="34" fill="#9A2840" />
              {/* Eyes - gentle/closed (calm but firm) */}
              <path d="M36 54 Q44 48 52 54" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M68 54 Q76 48 84 54" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" />
              {/* Nose */}
              <ellipse cx="60" cy="68" rx="7" ry="5" fill="#1A1A1A" />
              {/* Mouth - small flat line (neutral) */}
              <path d="M50 80 Q60 78 70 80" stroke="#1A1A1A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="font-display text-2xl text-gb-maroon mb-3">
            Time to Take a Break
          </h2>
          <p className="text-base text-gb-black/70 font-body leading-relaxed mb-4">
            It looks like our kindness filter flagged a couple of your
            submissions. That&apos;s okay! The Kindness Wall will be here
            for everyone to enjoy.
          </p>
          <p className="text-sm text-gb-black/50 font-body">
            Thanks for participating today, Grizzly! 🐻
          </p>
        </div>
      </div>
    );
  }

  if (formState === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center animate-fade-in">
          <div className="success-check text-7xl mb-4">🐻</div>
          <h2 className="font-display text-3xl text-gb-maroon mb-2">
            Thank You!
          </h2>
          <p className="text-lg text-gb-black/70 font-body">
            Your kindness message has been posted to the wall!
          </p>
          <p className="text-sm text-gb-black/50 mt-2 font-body">
            Sending another in a moment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gb-maroon text-white py-5 px-4 shadow-lg">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-4xl mb-1">🐻</div>
          <h1 className="font-display text-2xl sm:text-3xl tracking-wide">
            GB Kindness Wall
          </h1>
          <p className="font-body text-white/80 text-sm mt-1">
            Friday, April 24, 2026
          </p>
        </div>
      </header>

      {/* Intro */}
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-2 text-center">
        <p className="font-body text-lg text-gb-black/80">
          Share something kind about someone at Gardner Bullis!
          <br />
          <span className="text-gb-orange font-bold">
            Who makes our school great?
          </span>
        </p>
      </div>

      {/* View Wall CTA */}
      <div className="max-w-2xl mx-auto px-4 pb-4">
        <a
          href="/wall"
          className="block w-full py-4 bg-gb-orange text-white font-display text-lg text-center rounded-xl shadow-md hover:bg-gb-orange-dark transition-colors"
        >
          👀 See the Kindness Wall Before You Post!
        </a>
        <p className="text-center font-body text-sm text-gb-black/50 mt-2">
          Want to see what others are saying? Check out the wall first, then come back to add yours!
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto px-4 pb-10 space-y-5"
      >
        {/* About You */}
        <fieldset className="bg-white rounded-xl p-5 shadow-sm border border-gb-maroon/10 space-y-4">
          <legend className="font-display text-gb-maroon text-lg px-2">
            About You
          </legend>

          <div>
            <label className="block font-body font-semibold text-sm mb-1">
              Your First Name
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              maxLength={30}
              placeholder="e.g. Rowan"
              className="w-full px-4 py-3 rounded-lg border-2 border-gb-maroon/20 focus:border-gb-orange focus:outline-none font-body text-lg transition-colors"
            />
          </div>

          <div>
            <label className="block font-body font-semibold text-sm mb-1">
              Your Grade
            </label>
            <div className="flex flex-wrap gap-2">
              {GRADES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setAuthorGrade(g)}
                  className={`px-4 py-2 rounded-full font-body font-bold text-sm transition-all ${
                    authorGrade === g
                      ? "bg-gb-orange text-white shadow-md scale-105"
                      : "bg-white border-2 border-gb-maroon/20 text-gb-black/70 hover:border-gb-orange/50"
                  }`}
                >
                  {g === "K" ? "K" : g}
                </button>
              ))}
            </div>
          </div>
        </fieldset>

        {/* Who You're Thanking */}
        <fieldset className="bg-white rounded-xl p-5 shadow-sm border border-gb-maroon/10 space-y-4">
          <legend className="font-display text-gb-maroon text-lg px-2">
            Who Are You Thanking?
          </legend>

          <div>
            <label className="block font-body font-semibold text-sm mb-1">
              Their Name
            </label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              maxLength={50}
              placeholder="e.g. Mrs. Johnson"
              className="w-full px-4 py-3 rounded-lg border-2 border-gb-maroon/20 focus:border-gb-orange focus:outline-none font-body text-lg transition-colors"
            />
          </div>

          <div>
            <label className="block font-body font-semibold text-sm mb-1">
              They Are A...
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ROLE_OPTIONS.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => {
                    setRecipientRole(role.value);
                    if (
                      role.value !== "student" &&
                      role.value !== "teacher"
                    ) {
                      setRecipientGrade("");
                    }
                  }}
                  className={`px-4 py-3 rounded-lg font-body font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    recipientRole === role.value
                      ? "bg-gb-orange text-white shadow-md scale-[1.02]"
                      : "bg-white border-2 border-gb-maroon/20 text-gb-black/70 hover:border-gb-orange/50"
                  }`}
                >
                  <span>{role.emoji}</span>
                  <span>{role.label}</span>
                </button>
              ))}
            </div>
          </div>

          {showRecipientGrade && (
            <div className="animate-slide-up">
              <label className="block font-body font-semibold text-sm mb-1">
                Their Grade
              </label>
              <div className="flex flex-wrap gap-2">
                {GRADES.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setRecipientGrade(g)}
                    className={`px-4 py-2 rounded-full font-body font-bold text-sm transition-all ${
                      recipientGrade === g
                        ? "bg-gb-orange text-white shadow-md scale-105"
                        : "bg-white border-2 border-gb-maroon/20 text-gb-black/70 hover:border-gb-orange/50"
                    }`}
                  >
                    {g === "K" ? "K" : g}
                  </button>
                ))}
              </div>
            </div>
          )}
        </fieldset>

        {/* Kindness Message */}
        <fieldset className="bg-white rounded-xl p-5 shadow-sm border border-gb-maroon/10 space-y-3">
          <legend className="font-display text-gb-maroon text-lg px-2">
            Your Kindness Message
          </legend>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={300}
            rows={3}
            placeholder="What kind thing do you want to say? e.g. 'Thank you for always helping me in math!'"
            className="w-full px-4 py-3 rounded-lg border-2 border-gb-maroon/20 focus:border-gb-orange focus:outline-none font-body text-lg transition-colors resize-none"
          />
          <div className="text-right text-xs text-gb-black/40 font-body">
            {message.length}/300
          </div>
        </fieldset>

        {/* Error message */}
        {formState === "error" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 font-body text-sm animate-slide-up">
            {errorMsg}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={!canSubmit || formState === "submitting"}
          className={`w-full py-4 rounded-xl font-display text-xl text-white shadow-lg transition-all ${
            canSubmit && formState !== "submitting"
              ? "bg-gb-maroon hover:bg-gb-maroon-dark active:scale-[0.98] cursor-pointer"
              : "bg-gb-maroon/40 cursor-not-allowed"
          }`}
        >
          {formState === "submitting" ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Posting...
            </span>
          ) : (
            "Post Kindness 🐻"
          )}
        </button>
      </form>

      {/* Footer link to wall */}
      <div className="text-center pb-8">
        <a
          href="/wall"
          className="font-body text-gb-orange hover:text-gb-orange-dark underline underline-offset-2 transition-colors"
        >
          View the Kindness Wall →
        </a>
      </div>
    </div>
  );
}
