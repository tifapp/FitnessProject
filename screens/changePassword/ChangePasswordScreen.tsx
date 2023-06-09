import { BodyText, Headline } from "@components/Text"
import { PrimaryButton } from "@components/common/Buttons"
import { AppStyles } from "@lib/AppColorStyle"
import React from "react"
import { StyleSheet, View } from "react-native"
import { TextField } from "./TextField"

export const ChangePasswordScreen = () => {
  return (
    <View
      style={[
        styles.flexColumn,
        styles.paddingIconSection,
        { backgroundColor: "white" }
      ]}
    >
      <View>
        <BodyText
          style={{ color: AppStyles.colorOpacity35, paddingBottom: 20 }}
        >
          Your new password should at least be 8 characters and contain at least
          1 letter, 1 number, and 1 special character.
        </BodyText>
      </View>

      <TextField
        placeholder="Current Password"
        title={"Current Password"}
        style={{ flex: 1 }}
      />

      <TextField
        placeholder="New Password"
        title={"New Password"}
        style={{ flex: 1 }}
      />

      <TextField
        placeholder="Re-enter New Password"
        title={"Re-Enter Password"}
        style={{ flex: 1 }}
      />

      <Headline style={{ color: "blue" }}> Forgot your password? </Headline>

      <View style={[styles.spacing, styles.buttons, { marginTop: "65%" }]}>
        <PrimaryButton
          style={{ flex: 1 }}
          title="Add Friend"
          onPress={() => console.log("Lesgo")}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  flexColumn: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    paddingHorizontal: 15
  },
  container: {
    backgroundColor: "white"
  },
  paddingIconSection: {
    paddingVertical: 8
  },
  buttons: {
    flexDirection: "row",
    marginTop: 20
  },
  iconSection: {
    backgroundColor: "#F4F4F6",
    borderRadius: 8,
    paddingVertical: 4,
    marginBottom: 24
  },
  iconStyling: {
    padding: 6
  },
  divider: {
    marginVertical: 8,
    width: "80%",
    height: 1,
    alignSelf: "flex-end",
    color: "#0000001A"
  },
  spacing: {
    paddingHorizontal: 16
  },
  captionLinks: {
    opacity: 1,
    fontWeight: "bold"
  },
  textColor: {
    color: AppStyles.darkColor
  }
})
