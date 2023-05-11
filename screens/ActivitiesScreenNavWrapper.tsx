import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import ActivitiesScreen from "./ActivitiesScreen"

export const ActivitiesScreenNavWrapper = () => {
  const { navigate } = useNavigation<StackNavigationProp<any>>()
  return <ActivitiesScreen navFunction={navigate} />
}
