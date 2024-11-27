import {
  HapticPatternElement,
  singleEventPattern,
  transientEvent,
  continuousSoundEvent,
  HapticDynamicParameterID,
  HapticEventParameterID
} from "@modules/tif-haptics"

/**
 * Returns a pattern that plays to the user when they change the parameters of an element.
 *
 * When the user changes parameters of the element, we want to give them immediate feedback on how
 * the new element sounds or feels. This function takes that edited event, and returns a single
 * event {@link HapticPattern} to play in order to give immediate feedback to the user. Events with
 * a specified duration are played as instantaneous or transient events.
 */
export const previewElementPattern = (
  element: HapticPatternElement & { keyFrameIndex?: number }
) => {
  if ("Event" in element) {
    const event = element.Event
    if (event.EventType === "AudioCustom") {
      return undefined
    } else if (
      event.EventType === "HapticContinuous" ||
      event.EventType === "HapticTransient"
    ) {
      return singleEventPattern({
        EventType: "HapticTransient",
        Time: 0,
        EventParameters: event.EventParameters
      })
    } else {
      return singleEventPattern({
        EventType: "AudioContinuous",
        Time: 0,
        EventDuration: 0.05,
        EventWaveformUseVolumeEnvelope: event.EventWaveformUseVolumeEnvelope,
        EventParameters: event.EventParameters
      })
    }
  } else if ("Parameter" in element) {
    const parameter = element.Parameter
    return parameterToPreviewPattern(
      parameter.ParameterID,
      parameter.ParameterValue
    )
  } else {
    if (element.keyFrameIndex === undefined) return undefined
    const keyFrame =
      element.ParameterCurve.ParameterCurveControlPoints[element.keyFrameIndex]
    return parameterToPreviewPattern(
      element.ParameterCurve.ParameterID,
      keyFrame.ParameterValue
    )
  }
}

const parameterToPreviewPattern = (
  id: HapticDynamicParameterID,
  value: number
) => {
  const regularParameterId = DYNAMIC_PARAMETER_TO_PARAMETERS[id]
  if (!regularParameterId) return undefined
  if (HAPTIC_DYNAMIC_PARAMETER_IDS.includes(id)) {
    return singleEventPattern(
      transientEvent(0, { HapticIntensity: 0.5, [regularParameterId]: value })
    )
  } else {
    return singleEventPattern(
      continuousSoundEvent(0, 0.05, {
        AudioVolume: 0.5,
        [regularParameterId]: value
      })
    )
  }
}

const DYNAMIC_PARAMETER_TO_PARAMETERS = {
  HapticIntensityControl: "HapticIntensity",
  HapticSharpnessControl: "HapticSharpness",
  HapticAttackTimeControl: "AttackTime",
  HapticDecayTimeControl: "DecayTime",
  HapticReleaseTimeControl: "ReleaseTime",
  AudioVolumeControl: "AudioVolume",
  AudioPanControl: "AudioPan",
  AudioBrightnessControl: "AudioBrightness",
  AudioPitchControl: "AudioPitch"
} as Record<string, HapticEventParameterID | undefined>

const HAPTIC_DYNAMIC_PARAMETER_IDS = [
  "HapticIntensityControl",
  "HapticSharpnessControl",
  "HapticAttackTimeControl",
  "HapticDecayTimeControl",
  "HapticReleaseTimeControl"
] as HapticDynamicParameterID[]
