import { z } from "zod"
import {
  HapticEvent,
  HapticPattern,
  HapticPatternElement,
  events,
  hapticPattern
} from "@modules/tif-haptics"
import { Tagged } from "TiFShared/lib/Types/HelperTypes"

// NB: It's probably not super necessary to make the entire AHAP format zod compatible for now.
export const RudeusAHAPPatternSchema = z.custom<
  HapticPattern & { Version: number }
>()

export type RudeusAHAPPattern = z.rInfer<typeof RudeusAHAPPatternSchema>

export const RudeusPlatformSchema = z.union([
  z.literal("ios"),
  z.literal("android")
])

export type RudeusPlatform = z.infer<typeof RudeusPlatformSchema>

export type RudeusUserID = Tagged<string, "rudeusUser">

export const RudeusUserIDSchema = z
  .string()
  .uuid()
  .transform((id) => id as RudeusUserID)

export const RudeusUserSchema = z.object({
  id: RudeusUserIDSchema,
  name: z.string()
})

export type RudeusUser = z.infer<typeof RudeusUserSchema>

export const RudeusPatternSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  user: RudeusUserSchema,
  ahapPattern: RudeusAHAPPatternSchema,
  platform: RudeusPlatformSchema
})

export type RudeusPattern = z.infer<typeof RudeusPatternSchema>

export const RudeusSharePatternRequestSchema = z.object({
  id: z.string().uuid().nullable(),
  name: z.string(),
  description: z.string(),
  ahapPattern: RudeusAHAPPatternSchema,
  platform: RudeusPlatformSchema
})

export type RudeusSharePatternRequest = z.rInfer<
  typeof RudeusSharePatternRequestSchema
>

export type RudeusEditorPattern = Omit<RudeusSharePatternRequest, "platform">

export const editorPattern = (
  pattern: RudeusPattern,
  userId: RudeusUserID
): RudeusEditorPattern => ({
  id: pattern.user.id === userId ? pattern.id : null,
  name: pattern.name,
  description: pattern.description,
  ahapPattern: pattern.ahapPattern
})

export const EMPTY_PATTERN_EDITOR_PATTERN = {
  id: null,
  name: "",
  description: "",
  ahapPattern: { ...hapticPattern(events()), Version: 1 }
} satisfies Readonly<RudeusEditorPattern>

export type RudeusEditablePatternEventID = Tagged<
  string,
  "editablePatternEvent"
>

export type RudeusEditablePatternEvent = {
  element: HapticPatternElement
  isHidden: boolean
}

export const MOCK_USER_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAxOTJkYWI0LWEwOGQtNzdiNi05MDJjLWEyOTdjNThhZTAzNSIsIm5hbWUiOiJCbG9iIn0.4jywZaAjYdGd2DCh1XhGExWTFvs_HgqyuZ6rINW_gtc"

export const MOCK_USER = {
  id: "0192dab4-a08d-77b6-902c-a297c58ae035",
  name: "Blob"
}
