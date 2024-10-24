import { BodyText } from "@components/Text"
import { Ionicon } from "@components/common/Icons"
import { MenuView } from "@react-native-menu/menu"
import { ToStringable } from "TiFShared/lib/String"
import { StyleProp, ViewStyle, StyleSheet, View, Platform } from "react-native"

export type TiFFormMenuPickerOption<Value extends ToStringable> = {
  title: string
  value: Value
}

export type TiFFormMenuPickerProps<Value extends ToStringable> = {
  options: Readonly<Map<Value, { title: string }>>
  selectedOption: Value
  onOptionSelected: (value: Value) => void
  style?: StyleProp<ViewStyle>
}

export const TiFFormMenuPickerView = <Value extends ToStringable>({
  options,
  selectedOption,
  onOptionSelected,
  style
}: TiFFormMenuPickerProps<Value>) => (
  <View style={style}>
    <MenuView
      onPressAction={(e) => {
        const option = Array.from(options).find(
          ([value, _]) => e.nativeEvent.event === value.toString()
        )
        if (option) onOptionSelected(option[0])
      }}
      actions={Array.from(options).map(([value, label]) => ({
        title: label.title,
        id: value.toString(),
        image: selectedOption === value ? selectedIcon : undefined
      }))}
    >
      <View style={styles.row}>
        <BodyText style={styles.title}>
          {options.get(selectedOption)?.title}
        </BodyText>
        <Ionicon name="chevron-expand" style={styles.icon} />
      </View>
    </MenuView>
  </View>
)

const selectedIcon = Platform.select({
  ios: "checkmark",
  android: undefined
})

const styles = StyleSheet.create({
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  },
  title: {
    opacity: 0.5
  },
  icon: {
    opacity: 0.35
  }
})
