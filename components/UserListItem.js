import computeDistance from "@hooks/computeDistance";
import { loadCapitals } from "@hooks/stringConversion";
import getLocation from "@hooks/useLocation";
import React from "react";
import { Text, View } from "react-native";
import { ProfileImageAndName } from "./ProfileImageAndName";

export default function UserListItem({ item, matchingname }) {
  return (
    <ProfileImageAndName
      // @ts-ignore
      textLayoutStyle={{ alignSelf: "center", flex: 1 }}
      userId={item.id}
      imageSize={60}
      textStyle={{ fontSize: 16, fontWeight: "bold" }}
      style={[
        {
          justifyContent: "flex-start",
          alignItems: "flex-start",
          marginHorizontal: 20,
          marginTop: 20,
          backgroundColor: "white",
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.18,
          shadowRadius: 1.0,

          elevation: 1,
        },
      ]}
      subtitleComponent={
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {getLocation() != null && item.latitude != null ? (
            <Text>{computeDistance([item.latitude, item.longitude])} mi.</Text>
          ) : null}
          {loadCapitals(item.bio).length > 0 ? (
            <Text
              style={{
                paddingTop: 7,
                fontSize: 12,
                marginRight: 15,
              }}
              numberOfLines={1}
            >
              {" "}
              "{loadCapitals(item.bio)}"
            </Text>
          ) : null}
        </View>
      }
    />
  );
}
