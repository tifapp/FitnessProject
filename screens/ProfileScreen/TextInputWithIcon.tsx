import { StyleProp, StyleSheet, TextInput, TextInputProps, View, ViewStyle } from "react-native"
import { Ionicon, IoniconName } from "../../components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import { BodyText } from "@components/Text"

type Props = {
  iconName: IoniconName
  text: string
  style?: StyleProp<ViewStyle>
} & TextInputProps

const TextInputWithIcon = ({iconName, text, style, ...props}: Props) => {

  return (
    <View style={[styles.container, style]}>
      <Ionicon name={iconName} style={styles.icon}/>
      <TextInput
        style={styles.input}
        {...props}
      >
        <BodyText>{text}</BodyText>
      </TextInput>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: "center",
    borderWidth: 1,
    borderColor: AppStyles.colorOpacity15,
    borderRadius: 12,
    padding: 8,

  },
  input: {
    flex: 1
  },
  icon: {
    paddingRight: 8
  }
})

export default TextInputWithIcon