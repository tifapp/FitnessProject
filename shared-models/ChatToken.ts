import { z } from "zod"

export const EventChatChannelCapabilitySchema = z.union([
  z.literal("history"),
  z.literal("subscribe"),
  z.literal("publish")
])

const ChannelsCapabilityObjectSchema = z
  .record(
    z.string().regex(/^\d+-event(-pinned)?$/),
    z.array(EventChatChannelCapabilitySchema)
  )
  .refine((channelsWithCapabilities) => {
    if (Object.keys(channelsWithCapabilities).length < 2) return false
    return Object.values(channelsWithCapabilities).every((permissions) => {
      const permissionsSet = new Set(permissions)
      const includesRequiredPermissions =
        permissionsSet.has("history") && permissionsSet.has("subscribe")
      const hasDuplicates = permissionsSet.size !== permissions.length
      return includesRequiredPermissions && !hasDuplicates
    })
  })

export const EventChatTokenChannelsCapabilitySchema = z
  .string()
  .refine(async (str) => {
    try {
      await ChannelsCapabilityObjectSchema.parseAsync(JSON.parse(str))
      return true
    } catch {
      return false
    }
  })

export const EventChatTokenRequestSchema = z.object({
  capability: EventChatTokenChannelsCapabilitySchema,
  clientId: z.string().uuid(),
  keyName: z.string(),
  mac: z.string(),
  timestamp: z.number(),
  nonce: z.string().min(16)
})

/**
 * A request for a token to access the group chat for an event.
 */
export type EventChatTokenRequest = z.infer<typeof EventChatTokenRequestSchema>
