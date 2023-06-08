import { useState } from "react"
import { Text, View } from "react-native"
import { TextField } from "./textField"

export const ChangePasswordScreen = () => {
  const [text, setText] = useState<string>()

  return (
    <View>
      <TextField placeholder="Current Password" title={"Current Password"} />

      <TextField placeholder="New Password" title={"New Password"} />

      <TextField
        placeholder="Re-enter New Password"
        title={"Re-Enter Password"}
      />

      <Text> Forgot your password? </Text>
    </View>
  )
}
