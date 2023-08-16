import { IS_HAPTICS_MUTED_KEY, PersistentHaptics } from "@lib/Haptics"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { TestHaptics } from "./helpers/Haptics"

describe("Haptics tests", () => {
  describe("PersistentHaptics tests", () => {
    beforeEach(async () => await AsyncStorage.clear())

    it("should persist the state that says that it's muted", async () => {
      const haptics = new PersistentHaptics(new TestHaptics())
      haptics.mute()
      const isMuted = await AsyncStorage.getItem(IS_HAPTICS_MUTED_KEY)
      expect(isMuted).toEqual("true")
    })

    it("shouldn't play haptics when it's muted", async () => {
      const testHaptics = new TestHaptics()
      const haptics = new PersistentHaptics(testHaptics)
      haptics.mute()
      await haptics.play({ name: "selection" })
      expect(testHaptics.playedEvents).toEqual([])
    })

    it("should mute underlying haptics when unmuted", () => {
      const testHaptics = new TestHaptics()
      new PersistentHaptics(testHaptics).mute()
      expect(testHaptics.isMuted).toEqual(true)
    })

    it("shouldn't have a key in asyncstorage after unmute", async () => {
      const haptics = new PersistentHaptics(new TestHaptics())
      haptics.mute()
      haptics.unmute()
      const isMuted = await AsyncStorage.getItem(IS_HAPTICS_MUTED_KEY)
      expect(isMuted).toBeNull()
    })

    it("should play haptics when unmuted", async () => {
      const testHaptics = new TestHaptics()
      const haptics = new PersistentHaptics(testHaptics)
      haptics.mute()
      haptics.unmute()
      await haptics.play({ name: "selection" })
      expect(testHaptics.playedEvents).toEqual([{ name: "selection" }])
    })

    it("should unmute underlying haptics when muted", () => {
      const testHaptics = new TestHaptics()
      testHaptics.mute()
      new PersistentHaptics(testHaptics).unmute()
      expect(testHaptics.isMuted).toEqual(false)
    })
  })
})
