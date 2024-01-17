import { z } from "zod"

export const TodayOrTomorrowSchema = z.union([
  z.literal("today"),
  z.literal("tomorrow")
])

export type TodayOrTomorrow = z.infer<typeof TodayOrTomorrowSchema>
