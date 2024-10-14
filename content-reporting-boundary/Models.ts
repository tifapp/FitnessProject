/**
 * A list of all {@link ReportingReason}s
 */
export const REPORTING_REASONS = [
  "spam",
  "harassment",
  "hate-speech",
  "violence",
  "scam",
  "self-harm",
  "misinformation",
  "illegally-sold-goods",
  "other"
] as const

/**
 * A reason that a user could report a piece of content.
 */
export type ReportingReason = (typeof REPORTING_REASONS)[number]

/**
 * Types of content that can be reported.
 *
 * A kind of reportable content must have some kind of id associated with it.
 */
export type ReportableContentType = "event" | "user"
