import API, { graphqlOperation } from "@aws-amplify/api";
import { Ionicons } from "@expo/vector-icons";
import { updateUser } from "@graphql/mutations";
import { getUser } from "@graphql/queries";
import getLocationAsync from "@hooks/useLocation";
import CheckBox from "@react-native-community/checkbox"; //when ios is supported, we'll use this
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator, Platform,
  StyleSheet,
  Text,
  TouchableOpacity
} from "react-native";

export default function LocationButton({ id }) {
  const [isLoading, setIsLoading] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(false);

  const updateUserLocationAsync = async (location) => {
    //function to send user's location to database
    //if (location == null) throw new Error();
    try {
      const user = await API.graphql(graphqlOperation(getUser, { id }));
      // @ts-ignore
      const fields = user.data.getUser;

      if (fields != null) {
        await API.graphql(
          graphqlOperation(updateUser, {
            input: {
              location: location,
            },
          })
        );
      }

      //setLocationEnabled(true);
    } catch (err) {
      console.log("error: ", err);
    }
  };

  useEffect(() => {
    (async () => {
      const user = await API.graphql(graphqlOperation(getUser, { id }));
      // @ts-ignore
      const fields = user.data.getUser;
      
      if (fields != null && fields.location != null) {
        updateLocation();
      } else {
        setIsLoading(false);
      }
    })();
  }, []);

  const updateLocation = () => {
    setIsLoading(true);
    getLocationAsync(true, async (location, error) => {
      //function call to get location from device
      console.log("LOCATION IS SET");
      try {
        if (error)
          throw error;
        await updateUserLocationAsync(location); //send location to database
        setLocationEnabled(true);
      } catch (e) {
        //alert pop up if there was an error sending the location to the database
        alert(e);
        setLocationEnabled(false);
      }
      setIsLoading(false);
    });
  };

  return (
    <TouchableOpacity
      style={[styles.rowContainerStyle, { marginBottom: 20 }]}
      onPress={() => {
        if (locationEnabled) {
          updateUserLocationAsync(null);
          setLocationEnabled(false);
        } else {
          updateLocation(); //checkbox should be enabled if the user gives permission to use their location AND location is successfully sent to database
        }
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
          name="md-checkbox-outline"
          color="blue"
        />
      ) : (
        <Ionicons
          size={16}
          style={{ marginBottom: 0 }}
          name="md-square-outline"
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
