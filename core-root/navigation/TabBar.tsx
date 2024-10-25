import { Headline } from "@components/Text"
import { TouchableIonicon } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import {
  BottomTabBarProps,
  createBottomTabNavigator
} from "@react-navigation/bottom-tabs"
import React from "react"
import { Platform, StyleSheet, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const Tab = createBottomTabNavigator()

function getIconName(routeName: string) {
  if (routeName === "Map") return "map"
  else if (routeName === "Chat Room") return "chatbox"
  else if (routeName === "Event Form") return "add-outline"
  else if (routeName === "Notifications") return "notifications"
  else return "person"
}

export const BottomNavTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index

        const onPress = () => {
          console.log(route.name)
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true
          })

          if (!isFocused && !event.defaultPrevented) {
            // The `merge: true` option makes sure that the params inside the tab screen are preserved
            if (route.name === "Profile") {
              console.log("test")
              navigation.navigate("Profile", { userID: "3432432" })
            } else {
              navigation.navigate(route.name)
            }
          }
        }
        return (
          <TouchableIonicon
            key={route.name}
            icon={{
              name: getIconName(route.name),
              color:
                getIconName(route.name) === "add-outline"
                  ? "white"
                  : isFocused
                    ? AppStyles.primaryColor
                    : AppStyles.colorOpacity35
            }}
            style={
              getIconName(route.name) === "add-outline" ? styles.plusIcon : null
            }
            onPress={onPress}
          />
        )
      })}
    </View>
  )
}

export function TabNavigation() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomNavTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Profile" component={TODO} />
    </Tab.Navigator>
  )
}

const TODO = () => (
  <View style={styles.todo}>
    <Headline>TODO: - Root</Headline>
  </View>
)

const styles = StyleSheet.create({
  todo: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center"
  },
  container: {
    flexDirection: "row",
    position: "absolute",
    justifyContent: "space-around",
    alignItems: "center",
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "android" ? 80 : 100,
    backgroundColor: "white"
  },
  plusIcon: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    padding: 4,
    borderRadius: 12,
    backgroundColor: AppStyles.primaryColor
  }
})
