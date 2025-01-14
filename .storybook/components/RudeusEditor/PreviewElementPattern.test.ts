import {
  transientEvent,
  continuousEvent,
  dynamicParameter,
  soundEffectEvent,
  continuousSoundEvent,
  parameterCurve,
  keyFrame,
  singleEventPattern
} from "@modules/tif-haptics"
import { previewElementPattern } from "./PreviewElementPattern"

describe("PreviewElementPattern tests", () => {
  it.each([
    [
      "Haptic Transient",
      { Event: transientEvent(0, {}) },
      singleEventPattern(transientEvent(0, {}))
    ],
    [
      "Haptic Continuous",
      { Event: continuousEvent(1.0, 2.0, { HapticIntesity: 1 }) },
      singleEventPattern(transientEvent(0.0, { HapticIntesity: 1 }))
    ],
    [
      "Audio Custom",
      { Event: soundEffectEvent("test.wav", 2.0, { AudioVolume: 0.5 }) },
      undefined
    ],
    [
      "Audio Continuous",
      { Event: continuousSoundEvent(2.0, 2.0, { AudioVolume: 0.5 }) },
      singleEventPattern(continuousSoundEvent(0, 0.05, { AudioVolume: 0.5 }))
    ],
    [
      "Haptic Intensity Parameter",
      { Parameter: dynamicParameter("HapticIntensityControl", 0.4, 0.5) },
      singleEventPattern(transientEvent(0, { HapticIntensity: 0.4 }))
    ],
    [
      "Haptic Sharpness Parameter",
      { Parameter: dynamicParameter("HapticSharpnessControl", 0.4, 0.5) },
      singleEventPattern(
        transientEvent(0, { HapticIntensity: 0.5, HapticSharpness: 0.4 })
      )
    ],
    [
      "Haptic Attack Time Parameter",
      { Parameter: dynamicParameter("HapticAttackTimeControl", 0.4, 0.5) },
      singleEventPattern(
        transientEvent(0, { HapticIntensity: 0.5, AttackTime: 0.4 })
      )
    ],
    [
      "Audio Volume Parameter",
      { Parameter: dynamicParameter("AudioVolumeControl", 0.4, 0.5) },
      singleEventPattern(continuousSoundEvent(0, 0.05, { AudioVolume: 0.4 }))
    ],
    [
      "Audio Pan Parameter",
      { Parameter: dynamicParameter("AudioPanControl", 0.4, 0.5) },
      singleEventPattern(
        continuousSoundEvent(0, 0.05, { AudioVolume: 0.5, AudioPan: 0.4 })
      )
    ],
    [
      "Haptic Intensity Curve",
      {
        ParameterCurve: parameterCurve("HapticIntensityControl", 0, [
          keyFrame(0.7, 0.2),
          keyFrame(0.4, 0.5)
        ]),
        keyFrameIndex: 1
      },
      singleEventPattern(transientEvent(0, { HapticIntensity: 0.4 }))
    ],
    [
      "Haptic Intensity Curve No Index",
      {
        ParameterCurve: parameterCurve("HapticIntensityControl", 0, [
          keyFrame(0.7, 0.2),
          keyFrame(0.4, 0.5)
        ])
      },
      undefined
    ]
  ])(
    "should convert %s to a preview element",
    (_, element, expectedPattern) => {
      expect(previewElementPattern(element)).toEqual(expectedPattern)
    }
  )
})
