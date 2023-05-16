import { TouchableIonicon } from "@components/common/Icons"
import { AppStyles } from "@lib/AppColorStyle"
import { useNavigation } from "@react-navigation/native"
import React from "react"
import { StyleSheet, View } from "react-native"

export const BottomNavTabBar = () => {
  const navigation = useNavigation()
  return (
    <View style={styles.container}>
      <TouchableIonicon icon={{ name: "map", color: AppStyles.darkColor }} />
      <TouchableIonicon
        icon={{ name: "chatbox", color: AppStyles.colorOpacity35 }}
        activeOpacity={0.5}
        underlayColor={AppStyles.colorOpacity15}
      />
      <TouchableIonicon
        style={styles.plusIcon}
        icon={{ name: "add-outline", color: "white" }}
        activeOpacity={0.5}
        underlayColor={AppStyles.colorOpacity15}
      />
      <TouchableIonicon
        icon={{ name: "notifications", color: AppStyles.colorOpacity35 }}
        activeOpacity={0.5}
        underlayColor={AppStyles.colorOpacity15}
      />
      <TouchableIonicon
        icon={{ name: "person", color: AppStyles.colorOpacity35 }}
        activeOpacity={0.5}
        onPress={() => navigation.navigate("Profile Screen")}
        underlayColor={AppStyles.colorOpacity15}
      />
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
