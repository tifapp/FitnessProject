import { ContentText } from "@components/ContentText"
import { AppStyles } from "@lib/AppColorStyle"
import { StyleSheet } from "react-native"
import { StyleProp, TextInput, View, ViewStyle } from "react-native"

interface Props {
  text: string
  setText: React.Dispatch<React.SetStateAction<string>>
  style?: StyleProp<ViewStyle>
}

const ContentTextInput = ({text, setText, style}: Props) => {

  return (
    <View style={[styles.container, style]}>
      <TextInput
        style={styles.input}
        multiline
        onChangeText={setText}
      >
        <ContentText text={text} onUserHandleTapped={(handle) => console.log(handle)} />
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

export default ContentTextInput