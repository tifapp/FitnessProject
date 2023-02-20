import { expoPlayHaptics, HapticEvent } from "@lib/Haptics"
import * as ExpoHaptics from "expo-haptics"

jest.mock("expo-haptics")

describe("ExpoHaptics tests", () => {
  it("translates a selection event correctly", async () => {
    await expoPlayHaptics(HapticEvent.SelectionChanged)
    expect(ExpoHaptics.selectionAsync).toHaveBeenCalled()
  })

  it("translates success notification events correctly", async () => {
    await expoPlayHaptics(HapticEvent.Success)
    expect(ExpoHaptics.notificationAsync).toHaveBeenCalledWith(
      ExpoHaptics.NotificationFeedbackType.Success
    )
  })

  it("translates warning notification events correctly", async () => {
    await expoPlayHaptics(HapticEvent.Warning)
    expect(ExpoHaptics.notificationAsync).toHaveBeenCalledWith(
      ExpoHaptics.NotificationFeedbackType.Warning
    )
  })

  it("translates error notification events correctly", async () => {
    await expoPlayHaptics(HapticEvent.Error)
    expect(ExpoHaptics.notificationAsync).toHaveBeenCalledWith(
      ExpoHaptics.NotificationFeedbackType.Error
    )
  })

  it("translates light tap events correctly", async () => {
    await expoPlayHaptics(HapticEvent.LightTap)
    expect(ExpoHaptics.impactAsync).toHaveBeenCalledWith(
      ExpoHaptics.ImpactFeedbackStyle.Light
    )
  })

  it("translates medium tap events correctly", async () => {
    await expoPlayHaptics(HapticEvent.MediumTap)
    expect(ExpoHaptics.impactAsync).toHaveBeenCalledWith(
      ExpoHaptics.ImpactFeedbackStyle.Medium
    )
  })

  it("translates heavy tap events correctly", async () => {
    await expoPlayHaptics(HapticEvent.HeavyTap)
    expect(ExpoHaptics.impactAsync).toHaveBeenCalledWith(
      ExpoHaptics.ImpactFeedbackStyle.Heavy
    )
  })
})
