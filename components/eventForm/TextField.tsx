import { FontScaleFactors } from "../../lib/FontScale"
import React from "react"
import { StyleProp, TextInput, TextStyle } from "react-native"
import {
  EventFormTextFieldKey,
  useEventFormField,
  useSetEventFormActiveTextField
} from "./EventFormProvider"

export type EventFormTextFieldProps = {
  fieldName: EventFormTextFieldKey
  placeholder: string
  multiline?: boolean
  maxLength?: number
  style?: StyleProp<TextStyle>
}

/**
 * A text field that manages the focus state of an event form field that
 * can be placed into a text field.
 */
export const EventFormTextField = ({
  fieldName,
  ...props
}: EventFormTextFieldProps) => {
  const [value, setValue, valueRef] = useEventFormField(fieldName)
  const setActiveTextField = useSetEventFormActiveTextField()
  return (
    <TextInput
      maxFontSizeMultiplier={FontScaleFactors.xxxLarge}
      ref={valueRef}
      value={value}
      onChangeText={setValue}
      onFocus={() => setActiveTextField(fieldName)}
      {...props}
    />
  )
}
