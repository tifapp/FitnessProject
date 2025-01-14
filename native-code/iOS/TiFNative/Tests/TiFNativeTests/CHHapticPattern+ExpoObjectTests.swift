import Testing
import TiFNative
import CoreHaptics

@Suite("CHHapticPattern+ExpoObject tests")
struct CHHapticPatternExpoObjectTests {
  @Test("Initializes CHHapticPattern Without Throwing")
  func initializes() async throws {
    let expoObject = [
      "Pattern": [
        [
          "Event": [
            "EventType": "HapticTransient",
            "Time": 0,
            "EventParameters": [
              ["ParameterID": "HapticIntensity", "ParameterValue": 0.5],
              ["ParameterID": "HapticSharpness", "ParameterValue": 0.5]
            ]
          ]
        ],
        [
          "Event": [
            "EventType": "HapticContinuous",
            "Time": 0,
            "EventDuration": 2,
            "EventParameters": [
              ["ParameterID": "HapticIntensity", "ParameterValue": 0.5],
              ["ParameterID": "HapticSharpness", "ParameterValue": 0.5]
            ]
          ]
        ],
        [
          "ParameterCurve": [
            "ParameterID": "HapticIntensityControl",
            "Time": 0,
            "ParameterCurveControlPoints": [
              ["ParameterValue": 0, "Time": 0],
              ["ParameterValue": 1, "Time": 0.1],
              ["ParameterValue": 0.5, "Time": 2]
            ]
          ]
        ],
        [
          "ParameterCurve": [
            "ParameterID": "HapticAttackTimeControl",
            "Time": 2,
            "ParameterCurveControlPoints": [
              ["ParameterValue": 0, "Time": 0],
              ["ParameterValue": 1, "Time": 0.1],
              ["ParameterValue": 0.5, "Time": 2]
            ]
          ]
        ]
      ]
    ]
    #expect(throws: Never.self) { try CHHapticPattern(expoObject: expoObject) }
  }
}
