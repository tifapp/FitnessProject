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

export type ReportableContentType = "event" | "user"

export const reportContent = async (
  contentId: string,
  contentType: ReportableContentType,
  reason: ReportingReason
) => {
  // TODO: - Backend endpoint for reporting events and users.
}
