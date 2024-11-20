import {
  hapticPattern,
  events,
  transientEvent,
  continuousEvent,
  soundEffectEvent,
  parameters,
  parameterCurve,
  keyFrame,
  dynamicParameter,
  continuousSoundEvent
} from "./TifHapticsModule"

describe("TiFHaptics tests", () => {
  test("Haptic Pattern with Parameter Curves", () => {
    const pattern = hapticPattern(
      events(
        transientEvent(0, { HapticIntensity: 0.5, HapticSharpness: 0.5 }),
        continuousEvent(0, 2, { HapticIntensity: 0.5, HapticSharpness: 0.5 }),
        soundEffectEvent(
          "coins.caf",
          0.5,
          { AudioVolume: 0.3 },
          { EventDuration: 3.0 }
        ),
        continuousSoundEvent(0.75, 2, { AudioVolume: 0.5, AudioPan: 0.2 })
      ),
      parameters(
        parameterCurve("HapticIntensityControl", 0, [
          keyFrame(0, 0),
          keyFrame(1, 0.1),
          keyFrame(0.5, 2)
        ]),
        parameterCurve("HapticSharpnessControl", 2, [
          keyFrame(0, 0),
          keyFrame(1, 0.1),
          keyFrame(0.5, 2)
        ])
      )
    )

    expect(pattern).toEqual({
      Pattern: [
        {
          Event: {
            EventType: "HapticTransient",
            Time: 0,
            EventParameters: [
              { ParameterID: "HapticIntensity", ParameterValue: 0.5 },
              { ParameterID: "HapticSharpness", ParameterValue: 0.5 }
            ]
          }
        },
        {
          Event: {
            EventType: "HapticContinuous",
            Time: 0,
            EventDuration: 2,
            EventParameters: [
              { ParameterID: "HapticIntensity", ParameterValue: 0.5 },
              { ParameterID: "HapticSharpness", ParameterValue: 0.5 }
            ]
          }
        },
        {
          Event: {
            EventType: "AudioCustom",
            EventWaveformPath: "coins.caf",
            EventDuration: 3.0,
            Time: 0.5,
            EventParameters: [
              { ParameterID: "AudioVolume", ParameterValue: 0.3 }
            ]
          }
        },
        {
          Event: {
            EventType: "AudioContinuous",
            Time: 0.75,
            EventDuration: 2.0,
            EventParameters: [
              { ParameterID: "AudioVolume", ParameterValue: 0.5 },
              { ParameterID: "AudioPan", ParameterValue: 0.2 }
            ]
          }
        },
        {
          ParameterCurve: {
            ParameterID: "HapticIntensityControl",
            Time: 0,
            ParameterCurveControlPoints: [
              { ParameterValue: 0, Time: 0 },
              { ParameterValue: 1, Time: 0.1 },
              { ParameterValue: 0.5, Time: 2 }
            ]
          }
        },
        {
          ParameterCurve: {
            ParameterID: "HapticSharpnessControl",
            Time: 2,
            ParameterCurveControlPoints: [
              { ParameterValue: 0, Time: 0 },
              { ParameterValue: 1, Time: 0.1 },
              { ParameterValue: 0.5, Time: 2 }
            ]
          }
        }
      ]
    })
  })

  test("Haptic Pattern with Dynamic Parameters", () => {
    const pattern = hapticPattern(
      events(
        transientEvent(0, { HapticIntensity: 0.5, HapticSharpness: 0.5 }),
        continuousEvent(0, 2, { HapticIntensity: 0.5, HapticSharpness: 0.5 }),
        soundEffectEvent("coins.caf", 0.5, { AudioVolume: 0.3 })
      ),
      parameters(
        dynamicParameter("HapticDecayTimeControl", 1, 0),
        dynamicParameter("HapticIntensityControl", 1, 2)
      )
    )
    expect(pattern).toEqual({
      Pattern: [
        {
          Event: {
            EventType: "HapticTransient",
            Time: 0,
            EventParameters: [
              { ParameterID: "HapticIntensity", ParameterValue: 0.5 },
              { ParameterID: "HapticSharpness", ParameterValue: 0.5 }
            ]
          }
        },
        {
          Event: {
            EventType: "HapticContinuous",
            Time: 0,
            EventDuration: 2,
            EventParameters: [
              { ParameterID: "HapticIntensity", ParameterValue: 0.5 },
              { ParameterID: "HapticSharpness", ParameterValue: 0.5 }
            ]
          }
        },
        {
          Event: {
            EventType: "AudioCustom",
            EventWaveformPath: "coins.caf",
            Time: 0.5,
            EventParameters: [
              { ParameterID: "AudioVolume", ParameterValue: 0.3 }
            ]
          }
        },
        {
          Parameter: {
            ParameterID: "HapticDecayTimeControl",
            Time: 0,
            ParameterValue: 1
          }
        },
        {
          Parameter: {
            ParameterID: "HapticIntensityControl",
            Time: 2,
            ParameterValue: 1
          }
        }
      ]
    })
  })
})
