import { areSettingsEqual } from "./Settings"

describe("Settings tests", () => {
  describe("AreSettingsEqual tests", () => {
    it("should be equal when the keys and values are the same", () => {
      const settings1 = {
        hello: "world",
        isOn: true,
        count: 3,
        currentDate: new Date()
      }
      expect(areSettingsEqual(settings1, { ...settings1 })).toEqual(true)
    })

    it("should not be equal when values are not the same", () => {
      const settings = {
        hello: "hello",
        isOn: false,
        count: 2,
        currentDate: new Date()
      }
      expect(
        areSettingsEqual(settings, { ...settings, hello: "world" })
      ).toEqual(false)
      expect(areSettingsEqual(settings, { ...settings, isOn: true })).toEqual(
        false
      )
      expect(areSettingsEqual(settings, { ...settings, count: 400 })).toEqual(
        false
      )
      expect(
        areSettingsEqual(settings, { ...settings, currentDate: new Date(0) })
      ).toEqual(false)
    })
  })
})
