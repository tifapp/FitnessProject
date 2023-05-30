import { StyleProp, StyleSheet, TextInput, View, ViewStyle } from "react-native"
import { Ionicon, IoniconName } from "../../components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import { BodyText } from "@components/Text"

interface Props {
  iconName: IoniconName
  text: string
  setText: React.Dispatch<React.SetStateAction<string>>
  style?: StyleProp<ViewStyle>
}

const TextInputWithIcon = ({iconName, text, setText, style}: Props) => {

  return (
    <View style={[styles.container, style]}>
      <Ionicon name={iconName} style={styles.icon}/>
      <TextInput
        style={styles.input}
        onChangeText={setText}
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