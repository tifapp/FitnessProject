import { Ionicons } from "@expo/vector-icons";
import CheckBox from "@react-native-community/checkbox"; //when ios is supported, we'll use this
import { API, Auth, Cache, graphqlOperation, Storage } from "aws-amplify";
import StatusPicker from "components/basicInfoComponents/StatusPicker";
import ProfilePic from "components/ProfileImagePicker";
import StatusIndicator from "components/StatusIndicator";
import TouchableWithModal from "components/TouchableWithModal";
import * as ImageManipulator from "expo-image-manipulator";
import fetchProfileImageAsync from "hooks/fetchProfileImage";
import { loadCapitals, saveCapitals } from "hooks/stringConversion";
import getLocation from "hooks/useLocation";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BasicInfoDetails from "../components/basicInfoComponents/BasicInfoDetails";
import { createUser, updateUser } from "../src/graphql/mutations";
import { getUser } from "../src/graphql/queries";

var styles = require("styles/stylesheet");

const ProfileScreen = ({ navigation, route }) => {
  const [loading, setLoading] = useState(true);
  const [imageChanged, setImageChanged] = useState(false);
  const [imageURL, setImageURL] = useState("");
  const [name, setName] = useState("");
  const [identityId, setIdentityId] = useState();
  const [age, setAge] = useState(18);
  const [gender, setGender] = useState("Male");
  const [status, setStatus] = useState();
  const [isVerified, setIsVerified] = useState();
  const [bioDetails, setBioDetails] = useState("");
  const [goalsDetails, setGoalsDetails] = useState("");
  const [location, setLocation] = useState();

  useEffect(() => {
    (async () => {
      console.log("user's id is ", route.params?.myId);

      const user = await API.graphql(
        graphqlOperation(getUser, { id: route.params?.myId })
      );
      const fields = user.data.getUser;

      console.log("fetched user result is ", fields);

      if (fields == null) {
        console.log(
          "user doesn't exist, they must be making their profile for the first time"
        );
      } else {
        const imageURL = await fetchProfileImageAsync(fields.identityId, true);
        setImageURL(imageURL);
        Cache.setItem(fields.identityId, {
          lastModified: "3000",
          imageURL: imageURL,
        });
        global.savedUsers[route.params?.myId] = {
          name: loadCapitals(fields.name),
          imageURL: imageURL,
          status: fields.status,
          isVerified: fields.isVerified,
        };

        setIdentityId(fields.identityId);
        setName(loadCapitals(fields.name));
        setAge(fields.age);
        setGender(fields.gender);
        setBioDetails(loadCapitals(fields.bio));
        setGoalsDetails(loadCapitals(fields.goals));
        setStatus(fields.status);
        setIsVerified(fields.isVerified);
        //setLocationEnabled(fields.latitude != null);
        if (fields.location != null) {
          updateUserLocationAsync(getLocation(true));
        }
      }

      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!route.params?.newUser && !loading) {
      updateUserAsync({
        age: age,
        gender: gender,
        bio: saveCapitals(bioDetails),
        goals: saveCapitals(goalsDetails),
        location: location,
      }); //add a debounce on the textinput, or just when the keyboard is dismissed
    }
  }, [age, gender, bioDetails, goalsDetails, location]);

  useEffect(() => {
    setLocation(getLocation(true));
  }, [global.location]);

  const saveProfilePicture = async () => {
    if (imageURL != "") {
      const resizedPhoto = await ImageManipulator.manipulateAsync(
        //should be doing this in the backend. but if we can just make sure they're using the app to upload and not a third party app, maybe we wont need it?
        imageURL,
        [{ resize: { width: 300 } }], // resize to width of 300 and preserve aspect ratio
        { compress: 1, format: "jpeg" }
      );
      const response = await fetch(resizedPhoto.uri);
      const blob = await response.blob();

      await Storage.put("profileimage.jpg", blob, {
        level: "protected",
        contentType: "image/jpeg",
      });

      console.log("changing cached profile pic");
      Cache.setItem(identityId, { lastModified: "3000", imageURL: imageURL });
      global.savedUsers[route.params?.myId].imageURL = imageURL;
    } else {
      Storage.remove("profileimage.jpg", { level: "protected" })
        .then((result) => console.log("removed profile image!", result))
        .catch((err) => console.log(err));
      Cache.setItem(identityId, { lastModified: "3000", imageURL: "" });
      global.savedUsers[route.params?.myId].imageURL = "";
    }
  };

  const updateUserAsync = async (profileInfo, isNewUser) => {
    //if user doesn't exist, make one
    try {
      if (isNewUser) {
        const { identityId } = await Auth.currentCredentials();
        profileInfo.identityId = identityId;
      }

      try {
        await API.graphql(
          graphqlOperation(isNewUser ? createUser : updateUser, {
            input: profileInfo,
          })
        );
        if (isNewUser) Alert.alert("Profile submitted successfully!");
        //console.log("updated user successfully");
      } catch (err) {
        Alert.alert("Could not submit profile! Error: ", err.errors[0].message);
        //console.log("error when updating user: ", err);
      }

      return [profileInfo, route.params?.myId];
    } catch (err) {
      console.log("error: ", err);
    }
  };

  const updateUserLocationAsync = async (location) => {
    //if user doesn't exist, make one
    try {
      const user = await API.graphql(
        graphqlOperation(getUser, { id: route.params?.myId })
      );
      const fields = user.data.getUser;
      console.log("returning users fields looks like", fields);

      const ourUser = {
        location: location,
      };

      if (fields != null) {
        await API.graphql(graphqlOperation(updateUser, { input: ourUser }));
      }
    } catch (err) {
      console.log("error: ", err);
    }
  };

  const createNewUser = () => {
    if (name == "") {
      Alert.alert("Please enter your name!");
    } else {
      Alert.alert("Submitting Profile...", "", [], { cancelable: false });
      updateUserAsync(
        {
          name: saveCapitals(name),
          age: age,
          gender: gender,
          bio: saveCapitals(bioDetails),
          goals: saveCapitals(goalsDetails),
          location: location,
        },
        true
      ) //add a debounce on the textinput, or just when the keyboard is dismissed
        .then(([user, id]) => {
          route.params?.setUserIdFunction(id);
        });
      setImageChanged(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      saveProfilePicture(), setImageChanged(false);
    }
  }, [imageChanged]);

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#26c6a2"
        style={{
          flex: 1,
          justifyContent: "center",
          flexDirection: "row",
          justifyContent: "space-around",
          padding: 10,
        }}
      />
    );
  } else {
    return (
      <ScrollView
        style={[styles.containerStyle, { backgroundColor: "#efefef" }]}
      >
        <SafeAreaView>
          <View style={{ margin: 20, flexDirection: "row" }}>
            <ProfilePic
              imageURL={imageURL}
              setImageURL={setImageURL}
              setImageChanged={setImageChanged}
            />

            <View
              style={{
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginLeft: 15,
                flex: 1,
              }}
            >
              <View>
                <TextInput
                  style={[
                    name === ""
                      ? styles.emptyTextInputStyle
                      : {
                          fontSize: 24,
                          fontWeight: "bold",
                          margin: 0,
                          padding: 0,
                        },
                  ]}
                  multiline={true}
                  placeholder={`Enter your name!`}
                  autoCorrect={false}
                  value={name}
                  onChangeText={setName}
                  onEndEditing={() => {
                    if (!route.params?.newUser) {
                      updateUserAsync({ name: saveCapitals(name) }); //should be doing savecapitals in the backend
                      global.savedUsers[route.params?.myId].name = name;
                    }
                  }}
                ></TextInput>

                <BasicInfoDetails
                  age={age}
                  setAge={setAge}
                  gender={gender}
                  setGender={setGender}
                />
              </View>

              {!isVerified ? (
                <TouchableWithModal
                  modalComponent={(hideModal) => (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        backgroundColor: "white",
                        alignItems: "flex-end",
                        marginTop: "auto",
                      }}
                    >
                      <StatusPicker
                        selectedValue={status}
                        setSelectedValue={(val) => {
                          if (val === "Health Professional") {
                            hideModal();
                            navigation.navigate("Verification");
                          } else if (val === "None") {
                            setStatus(), updateUserAsync({ status: null });
                          } else {
                            setStatus(val), updateUserAsync({ status: val });
                          }
                        }}
                      />
                    </View>
                  )}
                >
                  <StatusIndicator status={status} shouldShow={true} />
                </TouchableWithModal>
              ) : (
                <StatusIndicator status={status} isVerified={isVerified} />
              )}
            </View>
          </View>

          <TouchableWithModal
            style={{
              backgroundColor: "white",
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.18,
              shadowRadius: 1.0,
              marginBottom: 20,
              marginHorizontal: 20,

              elevation: 1,
              padding: 15,
              flex: 0,
            }}
            modalComponent={
              <Text
                style={{
                  fontWeight: "bold",
                  marginHorizontal: "5%",
                  marginVertical: "2%",
                }}
              >
                {
                  "Tell other users a little bit about yourself! Mention information such as your favorite exercises, sports, music, food, etc to connect with others!"
                }
              </Text>
            }
          >
            <Text style={{ fontSize: 18, color: "gray", marginBottom: 5 }}>
              {"Biography"}
            </Text>
            <TextInput
              placeholder={`Enter your biography!`}
              multiline={true}
              autoCorrect={false}
              value={bioDetails}
              onChangeText={setBioDetails}
              style={{ fontSize: 18 }}
              onEndEditing={() => {
                if (!route.params?.newUser) {
                  updateUserAsync({ bio: saveCapitals(bioDetails) }); //should be doing savecapitals in the backend
                }
              }}
            />
          </TouchableWithModal>

          <TouchableWithModal
            style={{
              backgroundColor: "white",
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.18,
              shadowRadius: 1.0,
              marginBottom: 20,
              marginHorizontal: 20,

              elevation: 1,
              padding: 15,
              flex: 0,
            }}
            modalComponent={
              <Text
                style={{
                  fontWeight: "bold",
                  marginHorizontal: "5%",
                  marginVertical: "2%",
                }}
              >
                {
                  "Tell other users about your goals! By mentioning your goals, you can find like-minded people to work with!"
                }
              </Text>
            }
          >
            <Text style={{ fontSize: 18, color: "gray", marginBottom: 5 }}>
              {"Goals"}
            </Text>
            <TextInput
              placeholder={`Enter your goals!`}
              multiline={true}
              autoCorrect={false}
              value={goalsDetails}
              onChangeText={setGoalsDetails}
              style={{ fontSize: 18 }}
              onEndEditing={() => {
                if (!route.params?.newUser) {
                  updateUserAsync({ goals: saveCapitals(goalsDetails) }); //should be doing savecapitals in the backend
                }
              }}
            />
          </TouchableWithModal>

          <TouchableOpacity
            style={[styles.rowContainerStyle, { marginBottom: 20 }]}
            onPress={() => {
              if (location == null) getLocation(true), setLocation("loading");
              else setLocation(null);
            }}
          >
            {location === "loading" ? (
              <ActivityIndicator
                size="small"
                color="blue"
                style={{
                  padding: 6,
                }}
              />
            ) : Platform.OS === "android" ? (
              <CheckBox disabled={true} value={location != null} />
            ) : location == null ? (
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
              {location === "loading"
                ? "Locating user"
                : "Let others see your location"}
            </Text>
          </TouchableOpacity>
          {route.params?.newUser ? ( //if name is blank?
            <TouchableOpacity
              style={[styles.buttonStyle, { marginBottom: 25 }]}
              onPress={createNewUser}
            >
              <Text style={styles.buttonTextStyle}>Submit</Text>
            </TouchableOpacity>
          ) : null}
        </SafeAreaView>
      </ScrollView>
    );
  }
};

export default ProfileScreen;
