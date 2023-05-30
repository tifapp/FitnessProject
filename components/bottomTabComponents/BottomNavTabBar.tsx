import { TouchableIonicon } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import {
  BottomTabBarOptions,
  BottomTabBarProps
} from "@react-navigation/bottom-tabs"
import { PartialState, Route, RouteProp, getFocusedRouteNameFromRoute } from "@react-navigation/native"
import { ActivitiesScreenNames } from "@stacks/ActivitiesStack"
import React, { useEffect, useState } from "react"
import { StyleSheet, View } from "react-native"

function getIconName (routeName: string) {
  if (routeName === "Map") return "map"
  else if (routeName === "Chat Room") return "chatbox"
  else if (routeName === "Event Details") return "add-outline"
  else if (routeName === "Notifications") return "notifications"
  else return "person"
}

export const BottomNavTabBar = ({
  state,
  descriptors,
  navigation
}: BottomTabBarProps<BottomTabBarOptions>) => {
  const focusedOptions = descriptors[state.routes[state.index].key].options;
  const isVisible = focusedOptions?.tabBarVisible === true
    || focusedOptions?.tabBarVisible === undefined ? true : false

  return (
    <View style={[styles.container, {display: isVisible ? "flex" : "none"}]} >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key]
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name

        const isFocused = state.index === index

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true
          })

          if (!isFocused && !event.defaultPrevented) {
            // The `merge: true` option makes sure that the params inside the tab screen are preserved
            navigation.navigate(route.name)
          }
        }
        return (
          <TouchableIonicon
            icon={{
              name: getIconName(route.name),
              color: getIconName(route.name) === "add-outline"
                ? "white"
                : isFocused
                  ? AppStyles.darkColor
                  : AppStyles.colorOpacity35
            }}
            style={
              getIconName(route.name) === "add-outline" ? styles.plusIcon : null
            }
            activeOpacity={0.5}
            onPress={onPress}
            underlayColor={AppStyles.colorOpacity15}
          />
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    position: "absolute",
    justifyContent: "space-around",
    alignItems: "center",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: "white"
  },
  plusIcon: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
    padding: 4,
    borderRadius: 12,
    backgroundColor: AppStyles.darkColor
  }
})

export default BottomNavTabBar

/**
 * <TouchableIonicon
        icon={{ name: "person", color: AppStyles.colorOpacity35 }}
        activeOpacity={0.5}
        onPress={() => navigation.navigate("Profile Screen")}
        underlayColor={AppStyles.colorOpacity15}
      />
 */
