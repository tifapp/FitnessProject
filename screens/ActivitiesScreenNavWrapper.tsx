import { useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { SafeAreaView } from "react-native-safe-area-context"
import ActivitiesScreen from "./ActivitiesScreen"

export const ActivitiesScreenNavWrapper = () => {
  /* const query = useApiQuery("/user", "GET", {})
  console.log(query) */
  const { navigate } = useNavigation<StackNavigationProp<any>>()
  return (
    <SafeAreaView>
      <ActivitiesScreen navFunction={navigate} />
    </SafeAreaView>
  )
}
