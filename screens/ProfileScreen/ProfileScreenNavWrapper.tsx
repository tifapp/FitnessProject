import { useNavigation, useRoute } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { ProfileScreenRouteProps } from "@stacks/ActivitiesStack"
import ProfileScreen from "./ProfileScreen"

export const ProfileScreenNavWrapper = () => {
  const { navigate } = useNavigation<StackNavigationProp<any>>()
  const { user }= useRoute<ProfileScreenRouteProps>().params

  return (
    <ProfileScreen user={user} />
  )
}