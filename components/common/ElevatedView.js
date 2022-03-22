import React from "react";
import { View } from "react-native";

export default function ElevatedView({ children, ...rest }) {
  return (
    <View
      style={[
        {
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.22,
          shadowRadius: 2.22,

          elevation: 3,
        },
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
