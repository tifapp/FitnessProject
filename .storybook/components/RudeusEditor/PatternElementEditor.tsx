import { PrimitiveAtom, useAtom } from "jotai"
import { StyleProp, View, ViewStyle, StyleSheet } from "react-native"
import { RudeusEditablePatternElement } from "./Models"
import { Fragment, useState } from "react"
import {
  AUDIO_PARAMETER_IDS,
  AnyHapticEvent,
  FEEDBACK_PARAMETER_IDS,
  HAPTIC_DYNAMIC_PARAMETER_IDS,
  HapticAudioParameterID,
  HapticCurvableParameterID,
  HapticDynamicParameter,
  HapticDynamicParameterID,
  HapticEvent,
  HapticEventParameterID,
  HapticFeedbackParameterID,
  HapticParameterCurve,
  HapticParameterCurveKeyFrame,
  HapticPattern,
  HapticPatternElement,
  changeTime,
  continuousEvent,
  continuousSoundEvent,
  dynamicParameter,
  events,
  hapticPattern,
  keyFrame,
  parameterCurve,
  parametersRecord,
  singleEventPattern,
  soundEffectEvent,
  time,
  transientEvent,
  useHaptics
} from "@modules/tif-haptics"
import { TiFFormCardView } from "@components/form-components/Card"
import { TiFFormMenuPickerView } from "@components/form-components/MenuPicker"
import { TouchableIonicon } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import Animated, { FadeIn, FadeOut } from "react-native-reanimated"
import { TiFFormRowItemView } from "@components/form-components/RowItem"
import { Divider } from "react-native-elements"
import { RudeusStepperView } from "./Stepper"
import { Switch } from "react-native"
import { BUNDLED_SOUND_EFFECT_NAMES, SoundEffectName } from "@lib/SoundEffect"

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
      return singleEventPattern(
        transientEvent(0, parametersRecord(event.EventParameters))
      )
    } else {
      return singleEventPattern(
        continuousSoundEvent(0, 0.05, parametersRecord(event.EventParameters), {
          EventWaveformUseVolumeEnvelope: event.EventWaveformUseVolumeEnvelope
        })
      )
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
    new: (time: number) => ({
      Event: soundEffectEvent(BUNDLED_SOUND_EFFECT_NAMES[0], time, {})
    })
  },
  AudioContinuous: {
    display: "Continuous Sound Event",
    new: (time: number) => ({ Event: continuousSoundEvent(time, 0.1, {}) })
  }
} as const

export type RudeusPatternElementEditorElementType = keyof typeof ELEMENT_TYPES

