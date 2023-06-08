import { FontScaleFactors } from "@hooks/Fonts"
import { StyleProp, StyleSheet, TextInput, View, ViewStyle } from "react-native"

export type textFieldProps = {
  style?: StyleProp<ViewStyle>
  value?: string | undefined
  onChangeText?: ((text: string) => void) | undefined
  title: string
  placeholder: string
}

export const TextField = ({ style, ...props }: textFieldProps) => {
  return (
    <View style={styles.containerStyle}>
      <TextInput
        maxFontSizeMultiplier={FontScaleFactors.xxxLarge}
        placeholder="Current Password"
        secureTextEntry={true}
        style={style}
        value={props.value}
        onChangeText={props.onChangeText}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  containerStyle: {
    height: 40,
    flex: 1,
    flexDirection: "row",
    alignItems: "center"
  }
})
