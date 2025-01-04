import { BASE_HEADER_SCREEN_OPTIONS } from "@components/Navigation"
import { withAlphaRegistration } from "@core-root/AlphaRegister"
import { HomeView } from "@core-root/Home"
import {
  StaticParamList,
  createStaticNavigation
} from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { EditEventNavigator } from "./EditEvent"
import { eventDetailsScreens } from "./EventDetails"
import { StyleSheet } from "react-native"

const HomeScreen = withAlphaRegistration(() => (
  <HomeView style={styles.screen} />
))

const Stack = createNativeStackNavigator({
  screenOptions: BASE_HEADER_SCREEN_OPTIONS,
  screens: {
    home: {
      options: { headerShown: false },
      screen: HomeScreen
    },
    ...eventDetailsScreens()
  },
  groups: {
    modals: {
      screenOptions: { presentation: "modal", headerShown: false },
      screens: { editEvent: EditEventNavigator }
    }
  }
})

const Navigation = createStaticNavigation(Stack)

const linking = { prefixes: ["tifapp://"] }

type RootStackParamList = StaticParamList<typeof Stack>

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export const RootNavigation = () => <Navigation linking={linking} />

const styles = StyleSheet.create({
  screen: { flex: 1 }
})
