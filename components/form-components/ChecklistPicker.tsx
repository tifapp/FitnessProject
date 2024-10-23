import { StyleSheet, StyleProp, ViewStyle, View } from "react-native"
import { TiFFormRowButton } from "./Button"
import { Headline } from "@components/Text"
import { Ionicon } from "@components/common/Icons"

export type TiFFormChecklistPickerOption<Value> = {
  title: string
  value: Value
}

export type TiFFormChecklistPickerProps<Value> = {
  options: Readonly<TiFFormChecklistPickerOption<Value>[]>
  selectedOptions: Value[]
  onOptionSelected: (value: Value) => void
  style?: StyleProp<ViewStyle>
}

export const TiFFormChecklistPickerView = <Option,>({
  options,
  selectedOptions,
  onOptionSelected,
  style
}: TiFFormChecklistPickerProps<Option>) => (
  <View style={style}>
    {options.map((option) => (
      <TiFFormRowButton
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
      </TiFFormRowButton>
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
