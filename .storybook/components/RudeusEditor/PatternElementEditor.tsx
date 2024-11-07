import { PrimitiveAtom, useAtom } from "jotai"
import { StyleProp, View, ViewStyle, StyleSheet } from "react-native"
import { RudeusEditablePatternElement } from "./Models"
import { useState } from "react"
import {
  AnyHapticEvent,
  HapticAudioParameterID,
  HapticCurvableParameterID,
  HapticDynamicParameter,
  HapticDynamicParameterID,
  HapticEvent,
  HapticEventParameter,
  HapticFeedbackParameterID,
  HapticParameterCurve,
  HapticParameterCurveKeyFrame,
  HapticPatternElement,
  changeTime,
  continuousEvent,
  continuousSoundEvent,
  dynamicParameter,
  keyFrame,
  parameterCurve,
  soundEffectEvent,
  time,
  transientEvent,
  useHaptics
} from "@modules/tif-haptics"

export const ELEMENT_TYPES = {
  Parameter: {
    display: "Dynamic Parameter",
    new: (time: number) => ({
      Parameter: dynamicParameter("HapticIntensityControl", 0, time)
    })
  },
  ParameterCurve: {
    display: "Parameter Curve",
    new: (time: number) => {
      return {
        ParameterCurve: parameterCurve("HapticIntensityControl", time, [
          keyFrame(0, 0)
        ])
      }
    }
  },
  HapticTransient: {
    display: "Transient Haptic Event",
    new: (time: number) => ({ Event: transientEvent(time, {}) })
  },
  HapticContinuous: {
    display: "Continuous Haptic Event",
    new: (time: number) => ({ Event: continuousEvent(time, 0.1, {}) })
  },
  AudioCustom: {
    display: "Sound Effect Event",
    new: (time: number) => ({ Event: soundEffectEvent("test.wav", time, {}) })
  },
  AudioContinuous: {
    display: "Continuous Sound Event",
    new: (time: number) => ({ Event: continuousSoundEvent(time, 0.1, {}) })
  }
} as const

export type RudeusPatternElementEditorElementType = keyof typeof ELEMENT_TYPES

type EditableParameters<
  ID extends HapticAudioParameterID | HapticFeedbackParameterID
> = {
  eventParameterValue: (id: ID) => number
  eventParameterValueChanged: (id: ID, value: number) => void
}

type EditableDuration = {
  duration: number
  durationChanged: (duration: number) => void
}

type EditableVolumeEnvelope = {
  useWaveformVolumeEnvelope: boolean
  useWaveformVolumeEnvelopeChanged: (use: boolean) => void
}

export type UseRudeusPatternElementEditorElement = (
  | {
      type: "Parameter"
      parameter: HapticDynamicParameterID
      parameterChanged: (id: HapticDynamicParameterID) => void
      parameterValue: number
      parameterValueChanged: (value: number) => void
    }
  | {
      type: "ParameterCurve"
      parameter: HapticCurvableParameterID
      parameterChanged: (id: HapticCurvableParameterID) => void
      keyFrames: HapticParameterCurveKeyFrame[]
      keyFrameAdded: () => void
      keyFrameRemoved: (index: number) => void
      keyFrameChanged: (
        index: number,
        frame: HapticParameterCurveKeyFrame
      ) => void
    }
  | ({
      type: "AudioCustom"
      effectName: string
      effectNameChanged: (name: string) => void
    } & EditableVolumeEnvelope &
      EditableParameters<HapticAudioParameterID>)
  | ({ type: "AudioContinuous" } & EditableDuration &
      EditableVolumeEnvelope &
      EditableParameters<HapticAudioParameterID>)
  | ({
      type: "HapticTransient"
    } & EditableParameters<HapticFeedbackParameterID>)
  | ({ type: "HapticContinuous" } & EditableDuration &
      EditableParameters<HapticFeedbackParameterID>)
) & {
  time: number
  timeChanged: (newTime: number) => void
}

export const useRudeusPatternElementEditor = (
  elementAtom: PrimitiveAtom<RudeusEditablePatternElement>
) => {
  const haptics = useHaptics()
  const [{ isHidden, element }, setElement] = useAtom(elementAtom)
  const [isExpanded, setIsExpanded] = useState(true)
  return {
    isExpanded,
    expandToggled: () => setIsExpanded((e) => !e),
    isHidden,
    hiddenToggled: () => setElement((e) => ({ ...e, isHidden: !e.isHidden })),
    played: () => {
      haptics.play({ Pattern: [changeTime(element, 0)] })
    },
    element: editableElement(element, (element) => {
      setElement((e) => ({ ...e, element }))
    }) as UseRudeusPatternElementEditorElement,
    elementTypeChanged: (type: RudeusPatternElementEditorElementType) => {
      setElement((e) => ({
        ...e,
        element: ELEMENT_TYPES[type].new(time(element))
      }))
    }
  }
}

