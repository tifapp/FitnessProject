import { useApiQuery } from "@hooks/useApiQuery"
import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import ActivitiesScreen from "./ActivitiesScreen"

export const ActivitiesScreenNavWrapper = () => {
  const query = useApiQuery("/user", "GET", {})
  console.log(query)
  const { navigate } = useNavigation<StackNavigationProp<any>>()
  return <ActivitiesScreen navFunction={navigate} />
}
