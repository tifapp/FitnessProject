import React from "react"
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle
} from "react-native"
import { Ionicon, IoniconName } from "../../../components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import { BodyText, Caption } from "@components/Text"

type Props = {
  iconName: IoniconName
  text: string
  errorMessage?: string
  style?: StyleProp<ViewStyle>
} & TextInputProps

const TextInputWithIcon = ({
  iconName,
  text,
  errorMessage,
  style,
  ...props
}: Props) => {
  return (
    <View>
      <View
        style={[
          styles.container,
          {
            borderColor: errorMessage
              ? AppStyles.errorColor
              : AppStyles.colorOpacity15
          },
          style
        ]}
      >
        <Ionicon
          name={iconName}
          style={[styles.icon]}
          color={errorMessage ? AppStyles.errorColor : AppStyles.darkColor}
        />
        <TextInput style={styles.input} {...props}>
          <BodyText>{text}</BodyText>
        </TextInput>
      </View>
      {errorMessage && (
        <Caption style={styles.errorText}>{errorMessage}</Caption>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    padding: 8
  },
  input: {
    flex: 1
  },
  icon: {
    paddingRight: 8
  },
  errorText: {
    color: AppStyles.errorColor,
    opacity: 1,
    paddingLeft: 16,
    paddingTop: 8
  }
})

export default TextInputWithIcon
