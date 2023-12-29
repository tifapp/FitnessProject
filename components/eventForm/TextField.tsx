import CustomizableTextInput from "@components/common/CustomizableTextInput.tsx"
import React from "react"
import { StyleProp, TextStyle } from "react-native"
import { FontScaleFactors } from "../../lib/Fonts"
import { useEventFormContext, useEventFormField } from "./EventForm"
import { EventFormValues } from "./EventFormValues"

export type EventFormTextFieldProps = {
  fieldName: NonNullable<
    {
      [I in keyof EventFormValues]: EventFormValues[I] extends string
        ? I
        : never
    }[keyof EventFormValues]
  >
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
  const [value, setValue] = useEventFormField(fieldName)
  const { setFocusedField } = useEventFormContext()
  return (
    <CustomizableTextInput
      maxFontSizeMultiplier={FontScaleFactors.xxxLarge}
      value={value}
      onChangeText={setValue}
      onFocus={() => setFocusedField(fieldName)}
      {...props}
    />
  )
}
