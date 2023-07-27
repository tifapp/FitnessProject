import { ChangePasswordScreen } from "@screens/changePassword/ChangePasswordScreen"
import { ComponentMeta, ComponentStory } from "@storybook/react-native"

const ChangePasswordScreenMeta: ComponentMeta<typeof ChangePasswordScreen> = {
  title: "Change Password Screen",
  component: ChangePasswordScreen
}
export default ChangePasswordScreenMeta

type ChangePasswordScreenStory = ComponentStory<typeof ChangePasswordScreen>

export const Basic: ChangePasswordScreenStory = () => <ChangePasswordScreen />
