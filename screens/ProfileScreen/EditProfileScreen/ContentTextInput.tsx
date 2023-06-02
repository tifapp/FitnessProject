import React from "react"
import { ContentText } from "@components/ContentText"
import { AppStyles } from "@lib/AppColorStyle"
import {
  StyleSheet,
  TextInputProps,
  StyleProp,
  TextInput,
  View,
  ViewStyle
} from "react-native"

type Props = {
  text: string
  style?: StyleProp<ViewStyle>
} & TextInputProps

const ContentTextInput = ({ text, style, ...props }: Props) => {
  return (
    <View style={[styles.container, style]}>
      <TextInput style={styles.input} multiline {...props}>
        <ContentText
          text={text}
          onUserHandleTapped={(handle) => console.log(handle)}
        />
      </TextInput>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: AppStyles.colorOpacity15,
    borderRadius: 12,
    padding: 8
  },
  input: {
    flex: 1
  },
  icon: {
    paddingRight: 8
  }
})

export default ContentTextInput
