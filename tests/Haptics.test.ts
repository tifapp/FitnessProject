import { IS_HAPTICS_MUTED_KEY, PersistentHaptics } from "@lib/Haptics"
import AsyncStorage from "@react-native-async-storage/async-storage"

describe("Haptics tests", () => {
  describe("PersistentHaptics tests", () => {
    beforeEach(async () => await AsyncStorage.clear())

    it("should persist the state that says that it's muted", async () => {
      const haptics = new PersistentHaptics(jest.fn())
      haptics.mute()
      const isMuted = await AsyncStorage.getItem(IS_HAPTICS_MUTED_KEY)
      expect(isMuted).toEqual("true")
    })

    it("shouldn't play haptics when it's muted", async () => {
      const playHaptics = jest.fn()
      const haptics = new PersistentHaptics(playHaptics)
      haptics.mute()
      await haptics.play({ name: "selection" })
      expect(playHaptics).not.toHaveBeenCalled()
    })

    it("shouldn't have a key in asyncstorage after unmute", async () => {
      const haptics = new PersistentHaptics(jest.fn())
      haptics.mute()
      haptics.unmute()
      const isMuted = await AsyncStorage.getItem(IS_HAPTICS_MUTED_KEY)
      expect(isMuted).toBeNull()
    })

    it("should play haptics when unmuted", async () => {
      const playHaptics = jest.fn()
      const haptics = new PersistentHaptics(playHaptics)
      haptics.mute()
      haptics.unmute()
      await haptics.play({ name: "selection" })
      expect(playHaptics).toHaveBeenCalledWith({ name: "selection" })
    })
  })
})
