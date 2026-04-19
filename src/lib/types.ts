export type RecipientRole = "student" | "teacher" | "staff" | "parent";
export type Grade = "K" | "1" | "2" | "3" | "4" | "5" | "6";
export type MessageStatus = "approved" | "pending" | "rejected";
export type WallCategory =
  | "K"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "school"
  | "parents";

export interface KindnessMessage {
  id: string;
  author_name: string;
  author_grade: Grade;
  recipient_name: string;
  recipient_role: RecipientRole;
  recipient_grade: Grade | null;
  message: string;
  status: MessageStatus;
  category: WallCategory;
  created_at: string;
}

export interface SubmissionPayload {
  author_name: string;
  author_grade: Grade;
  recipient_name: string;
  recipient_role: RecipientRole;
  recipient_grade: Grade | null;
  message: string;
}

export interface ModerationResult {
  approved: boolean;
  flagged: boolean;
  reason: string | null;
}

export const GRADES: Grade[] = ["K", "1", "2", "3", "4", "5", "6"];

export const WALL_TABS: { key: WallCategory; label: string }[] = [
  { key: "K", label: "Kindergarten" },
  { key: "1", label: "1st Grade" },
  { key: "2", label: "2nd Grade" },
  { key: "3", label: "3rd Grade" },
  { key: "4", label: "4th Grade" },
  { key: "5", label: "5th Grade" },
  { key: "6", label: "6th Grade" },
  { key: "school", label: "School & Staff" },
  { key: "parents", label: "Parents" },
];

export function computeCategory(
  recipientRole: RecipientRole,
  recipientGrade: Grade | null
): WallCategory {
  if (recipientRole === "parent") return "parents";
  if (recipientRole === "staff") return "school";
  if (recipientRole === "teacher") return "school";
  // student
  return recipientGrade ? recipientGrade : "school";
}