const editableElement = (
  element: HapticPatternElement,
  onChanged: (element: HapticPatternElement) => void
) => {
  const editableTime = {
    time: time(element),
    timeChanged: (newTime: number) => onChanged(changeTime(element, newTime))
  }
  if ("Event" in element) {
    return {
      ...editableTime,
      ...editableEvent(element.Event, (e) => {
        onChanged({ Event: e as HapticEvent })
      })
    }
  } else if ("Parameter" in element) {
    return {
      ...editableTime,
      ...editableParameter(element.Parameter, (p) => {
        onChanged({ Parameter: p })
      })
    }
  } else {
    return {
      ...editableTime,
      ...editableParameterCurve(element.ParameterCurve, (pc) => {
        onChanged({ ParameterCurve: pc })
      })
    }
  }
}

const editableEvent = (
  event: HapticEvent,
  onChanged: (event: AnyHapticEvent) => void
) => ({
  ...editableEventMetadata(event, onChanged),
  ...editableEventParameters(event, onChanged),
  type: event.EventType as RudeusPatternElementEditorElementType
})

const editableEventParameters = <E extends HapticEvent>(
  event: E,
  onChanged: (event: AnyHapticEvent) => void
) => ({
  eventParameterValue: (
    id: HapticFeedbackParameterID | HapticAudioParameterID
  ): number => {
    return (
      event.EventParameters.find((p) => p.ParameterID === id)?.ParameterValue ??
      0
    )
  },
  eventParameterValueChanged: (
    id: HapticFeedbackParameterID | HapticAudioParameterID,
    value: number
  ) => {
    const newParameter = { ParameterID: id, ParameterValue: value }
    const index = event.EventParameters.findIndex((p) => p.ParameterID === id)
    if (index === -1) {
      onChanged({
        ...event,
        EventParameters: [...event.EventParameters, newParameter]
      })
    } else {
      onChanged({
        ...event,
        EventParameters: event.EventParameters.with(index, newParameter as any)
      })
    }
  }
})

const editableEventMetadata = (
  event: HapticEvent,
  onChanged: (event: HapticEvent) => void
) => {
  if (event.EventType === "HapticTransient") {
    return {}
  } else if (event.EventType === "HapticContinuous") {
    return {
      duration: event.EventDuration,
      durationChanged: (value: number) => {
        onChanged({ ...event, EventDuration: value })
      }
    }
  } else if (event.EventType === "AudioCustom") {
    return {
      effectName: event.EventWaveformPath,
      effectNameChanged: (name: string) => {
        onChanged({ ...event, EventWaveformPath: name })
      },
      useVolumeEnvelope: event.EventWaveformUseVolumeEnvelope,
      useVolumeEnvelopeChanged: (value: boolean) => {
        onChanged({ ...event, EventWaveformUseVolumeEnvelope: value })
      }
    }
  } else {
    return {
      duration: event.EventDuration,
      durationChanged: (value: number) => {
        onChanged({ ...event, EventDuration: value })
      },
      useVolumeEnvelope: event.EventWaveformUseVolumeEnvelope,
      useVolumeEnvelopeChanged: (value: boolean) => {
        onChanged({ ...event, EventWaveformUseVolumeEnvelope: value })
      }
    }
  }
}

const editableParameter = (
  parameter: HapticDynamicParameter,
  onChanged: (parameter: HapticDynamicParameter) => void
) => ({
  type: "Parameter" as RudeusPatternElementEditorElementType,
  parameter: parameter.ParameterID,
  parameterChanged: (id: HapticDynamicParameterID) => {
    onChanged({ ...parameter, ParameterID: id })
  },
  parameterValue: parameter.ParameterValue,
  parameterValueChanged: (value: number) => {
    onChanged({ ...parameter, ParameterValue: value })
  }
})

const editableParameterCurve = (
  parameterCurve: HapticParameterCurve,
  onChanged: (parameterCurve: HapticParameterCurve) => void
) => ({
  type: "ParameterCurve" as RudeusPatternElementEditorElementType,
  parameter: parameterCurve.ParameterID,
  parameterChanged: (id: HapticCurvableParameterID) => {
    onChanged({ ...parameterCurve, ParameterID: id })
  },
  keyFrames: parameterCurve.ParameterCurveControlPoints,
  keyFrameAdded: () => {
    onChanged({
      ...parameterCurve,
      ParameterCurveControlPoints: [
        ...parameterCurve.ParameterCurveControlPoints,
        keyFrame(0, 0)
      ]
    })
  },
  keyFrameRemoved: (index: number) => {
    onChanged({
      ...parameterCurve,
      ParameterCurveControlPoints:
        parameterCurve.ParameterCurveControlPoints.filter((_, i) => i !== index)
    })
  },
  keyFrameChanged: (index: number, frame: HapticParameterCurveKeyFrame) => {
    onChanged({
      ...parameterCurve,
      ParameterCurveControlPoints:
        parameterCurve.ParameterCurveControlPoints.with(index, frame)
    })
  }
})

export type RudeusPatternElementEditorProps = {
  state: ReturnType<typeof useRudeusPatternElementEditor>
  onDeleteTapped: () => void
  style?: StyleProp<ViewStyle>
}

export const RudeusPatternElementEditorView = ({
  state,
  onDeleteTapped,
  style
}: RudeusPatternElementEditorProps) => {
  return <View style={style}></View>
}

const styles = StyleSheet.create({})
