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

export type ReportingReason = (typeof REPORTING_REASONS)[number]
