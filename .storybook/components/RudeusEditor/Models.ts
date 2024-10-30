import { z } from "zod"
import { HapticPattern } from "@modules/tif-haptics"

// NB: It's probably not super necessary to make the entire AHAP format zod compatible for now.
export const HapticPatternSchema = z.custom<HapticPattern>()

export const RudeusPlatformSchema = z.union([
  z.literal("ios"),
  z.literal("android")
])

export type RudeusPlatform = z.infer<typeof RudeusPlatformSchema>

export const RudeusUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string()
})

export type RudeusUser = z.infer<typeof RudeusUserSchema>

export const RudeusPatternSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  user: RudeusUserSchema,
  ahapPattern: HapticPatternSchema,
  platform: RudeusPlatformSchema
})

export type RudeusPattern = z.infer<typeof RudeusPatternSchema>

export const MOCK_USER_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAxOTJkYWI0LWEwOGQtNzdiNi05MDJjLWEyOTdjNThhZTAzNSIsIm5hbWUiOiJCbG9iIn0.4jywZaAjYdGd2DCh1XhGExWTFvs_HgqyuZ6rINW_gtc"

export const MOCK_USER = {
  id: "0192dab4-a08d-77b6-902c-a297c58ae035",
  name: "Blob"
}