type EditableEventParameters<
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
      effectName: SoundEffectName
      effectNameChanged: (name: SoundEffectName) => void
    } & EditableVolumeEnvelope &
      EditableEventParameters<HapticAudioParameterID>)
  | ({ type: "AudioContinuous" } & EditableDuration &
      EditableVolumeEnvelope &
      EditableEventParameters<HapticAudioParameterID>)
  | ({
      type: "HapticTransient"
    } & EditableEventParameters<HapticFeedbackParameterID>)
  | ({ type: "HapticContinuous" } & EditableDuration &
      EditableEventParameters<HapticFeedbackParameterID>)
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
    element: editableElement(element, (element, previewPattern) => {
      if (previewPattern) haptics.play(previewPattern)
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
  onChanged: (
    element: HapticPatternElement,
    previewPattern?: HapticPattern
  ) => void
) => {
  const editableTime = {
    time: time(element),
    timeChanged: (newTime: number) => {
      onChanged(changeTime(element, Number(newTime.toFixed(2))))
    }
  }
  if ("Event" in element) {
    return {
      ...editableTime,
      ...editableEvent(element.Event, (e, previewPattern) => {
        onChanged({ Event: e as HapticEvent }, previewPattern)
      })
    }
  } else if ("Parameter" in element) {
    return {
      ...editableTime,
      ...editableParameter(element.Parameter, (p) => {
        const element = { Parameter: p }
        onChanged(element, previewElementPattern(element))
      })
    }
  } else {
    return {
      ...editableTime,
      ...editableParameterCurve(element.ParameterCurve, (pc, keyFrameIndex) => {
        const element = { ParameterCurve: pc }
        onChanged(element, previewElementPattern({ ...element, keyFrameIndex }))
      })
    }
  }
}

const editableEvent = (
  event: HapticEvent,
  onChanged: (event: AnyHapticEvent, previewPattern?: HapticPattern) => void
) => ({
  ...editableEventMetadata(event, onChanged),
  ...editableEventParameters(event, (event) => {
    onChanged(event, previewElementPattern({ Event: event as HapticEvent }))
  }),
  type: event.EventType as RudeusPatternElementEditorElementType
})

const editableEventParameters = <E extends HapticEvent>(
  event: E,
  onChanged: (event: AnyHapticEvent) => void
) => ({
  eventParameterValue: (
    id: HapticFeedbackParameterID | HapticAudioParameterID
  ): number => {
    const defaultValue = EVENT_PARAMETER_INFO[id].defaultValue ?? 0
    return (
      event.EventParameters.find((p) => p.ParameterID === id)?.ParameterValue ??
      defaultValue
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
      effectNameChanged: (name: SoundEffectName) => {
        onChanged({ ...event, EventWaveformPath: name })
      },
      useVolumeEnvelope: event.EventWaveformUseVolumeEnvelope ?? false,
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
      useVolumeEnvelope: event.EventWaveformUseVolumeEnvelope ?? false,
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
  onChanged: (
    parameterCurve: HapticParameterCurve,
    keyFrameIndex?: number
  ) => void
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
    onChanged(
      {
        ...parameterCurve,
        ParameterCurveControlPoints:
          parameterCurve.ParameterCurveControlPoints.with(index, frame)
      },
      index
    )
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
}: RudeusPatternElementEditorProps) => (
  <View style={style}>
    <TiFFormCardView>
      <View style={styles.container}>
        <View style={styles.topRow}>
          <TiFFormMenuPickerView
            options={ELEMENT_TYPE_OPTIONS}
            selectedOption={state.element.type}
            onOptionSelected={state.elementTypeChanged}
          />
        </View>
        <RudeusStepperView
          title="Time"
          value={state.element.time}
          onValueChanged={state.element.timeChanged}
          style={styles.stepper}
        />
        <Divider />
        <View style={styles.iconRow}>
          <TouchableIonicon
            icon={{ name: state.isHidden ? "eye-off" : "eye" }}
            onPress={state.hiddenToggled}
          />
          <TouchableIonicon icon={{ name: "play" }} onPress={state.played} />
          <TouchableIonicon
            icon={{ name: "trash", color: AppStyles.red.toString() }}
            onPress={onDeleteTapped}
          />
          <TouchableIonicon
            icon={{
              name: state.isExpanded ? "chevron-down" : "chevron-forward"
            }}
            onPress={state.expandToggled}
          />
        </View>
        {state.isExpanded && (
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            style={styles.controls}
          >
            {state.element.type === "HapticTransient" && (
              <EventParameterControlView
                element={state.element}
                ids={TRANSIENT_PARAMETER_IDS}
              />
            )}
            {state.element.type === "HapticContinuous" && (
              <>
                <RudeusStepperView
                  title="Duration"
                  value={state.element.duration}
                  onValueChanged={state.element.durationChanged}
                />
                <EventParameterControlView
                  element={state.element}
                  ids={FEEDBACK_PARAMETER_IDS}
                />
              </>
            )}
            {state.element.type === "AudioCustom" && (
              <>
                <SoundEffectPickerView
                  name={state.element.effectName}
                  onNameChanged={state.element.effectNameChanged}
                />
                <EventParameterToggleView
                  title="Use Volume Envelope"
                  value={state.element.useWaveformVolumeEnvelope}
                  onValueChanged={
                    state.element.useWaveformVolumeEnvelopeChanged
                  }
                />
                <EventParameterControlView
                  element={state.element}
                  ids={AUDIO_PARAMETER_IDS}
                />
              </>
            )}
            {state.element.type === "AudioContinuous" && (
              <>
                <RudeusStepperView
                  title="Duration"
                  value={state.element.duration}
                  onValueChanged={state.element.durationChanged}
                />
                <EventParameterToggleView
                  title="Use Volume Envelope"
                  value={state.element.useWaveformVolumeEnvelope}
                  onValueChanged={
                    state.element.useWaveformVolumeEnvelopeChanged
                  }
                />
                <EventParameterControlView
                  element={state.element}
                  ids={AUDIO_PARAMETER_IDS}
                />
              </>
            )}
          </Animated.View>
        )}
      </View>
    </TiFFormCardView>
  </View>
)

type SoundEffectPickerProps = {
  name: SoundEffectName
  onNameChanged: (name: SoundEffectName) => void
  style?: StyleProp<ViewStyle>
}

const SoundEffectPickerView = ({
  name,
  onNameChanged,
  style
}: SoundEffectPickerProps) => (
  <TiFFormRowItemView
    title="Sound Name"
    style={style}
    rowStyle={styles.formRow}
  >
    <TiFFormMenuPickerView
      options={SOUND_EFFECT_MENU_OPTIONS}
      selectedOption={name}
      onOptionSelected={onNameChanged}
    />
  </TiFFormRowItemView>
)

const SOUND_EFFECT_MENU_OPTIONS = new Map(
  BUNDLED_SOUND_EFFECT_NAMES.map((name) => [name, { title: name }])
)

type EditableEvent = Extract<
  UseRudeusPatternElementEditorElement,
  {
    type:
      | "HapticTransient"
      | "HapticContinuous"
      | "AudioCustom"
      | "AudioContinuous"
  }
>

type EventParameterControlProps<E extends EditableEvent> = {
  element: E
  ids: Parameters<E["eventParameterValue"]>[0] extends HapticFeedbackParameterID
    ? typeof FEEDBACK_PARAMETER_IDS | typeof TRANSIENT_PARAMETER_IDS
    : typeof AUDIO_PARAMETER_IDS
}

const EventParameterControlView = <E extends EditableEvent>({
  element,
  ids
}: EventParameterControlProps<E>) => (
  <>
    {ids.map((id) => {
      const info = EVENT_PARAMETER_INFO[id]
      const _id = id as never // TODO: - Fix TS
      return (
        <Fragment key={id}>
          {info.type === "toggle" ? (
            <EventParameterToggleView
              title={info.title}
              value={element.eventParameterValue(_id) === 1}
              onValueChanged={(value) => {
                element.eventParameterValueChanged(_id, value ? 1 : 0)
              }}
            />
          ) : (
            <RudeusStepperView
              key={id}
              title={info.title}
              value={element.eventParameterValue(_id)}
              onValueChanged={(value) => {
                element.eventParameterValueChanged(_id, value)
              }}
              maximumValue={info.max}
              minimumValue={info.min}
              includeSlider={info.max !== Infinity}
            />
          )}
        </Fragment>
      )
    })}
  </>
)

type EventParameterToggleProps = {
  title: string
  value: boolean
  onValueChanged: (value: boolean) => void
}

const EventParameterToggleView = ({
  title,
  value,
  onValueChanged
}: EventParameterToggleProps) => (
  <TiFFormRowItemView title={title} rowStyle={styles.formRow}>
    <Switch value={value} onValueChange={onValueChanged} />
  </TiFFormRowItemView>
)

const TRANSIENT_PARAMETER_IDS = ["HapticIntensity", "HapticSharpness"] as const

type EventParameterInfo = (
  | {
      type: "toggle"
    }
  | { type: "stepper"; min: number; max: number }
) & {
  title: string
  defaultValue?: number
}

const EVENT_PARAMETER_INFO = {
  HapticIntensity: {
    type: "stepper",
    title: "Haptic Intensity",
    min: 0,
    max: 1
  },
  HapticSharpness: {
    type: "stepper",
    title: "Haptic Sharpness",
    min: 0,
    max: 1
  },
  AttackTime: { type: "stepper", title: "Attack Time", min: -1, max: 1 },
  DecayTime: { type: "stepper", title: "Decay Time", min: -1, max: 1 },
  ReleaseTime: {
    type: "stepper",
    title: "Release Time",
    min: 0,
    max: Infinity
  },
  Sustained: { type: "toggle", title: "Sustained" },
  AudioVolume: {
    type: "stepper",
    title: "Volume",
    min: 0,
    max: 1,
    defaultValue: 1
  },
  AudioPitch: { type: "stepper", title: "Pitch", min: -1, max: 1 },
  AudioPan: { type: "stepper", title: "Pan", min: -1, max: 1 },
  AudioBrightness: { type: "stepper", title: "Brightness", min: 0, max: 1 },
  HapticIntensityControl: {
    type: "stepper",
    title: "Haptic Intensity",
    min: 0,
    max: 1
  },
  HapticSharpnessControl: {
    type: "stepper",
    title: "Haptic Sharpness",
    min: 0,
    max: 1
  },
  AudioVolumeControl: { type: "stepper", title: "Volume", min: 0, max: 1 },
  AudioPitchControl: { type: "stepper", title: "Pitch", min: -1, max: 1 },
  AudioPanControl: { type: "stepper", title: "Pan", min: -1, max: 1 },
  AudioBrightnessControl: {
    type: "stepper",
    title: "Brightness",
    min: 0,
    max: 1
  },
  HapticAttackTimeControl: {
    type: "stepper",
    title: "Haptic Attack Time",
    min: -1,
    max: 1
  },
  HapticDecayTimeControl: {
    type: "stepper",
    title: "Haptic Decay Time",
    min: -1,
    max: 1
  },
  HapticReleaseTimeControl: {
    type: "stepper",
    title: "Haptic Release Time",
    min: 0,
    max: Infinity
  },
  AudioAttackTimeControl: {
    type: "stepper",
    title: "Audio Attack Time",
    min: -1,
    max: 1
  },
  AudioDecayTimeControl: {
    type: "stepper",
    title: "Audio Decay Time",
    min: -1,
    max: 1
  },
  AudioReleaseTimeControl: {
    type: "stepper",
    title: "Audio Release Time",
    min: 0,
    max: Infinity
  }
} as Record<string, EventParameterInfo>

const ELEMENT_TYPE_OPTIONS = new Map<
  RudeusPatternElementEditorElementType,
  { title: string }
>(
  Object.entries(ELEMENT_TYPES).map(([key, value]) => [
    key as RudeusPatternElementEditorElementType,
    { title: value.display }
  ])
)

const styles = StyleSheet.create({
  container: {
    padding: 16,
    rowGap: 16
  },
  controls: {
    rowGap: 16
  },
  topRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start"
  },
  iconRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    columnGap: 8
  },
  stepper: {
    flex: 1
  },
  formRow: {
    padding: 0
  }
})
