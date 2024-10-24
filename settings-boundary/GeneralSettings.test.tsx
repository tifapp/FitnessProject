import { HAPTICS_SETTINGS_TITLE, hapticsSettingsTitle } from "./GeneralSettings"

describe("GeneralSettings tests", () => {
  describe("HapticsSettingsContents tests", () => {
    test("combinations", () => {
      expect(hapticsSettingsTitle(true, true)).toEqual(
        HAPTICS_SETTINGS_TITLE.feedbackAndAudio
      )
      expect(hapticsSettingsTitle(false, true)).toEqual(
        HAPTICS_SETTINGS_TITLE.audioOnly
      )
      expect(hapticsSettingsTitle(true, false)).toEqual(
        HAPTICS_SETTINGS_TITLE.feedbackOnly
      )
      expect(hapticsSettingsTitle(false, false)).toBeUndefined()
    })
  })
})
