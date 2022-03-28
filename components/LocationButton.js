import { Ionicons } from "@expo/vector-icons";
import getLocationAsync from "@hooks/useLocation";
import CheckBox from "@react-native-community/checkbox"; //when ios is supported, we'll use this
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

export default function LocationButton({
  locationEnabled,
  setLocationFunction,
}) {
  const [isLoading, setIsLoading] = useState(false);

  const updateLocation = () => {
    getLocationAsync(true, (location) => {
      console.log("LOCATION IS SET");
      setLocationFunction(location);
      setIsLoading(false);
    }),
      setIsLoading(true);
  };

  return (
    <TouchableOpacity
      style={[styles.rowContainerStyle, { marginBottom: 20 }]}
      onPress={() => {
        if (!locationEnabled) updateLocation();
        else setLocationFunction(null);
      }}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color="blue"
          style={{
            padding: 6,
          }}
        />
      ) : Platform.OS === "android" ? (
        <CheckBox disabled={true} value={locationEnabled} />
      ) : locationEnabled ? (
        <Ionicons
          size={16}
          style={{ marginBottom: 0 }}
          name="md-square-outline"
          color="blue"
        />
      ) : (
        <Ionicons
          size={16}
          style={{ marginBottom: 0 }}
          name="md-checkbox-outline"
          color="blue"
        />
      )}
      <Text style={styles.textButtonTextStyle}>
        {isLoading ? "Locating user" : "Let others see your location"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    backgroundColor: "#fffffd",
  },
  emptyTextInputStyle: {},
  rowContainerStyle: {
    flexDirection: "row",
    justifyContent: "center",
  },
  textButtonTextStyle: {
    color: "blue",
    alignSelf: "center",
    marginBottom: 2,
    marginHorizontal: 6,
  },
  buttonStyle: {
    alignSelf: "center",
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 6,
  },
  buttonTextStyle: {
    color: "white",
    alignSelf: "center",
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 2,
    marginHorizontal: 6,
  },
});
