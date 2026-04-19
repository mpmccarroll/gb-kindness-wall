import { ModerationResult } from "./types";

// ============================================================
// CONTENT MODERATION ENGINE
// Two-layer approach:
//   1. Hard reject: profanity, slurs, explicit content
//   2. Soft flag: negativity, meanness, sarcasm patterns
// ============================================================

// --- Layer 1: Profanity & Slur Detection ---

const PROFANITY_LIST = [
  // Core profanity (abbreviated patterns to catch variations)
  "fuck", "shit", "damn", "hell", "ass", "bitch", "bastard", "crap",
  "dick", "cock", "pussy", "whore", "slut", "piss",
  // Slurs (abbreviated to catch variations)
  "nigger", "nigga", "faggot", "fag", "retard", "retarded",
  "spic", "chink", "kike", "dyke", "tranny",
  // Kid-common insults that cross the line
  "suck", "stfu", "wtf", "wth", "omfg", "lmfao",
  "butthole", "butthead", "dumbass", "jackass", "dipshit",
  "moron", "idiot",
];

// Leetspeak substitution map
const LEET_MAP: Record<string, string> = {
  "@": "a", "4": "a",
  "8": "b",
  "(": "c",
  "3": "e",
  "1": "i", "!": "i", "|": "i",
  "0": "o",
  "5": "s", "$": "s",
  "7": "t", "+": "t",
  "v": "u",
};

function normalizeLeetspeak(text: string): string {
  let result = "";
  for (const char of text.toLowerCase()) {
    result += LEET_MAP[char] || char;
  }
  return result;
}

