import { act, renderHook } from "@testing-library/react-native"
import { RudeusEditablePatternElement } from "./Models"
import {
  transientEvent,
  continuousEvent,
  dynamicParameter,
  soundEffectEvent,
  continuousSoundEvent,
  parameterCurve,
  hapticPattern,
  parameters,
  keyFrame,
  events,
  singleEventPattern,
  HapticsProvider
} from "@modules/tif-haptics"
import {
  ELEMENT_TYPES,
  RudeusPatternElementEditorElementType,
  previewElementPattern,
  useRudeusPatternElementEditor
} from "./PatternElementEditor"
import { TestHaptics } from "@test-helpers/Haptics"
import { atom } from "jotai"

describe("RudeusPatternElementEditor tests", () => {
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

  describe("UseRudeusPatternElementEditor tests", () => {
    let haptics = new TestHaptics()
    beforeEach(() => haptics.reset())

    it.each([
      [
        { isHidden: false, element: { Event: transientEvent(0, {}) } },
        "HapticTransient" as const
      ],
      [
        {
          isHidden: false,
          element: {
            Parameter: dynamicParameter("HapticIntensityControl", 0, 0)
          }
        },
        "Parameter" as const
      ],
      [
        {
          isHidden: false,
          element: {
            ParameterCurve: parameterCurve("HapticIntensityControl", 0, [])
          }
        },
        "ParameterCurve" as const
      ]
    ])(
      "should display %s as the event type",
      (
        element: RudeusEditablePatternElement,
        type: RudeusPatternElementEditorElementType
      ) => {
        const { result } = renderUseRudeusPatternElementEditor(element)
        expect(result.current.element.type).toEqual(type)
      }
    )

    it("should be able to toggle the hidden status", () => {
      const element = {
        isHidden: false,
        element: { Event: transientEvent(0, {}) }
      }
      const { result } = renderUseRudeusPatternElementEditor(element)
      expect(result.current.isHidden).toEqual(false)
      act(() => result.current.hiddenToggled())
      expect(result.current.isHidden).toEqual(true)
      act(() => result.current.hiddenToggled())
      expect(result.current.isHidden).toEqual(false)
    })

    it("should be able to toggle the expansion status", () => {
      const element = {
        isHidden: false,
        element: { Event: transientEvent(0, {}) }
      }
      const { result } = renderUseRudeusPatternElementEditor(element)
      expect(result.current.isExpanded).toEqual(true)
      act(() => result.current.expandToggled())
      expect(result.current.isExpanded).toEqual(false)
      act(() => result.current.expandToggled())
      expect(result.current.isExpanded).toEqual(true)
    })

    it.each([
      { isHidden: false, element: { Event: transientEvent(0, {}) } },
      {
        isHidden: false,
        element: {
          Parameter: dynamicParameter("HapticIntensityControl", 0, 0)
        }
      },
      {
        isHidden: false,
        element: {
          ParameterCurve: parameterCurve("HapticIntensityControl", 0, [])
        }
      }
    ])("should be able to edit the time of %s", (element) => {
      const { result } = renderUseRudeusPatternElementEditor(element)
      expect(result.current.element.time).toEqual(0)
      act(() => result.current.element.timeChanged(0.5))
      expect(result.current.element.time).toEqual(0.5)
    })

    it("should be able to edit and play a haptic transient event", () => {
      const element = {
        isHidden: false,
        element: { Event: transientEvent(0, {}) }
      }
      const { result } = renderUseRudeusPatternElementEditor(element)
      act(() => {
        ;(result.current.element as any).eventParameterValueChanged(
          "HapticIntensity",
          0.56
        )
      })
      act(() => {
        ;(result.current.element as any).eventParameterValueChanged(
          "HapticSharpness",
          0.36
        )
      })
      haptics.reset()
      act(() => result.current.played())
      expect(haptics.playedEvents).toEqual([
        hapticPattern(
          events(
            transientEvent(0, { HapticIntensity: 0.56, HapticSharpness: 0.36 })
          )
        )
      ])
    })

    it("should be able to edit and play a haptic continuous event", () => {
      const element = {
        isHidden: false,
        element: { Event: continuousEvent(0, 0, {}) }
      }
      const { result } = renderUseRudeusPatternElementEditor(element)
      act(() => {
        ;(result.current.element as any).eventParameterValueChanged(
          "HapticIntensity",
          0.56
        )
      })
      act(() => (result.current.element as any).durationChanged(2.0))
      haptics.reset()
      act(() => result.current.played())
      expect(haptics.playedEvents).toEqual([
        hapticPattern(
          events(continuousEvent(0, 2.0, { HapticIntensity: 0.56 }))
        )
      ])
    })

    it("should be able to edit and play a sound effect event", () => {
      const element = {
        isHidden: false,
        element: { Event: soundEffectEvent("unknown.caf", 0, {}) }
      }
      const { result } = renderUseRudeusPatternElementEditor(element)
      act(() => (result.current.element as any).effectNameChanged("test.caf"))
      act(() => {
        ;(result.current.element as any).eventParameterValueChanged(
          "AudioVolume",
          0.56
        )
      })
      act(() => {
        ;(result.current.element as any).eventParameterValueChanged(
          "AudioVolume",
          0.68
        )
      })
      haptics.reset()
      act(() => result.current.played())
      expect(haptics.playedEvents).toEqual([
        hapticPattern(
          events(soundEffectEvent("test.caf", 0, { AudioVolume: 0.68 }))
        )
      ])
    })

    it("should be able to edit and play a continuous sound event", () => {
      const element = {
        isHidden: false,
        element: { Event: continuousSoundEvent(0, 0, {}) }
      }
      const { result } = renderUseRudeusPatternElementEditor(element)
      act(() => (result.current.element as any).durationChanged(0.75))
      act(() => {
        ;(result.current.element as any).eventParameterValueChanged(
          "AudioVolume",
          0.56
        )
      })
      act(() => (result.current.element as any).useVolumeEnvelopeChanged(true))
      haptics.reset()
      act(() => result.current.played())
      expect(haptics.playedEvents).toEqual([
        hapticPattern(
          events(
            continuousSoundEvent(
              0,
              0.75,
              { AudioVolume: 0.56 },
              { EventWaveformUseVolumeEnvelope: true }
            )
          )
        )
      ])
    })

    it("should be able to edit and play a dynamic parameter", () => {
      const element = {
        isHidden: false,
        element: { Parameter: dynamicParameter("HapticIntensityControl", 0, 0) }
      }
      const { result } = renderUseRudeusPatternElementEditor(element)
      act(() => {
        ;(result.current.element as any).parameterChanged(
          "HapticSharpnessControl"
        )
      })
      act(() => (result.current.element as any).parameterValueChanged(0.56))
      haptics.reset()
      act(() => result.current.played())
      expect(haptics.playedEvents).toEqual([
        hapticPattern(
          events(),
          parameters(dynamicParameter("HapticSharpnessControl", 0.56, 0))
        )
      ])
    })

    it("should be able to edit and play a parameter curve", () => {
      const element = {
        isHidden: false,
        element: {
          ParameterCurve: parameterCurve("HapticIntensityControl", 0, [])
        }
      }
      const { result } = renderUseRudeusPatternElementEditor(element)
      act(() => {
        ;(result.current.element as any).parameterChanged(
          "HapticSharpnessControl"
        )
      })
      act(() => {
        ;(result.current.element as any).keyFrameAdded()
      })
      act(() => {
        ;(result.current.element as any).keyFrameAdded()
      })
      act(() => {
        ;(result.current.element as any).keyFrameChanged(0, keyFrame(0.1, 2.3))
      })
      act(() => {
        ;(result.current.element as any).keyFrameRemoved(1)
      })
      haptics.reset()
      act(() => result.current.played())
      expect(haptics.playedEvents).toEqual([
        hapticPattern(
          events(),
          parameters(
            parameterCurve("HapticSharpnessControl", 0, [keyFrame(0.1, 2.3)])
          )
        )
      ])
    })

    it("should be able to retrieve parameter values for an element", () => {
      const element = {
        isHidden: false,
        element: { Event: transientEvent(0, {}) }
      }
      const { result } = renderUseRudeusPatternElementEditor(element)
      expect(
        (result.current.element as any).eventParameterValue("HapticIntensity")
      ).toEqual(0)
      act(() => {
        ;(result.current.element as any).eventParameterValueChanged(
          "HapticIntensity",
          0.56
        )
      })
      expect(
        (result.current.element as any).eventParameterValue("HapticIntensity")
      ).toEqual(0.56)
    })

    it("should set the time to 0 when playing an element", () => {
      const element = {
        isHidden: false,
        element: { Event: transientEvent(0, {}) }
      }
      const { result } = renderUseRudeusPatternElementEditor(element)
      act(() => result.current.element.timeChanged(0.5))
      act(() => result.current.played())
      expect(haptics.playedEvents).toEqual([{ Pattern: [element.element] }])
    })

    it("should play a preview pattern when the element properties change", () => {
      const element = {
        isHidden: false,
        element: { Event: transientEvent(0, {}) }
      }
      const { result } = renderUseRudeusPatternElementEditor(element)
      act(() => {
        ;(result.current.element as any).eventParameterValueChanged(
          "HapticIntensity",
          1
        )
      })
      expect(haptics.playedEvents).toEqual([
        singleEventPattern(transientEvent(0, { HapticIntensity: 1 }))
      ])
    })

    it("should play a preview pattern when a key frame of a parameter curve changes", () => {
      const element = {
        isHidden: false,
        element: {
          ParameterCurve: parameterCurve("HapticSharpnessControl", 0, [])
        }
      }
      const { result } = renderUseRudeusPatternElementEditor(element)
      act(() => {
        ;(result.current.element as any).keyFrameAdded()
      })
      act(() => {
        ;(result.current.element as any).keyFrameChanged(0, keyFrame(0.1, 2.3))
      })
      expect(haptics.playedEvents).toEqual([
        singleEventPattern(
          transientEvent(0, { HapticIntensity: 0.5, HapticSharpness: 0.1 })
        )
      ])
    })

    it("should be able to change the element type", () => {
      const element = {
        isHidden: false,
        element: { Event: transientEvent(0, {}) }
      }
      const { result } = renderUseRudeusPatternElementEditor(element)
      const expectEventType = (type: RudeusPatternElementEditorElementType) => {
        expect(result.current.element).toMatchObject({ time: 0.5, type })
      }

      act(() => result.current.element.timeChanged(0.5))
      Object.keys(ELEMENT_TYPES).forEach((type) => {
        const t = type as RudeusPatternElementEditorElementType
        act(() => result.current.elementTypeChanged(t))
        expectEventType(t)
      })
    })

    const renderUseRudeusPatternElementEditor = (
      element: RudeusEditablePatternElement
    ) => {
      const state = atom(element)
      return renderHook(() => useRudeusPatternElementEditor(state), {
        wrapper: ({ children }) => (
          <HapticsProvider haptics={haptics}>{children}</HapticsProvider>
        )
      })
    }
  })
})
