import { AppStyles } from "@lib/AppColorStyle"
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle
} from "react-native"

export type textFieldProps = {
  style?: StyleProp<ViewStyle>
} & TextInputProps

export const TextField = ({ style, ...props }: textFieldProps) => {
  return (
    <View style={styles.containerStyle}>
      <TextInput
        style={style}
        placeholderTextColor={AppStyles.colorOpacity35}
        placeholder={props.placeholder}
        secureTextEntry={props.secureTextEntry}
        onChangeText={props.onChangeText}
        onBlur={props.onBlur}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderColor: AppStyles.colorOpacity15,
    borderRadius: 8,
    borderWidth: 1,
    maxHeight: 50,
    marginBottom: 8
  }
})