function stripNonAlpha(text: string): string {
  // Remove spaces, dots, dashes, underscores between letters
  // Catches: f.u.c.k, f u c k, f-u-c-k, etc.
  return text.replace(/[\s.\-_*#!@$%^&()+=]/g, "");
}

function containsProfanity(text: string): { found: boolean; word: string | null } {
  const lower = text.toLowerCase();

  // Check raw text
  for (const word of PROFANITY_LIST) {
    if (lower.includes(word)) {
      return { found: true, word };
    }
  }

  // Check with leetspeak normalization
  const normalized = normalizeLeetspeak(lower);
  for (const word of PROFANITY_LIST) {
    if (normalized.includes(word)) {
      return { found: true, word };
    }
  }

  // Check with non-alpha characters stripped (catches f.u.c.k, f u c k)
  const stripped = stripNonAlpha(lower);
  for (const word of PROFANITY_LIST) {
    if (stripped.includes(word)) {
      return { found: true, word };
    }
  }

  // Check leetspeak + stripped combo
  const normalizedStripped = stripNonAlpha(normalizeLeetspeak(lower));
  for (const word of PROFANITY_LIST) {
    if (normalizedStripped.includes(word)) {
      return { found: true, word };
    }
  }

  return { found: false, word: null };
}

// --- Layer 2: Negativity & Meanness Detection ---

const NEGATIVE_PATTERNS = [
  // Direct insults
  /\b(hate|hates|hating)\b/i,
  /\b(ugly|fat|dumb|stupid|loser|lame|boring|worst|terrible|horrible|disgusting)\b/i,
  /\b(nobody likes)\b/i,
  /\b(go away|get lost|shut up|leave me alone)\b/i,
  /\b(not my friend|no one cares|don't care)\b/i,
  /\b(smells|stinks|gross)\b/i,
  /\b(weird|freak|creep|loser|nerd)\b/i,

  // Threats or aggressive language
  /\b(kill|hurt|punch|kick|fight|beat up|hit)\b/i,
  /\b(i('ll|m going to|m gonna)\s+(get|hurt|punch|kick))\b/i,

  // Sarcasm indicators (when combined with otherwise positive words)
  /\b(yeah right|sure you are|as if|not)\b.*\b(nice|kind|smart|cool)\b/i,

  // Backhanded compliments
  /\b(for a|considering|at least)\b/i,

  // Exclusion
  /\b(can't sit with|not invited|don't play with|not allowed)\b/i,
];

const POSITIVE_INDICATORS = [
  /\b(thank|thanks|thankful|grateful)\b/i,
  /\b(kind|nice|sweet|helpful|awesome|amazing|wonderful|great|best)\b/i,
  /\b(friend|love|care|support|encourage)\b/i,
  /\b(smile|happy|joy|laugh|fun)\b/i,
  /\b(brave|strong|smart|creative|talented)\b/i,
  /\b(helped|teaches|showed|shared|gave|included)\b/i,
  /\b(appreciate|inspired|proud)\b/i,
];

function analyzesentiment(text: string): {
  negative: boolean;
  positiveScore: number;
  negativeScore: number;
  flagReason: string | null;
} {
  let positiveScore = 0;
  let negativeScore = 0;
  let flagReason: string | null = null;

  for (const pattern of POSITIVE_INDICATORS) {
    if (pattern.test(text)) positiveScore++;
  }

  for (const pattern of NEGATIVE_PATTERNS) {
    if (pattern.test(text)) {
      negativeScore++;
      if (!flagReason) {
        flagReason = `Potentially negative content detected`;
      }
    }
  }

  // If heavily negative and not enough positive signals, flag it
  const negative = negativeScore > 0 && positiveScore < negativeScore + 1;

  return { negative, positiveScore, negativeScore, flagReason };
}

// --- Layer 3: Structural checks ---

function structuralChecks(text: string): { valid: boolean; reason: string | null } {
  // Too short to be meaningful
  if (text.trim().length < 5) {
    return { valid: false, reason: "Message is too short" };
  }

  // Too many caps (yelling)
  const alphaChars = text.replace(/[^a-zA-Z]/g, "");
  if (alphaChars.length > 5) {
    const capsRatio = (text.replace(/[^A-Z]/g, "").length) / alphaChars.length;
    if (capsRatio > 0.7) {
      return { valid: false, reason: "Too many capital letters" };
    }
  }

  // Repeated characters (spam)
  if (/(.)\1{5,}/.test(text)) {
    return { valid: false, reason: "Repeated characters detected" };
  }

  // Check for gibberish (just random letters)
  const words = text.trim().split(/\s+/);
  const gibberishWords = words.filter(
    (w) => w.length > 3 && !/[aeiou]/i.test(w)
  );
  if (gibberishWords.length > words.length * 0.5 && words.length > 2) {
    return { valid: false, reason: "Message appears to be gibberish" };
  }

  return { valid: true, reason: null };
}

// --- Main moderation function ---

export function moderateMessage(message: string): ModerationResult {
  // Layer 0: Structural checks
  const structural = structuralChecks(message);
  if (!structural.valid) {
    return {
      approved: false,
      flagged: false,
      reason: structural.reason,
    };
  }

  // Layer 1: Hard reject on profanity
  const profanityCheck = containsProfanity(message);
  if (profanityCheck.found) {
    return {
      approved: false,
      flagged: false,
      reason: "Inappropriate language detected",
    };
  }

  // Layer 2: Soft flag on negativity
  const sentiment = analyzesentiment(message);
  if (sentiment.negative) {
    return {
      approved: false,
      flagged: true, // Goes to admin review queue
      reason: sentiment.flagReason,
    };
  }

  // All checks passed
  return {
    approved: true,
    flagged: false,
    reason: null,
  };
}

// Also check the name fields for abuse
export function moderateName(name: string): ModerationResult {
  const profanityCheck = containsProfanity(name);
  if (profanityCheck.found) {
    return {
      approved: false,
      flagged: false,
      reason: "Inappropriate language in name",
    };
  }

  if (name.trim().length < 2) {
    return {
      approved: false,
      flagged: false,
      reason: "Name is too short",
    };
  }

  return { approved: true, flagged: false, reason: null };
}
