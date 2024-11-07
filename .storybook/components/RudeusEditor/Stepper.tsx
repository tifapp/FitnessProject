import React, { useState, useEffect } from "react"
import { useEffectEvent } from "@lib/utils/UseEffectEvent"
import { StyleProp, ViewStyle, StyleSheet, View } from "react-native"
import { Slider } from "react-native-elements"
import { TiFFormRowItemView } from "@components/form-components/RowItem"
import { TextField } from "@components/TextFields"
import { TouchableIonicon } from "@components/common/Icons"

export type UseRudeusStepperProps = {
  value: number
  onValueChanged: (value: number) => void
  minimumValue?: number
  maximumValue?: number
}

export type StepKind = "inc" | "dec"

const STEP_KIND_INCREMENT = { inc: 0.01, dec: -0.01 }

const canStep = (
  value: number,
  maximumValue: number,
  minimumValue: number,
  kind: StepKind
) => {
  const nextValue = value + STEP_KIND_INCREMENT[kind]
  return kind === "inc" ? nextValue < maximumValue : nextValue > minimumValue
}

export const useRudeusStepper = ({
  value,
  onValueChanged,
  minimumValue = 0,
  maximumValue = Infinity
}: UseRudeusStepperProps) => {
  const [text, setText] = useState("")
  const [stepKind, setStepKind] = useState<StepKind | undefined>()
  const increment = useEffectEvent((amount: number) => {
    onValueChanged(value + amount)
  })
  useEffect(() => setText(value.toFixed(2)), [value])
  useEffect(() => {
    if (!stepKind) return
    const interval = setInterval(() => {
      if (canStep(value, maximumValue, minimumValue, stepKind)) {
        increment(STEP_KIND_INCREMENT[stepKind])
      } else {
        clearInterval(interval)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [stepKind, increment])
  return {
    text,
    numberEntered: (text: string) => {
      setText(text)
      const number = parseFloat(text)
      if (Number.isNaN(number)) return
      onValueChanged(number)
    },
    steppingBegan: (kind: StepKind) => {
      increment(STEP_KIND_INCREMENT[kind])
      setStepKind(kind)
    },
    steppingEnded: () => setStepKind(undefined),
    canStep: (kind: StepKind) => {
      return canStep(value, maximumValue, minimumValue, kind)
    }
  }
}

export type RudeusStepperProps = {
  title: string
  includeSlider?: boolean
  style?: StyleProp<ViewStyle>
} & UseRudeusStepperProps

export const RudeusStepperView = ({
  title,
  includeSlider,
  style,
  ...props
}: RudeusStepperProps) => {
  const state = useRudeusStepper(props)
  return (
    <View style={style}>
      <TiFFormRowItemView title={title} rowStyle={styles.formRow}>
        <View style={styles.stepperRow}>
          <TextField
            value={state.text}
            onChangeText={state.numberEntered}
            style={styles.stepperField}
            keyboardType="numeric"
          />
          <View style={styles.stepperButtonsRow}>
            <TouchableIonicon
              icon={{ name: "add" }}
              disabled={!state.canStep("inc")}
              onPressIn={() => state.steppingBegan("inc")}
              onPressOut={state.steppingEnded}
            />
            <TouchableIonicon
              icon={{ name: "remove" }}
              disabled={!state.canStep("dec")}
              onPressIn={() => state.steppingBegan("dec")}
              onPressOut={state.steppingEnded}
            />
          </View>
        </View>
      </TiFFormRowItemView>
      {includeSlider && (
        <Slider
          value={props.value}
          onValueChange={props.onValueChanged}
          maximumValue={props.maximumValue}
          minimumValue={props.minimumValue}
          step={0.01}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  stepper: {
    flex: 1
  },
  stepperField: {
    minWidth: 80
  },
  stepperRow: {
    display: "flex",
    flexDirection: "row",
    columnGap: 16,
    alignItems: "center",
    flex: 1
  },
  stepperButtonsRow: {
    display: "flex",
    flexDirection: "row",
    flex: 1,
    columnGap: 16,
    alignItems: "center",
    justifyContent: "flex-start"
  },
  formRow: {
    padding: 0
  }
})
