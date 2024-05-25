import { StyleSheet, StyleProp, ViewStyle, View } from "react-native"
import { SettingsButton } from "./Button"
import { Headline } from "@components/Text"
import { Ionicon } from "@components/common/Icons"

export type SettingsChecklistPickerOption<Value> = {
  title: string
  value: Value
}

export type SettingsChecklistPickerProps<Value> = {
  options: Readonly<SettingsChecklistPickerOption<Value>[]>
  selectedOptions: Value[]
  onOptionSelected: (value: Value) => void
  style?: StyleProp<ViewStyle>
}

export const SettingsChecklistPickerView = <Option,>({
  options,
  selectedOptions,
  onOptionSelected,
  style
}: SettingsChecklistPickerProps<Option>) => (
  <View style={style}>
    {options.map((option) => (
      <SettingsButton
        key={option.value}
        onTapped={() => onOptionSelected(option.value)}
      >
        <View style={styles.optionRow}>
          <Headline>{option.title}</Headline>
          <Ionicon
            name="checkmark-sharp"
            style={{ opacity: selectedOptions.includes(option.value) ? 1 : 0 }}
          />
        </View>
      </SettingsButton>
    ))}
  </View>
)

const styles = StyleSheet.create({
  optionRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  }
})
