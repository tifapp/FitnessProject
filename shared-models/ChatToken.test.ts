/* eslint-disable @typescript-eslint/naming-convention */
import { EventChatTokenChannelsCapabilitySchema } from "./ChatToken"

describe("ChatToken tests", () => {
  describe("EventChatTokenChannelsCapabilitySchema tests", () => {
    it("should accept an object with both pinned and normal channels", async () => {
      const result =
        await EventChatTokenChannelsCapabilitySchema.safeParseAsync(
          JSON.stringify({
            "5678-event": ["history", "publish", "subscribe"],
            "5878-event-pinned": ["history", "subscribe"]
          })
        )
      expect(result.success).toEqual(true)
    })

    it("should reject an object with event but no pinned channel", async () => {
      const result =
        await EventChatTokenChannelsCapabilitySchema.safeParseAsync(
          JSON.stringify({
            "5678-event": ["history", "publish", "subscribe"]
          })
        )
      expect(result.success).toEqual(false)
    })

    it("should reject an object with event pinned channel but no normal channel", async () => {
      const result =
        await EventChatTokenChannelsCapabilitySchema.safeParseAsync(
          JSON.stringify({
            "5678-event-pinned": ["history", "subscribe"]
          })
        )
      expect(result.success).toEqual(false)
    })

    it("should reject an object with extraneous channel names", async () => {
      const result =
        await EventChatTokenChannelsCapabilitySchema.safeParseAsync(
          JSON.stringify({
            "5678-toothbrush": ["history", "publish", "subscribe"],
            "2468-who-do-we-appreciate": ["history", "subscribe"]
          })
        )
      expect(result.success).toEqual(false)
    })

    it("should reject an object without both history and subscribe permissions", async () => {
      const result =
        await EventChatTokenChannelsCapabilitySchema.safeParseAsync(
          JSON.stringify({
            "5678-event": ["history", "publish"],
            "5878-event-pinned": ["subscribe"]
          })
        )
      expect(result.success).toEqual(false)
    })

    it("should reject an object with invalid permissions", async () => {
      const result =
        await EventChatTokenChannelsCapabilitySchema.safeParseAsync(
          JSON.stringify({
            "5678-event": ["history", "presence", "subscribe"],
            "5878-event-pinned": ["history", "subscribe", "channel-metadata"]
          })
        )
      expect(result.success).toEqual(false)
    })

    it("should reject an object with duplicate permissions", async () => {
      const result =
        await EventChatTokenChannelsCapabilitySchema.safeParseAsync(
          JSON.stringify({
            "5678-event": ["history", "history"],
            "5878-event-pinned": ["subscribe", "subscribe"]
          })
        )
      expect(result.success).toEqual(false)
    })

    it("should reject an object with no channels", async () => {
      const result =
        await EventChatTokenChannelsCapabilitySchema.safeParseAsync(
          JSON.stringify({})
        )
      expect(result.success).toEqual(false)
    })

    it("should reject an invalid JSON string", async () => {
      const result =
        await EventChatTokenChannelsCapabilitySchema.safeParseAsync(
          "hello world"
        )
      expect(result.success).toEqual(false)
    })
  })
})
