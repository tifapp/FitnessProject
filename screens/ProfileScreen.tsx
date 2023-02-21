import API, { graphqlOperation, GraphQLQuery } from "@aws-amplify/api"
import StatusPicker from "@components/basicInfoComponents/StatusPicker"
import LocationButton from "@components/LocationButton"
import ProfilePic from "@components/ProfileImagePicker"
import StatusIndicator from "@components/StatusIndicator"
import TouchableWithModal from "@components/TouchableWithModal"
import fetchProfileImageAsync from "@hooks/fetchProfileImage"
import { Status } from "@hooks/statusColors"
import { loadCapitals, saveCapitals } from "@hooks/stringConversion"
import { useNavigation, useRoute } from "@react-navigation/native"
import { Auth, Cache, Storage } from "aws-amplify"
import * as ImageManipulator from "expo-image-manipulator"
import { SaveFormat } from "expo-image-manipulator"
import React, { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native"
import { User } from "src/models"
import BasicInfoDetails from "../components/basicInfoComponents/BasicInfoDetails"
import { createUser, updateUser } from "../src/graphql/mutations"
import { getUser } from "../src/graphql/queries"

const ProfileScreen = () => {
  const [loading, setLoading] = useState<boolean>(true)
  const [imageChanged, setImageChanged] = useState<boolean>(false)
  const [imageURL, setImageURL] = useState<string>("")
  const [name, setName] = useState<string>("")
  const [identityId, setIdentityId] = useState<string>() // for new users, this will be blank
  const [age, setAge] = useState<number>(18)
  const [gender, setGender] = useState<string>("Male")
  const [status, setStatus] = useState<Status>("None")
  const [isVerified, setIsVerified] = useState<boolean>()
  const [bioDetails, setBioDetails] = useState<string>("")
  const [goalsDetails, setGoalsDetails] = useState<string>("")

  const route = useRoute()
  const navigation = useNavigation()

  useEffect(() => {
    (async () => {
      const user = await API.graphql<GraphQLQuery<{getUser: User}>>(
        graphqlOperation(getUser, { id: globalThis.myId })
      )

      const { identityId, name, status, isVerified, age, gender, bio, goals } = user.data?.getUser ?? {}

      if (identityId != null) {
        const imageURL = await fetchProfileImageAsync(identityId, true)
        setImageURL(imageURL)
        Cache.setItem(identityId, {
          lastModified: "3000",
          imageURL
        })
        global.savedUsers[globalThis.myId] = {
          name: loadCapitals(name),
          imageURL,
          status,
          isVerified: isVerified ?? false
        }

        setIdentityId(identityId)
        setName(loadCapitals(name))
        setAge(age ?? 18)
        setGender(gender ?? "")
        setBioDetails(loadCapitals(bio))
        setGoalsDetails(loadCapitals(goals))
        setStatus(status as Status)
        setIsVerified(isVerified ?? false)
      }

      setLoading(false)
    })()
  }, [])

  useEffect(() => {
    if (identityId && !loading) {
      updateUserAsync({
        age,
        gender
      }) // add a debounce on the textinput, or just when the keyboard is dismissed
    }
  }, [age, gender])

  const saveProfilePicture = async () => {
    if (imageURL != "") {
      const resizedPhoto = await ImageManipulator.manipulateAsync(
        // should be doing this in the backend. but if we can just make sure they're using the app to upload and not a third party app, maybe we wont need it?
        imageURL,
        [{ resize: { width: 300 } }], // resize to width of 300 and preserve aspect ratio
        { compress: 1, format: SaveFormat.JPEG }
      )
      const response = await fetch(resizedPhoto.uri)
      const blob = await response.blob()

      await Storage.put("profileimage.jpg", blob, {
        level: "protected",
        contentType: "image/jpeg"
      })

      global.savedUsers[globalThis.myId].imageURL = imageURL
    } else {
      Storage.remove("profileimage.jpg", { level: "protected" })
        .then((result) => console.log("removed profile image!", result))
        .catch((err) => console.log(err))
      global.savedUsers[globalThis.myId].imageURL = ""
    }
    if (identityId) {
      Cache.setItem(identityId, { lastModified: "3000", imageURL })
    }
  }

  const updateUserAsync = async (profileInfo: Partial<User>) => {
    // if user doesn't exist, make one
    try {
      let userId = identityId
      if (!identityId) {
        const { identityId } = await Auth.currentCredentials()
        userId = identityId
      }

      try {
        await API.graphql(
          graphqlOperation(!identityId ? createUser : updateUser, {
            input: { identityId: !identityId ? userId : undefined, ...profileInfo }
          })
        )
        if (!identityId) Alert.alert("Profile submitted successfully!")
      } catch (err) {
        Alert.alert("Could not submit profile! Error: ", err.errors[0].message)
      }

      return [profileInfo, globalThis.myId]
    } catch (err) {
      console.log("error: ", err)
    }
  }

  const createNewUser = () => {
    if (name == "") {
      Alert.alert("Please enter your name!")
    } else {
      Alert.alert("Submitting Profile...", "", [], { cancelable: false })
      updateUserAsync(
        {
          name: saveCapitals(name),
          age,
          gender,
          bio: saveCapitals(bioDetails),
          goals: saveCapitals(goalsDetails)
        }
      ) // add a debounce on the textinput, or just when the keyboard is dismissed
        .then(([user, id]) => {
          route.params?.setUserIdFunction(id)
        })
      setImageChanged(false)
    }
  }

  useEffect(() => {
    if (!loading) {
      saveProfilePicture(), setImageChanged(false)
    }
  }, [imageChanged])

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#26c6a2"
        style={{
          flex: 1,
          justifyContent: "center",
          flexDirection: "row",
          padding: 10
        }}
      />
    )
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
                flex: 1
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
                          padding: 0
                        }
                  ]}
                  multiline={true}
                  placeholder={"Enter your name!"}
                  autoCorrect={false}
                  value={name}
                  onChangeText={setName}
                  onEndEditing={() => {
                    if (identityId) {
                      updateUserAsync({ name: saveCapitals(name) }) // should be doing savecapitals in the backend
                      global.savedUsers[globalThis.myId].name = name
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

              {!isVerified
                ? (
                <TouchableWithModal
                  modalComponent={(hideModal) => (
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        backgroundColor: "white",
                        alignItems: "flex-end",
                        marginTop: "auto"
                      }}
                    >
                      <StatusPicker
                        selectedValue={status ?? ""}
                        setSelectedValue={(val) => {
                          if (val === "Health Professional") {
                            hideModal()
                            navigation.navigate("Verification")
                          } else if (val === "None") {
                            setStatus("None"), updateUserAsync({ status: null })
                          } else {
                            setStatus(val), updateUserAsync({ status: val })
                          }
                        }}
                      />
                    </View>
                  )}
                >
                  <StatusIndicator status={status} shouldShow={true} />
                </TouchableWithModal>
                  )
                : (
                <StatusIndicator
                  status={status}
                  isVerified={isVerified}
                  shouldShow={false}
                />
                  )}
            </View>
          </View>

          <TouchableWithModal
            style={{
              backgroundColor: "white",
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 1
              },
              shadowOpacity: 0.18,
              shadowRadius: 1.0,
              marginBottom: 20,
              marginHorizontal: 20,

              elevation: 1,
              padding: 15,
              flex: 0
            }}
            modalComponent={
              <Text
                style={{
                  fontWeight: "bold",
                  marginHorizontal: "5%",
                  marginVertical: "2%"
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
              placeholder={"Enter your biography!"}
              multiline={true}
              autoCorrect={false}
              value={bioDetails}
              onChangeText={setBioDetails}
              style={{ fontSize: 18 }}
              onEndEditing={() => {
                if (identityId) {
                  updateUserAsync({ bio: saveCapitals(bioDetails) }) // should be doing savecapitals in the backend
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
                height: 1
              },
              shadowOpacity: 0.18,
              shadowRadius: 1.0,
              marginBottom: 20,
              marginHorizontal: 20,

              elevation: 1,
              padding: 15,
              flex: 0
            }}
            modalComponent={
              <Text
                style={{
                  fontWeight: "bold",
                  marginHorizontal: "5%",
                  marginVertical: "2%"
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
              placeholder={"Enter your goals!"}
              multiline={true}
              autoCorrect={false}
              value={goalsDetails}
              onChangeText={setGoalsDetails}
              style={{ fontSize: 18 }}
              onEndEditing={() => {
                if (identityId) {
                  updateUserAsync({ goals: saveCapitals(goalsDetails) }) // should be doing savecapitals in the backend
                }
              }}
            />
          </TouchableWithModal>

          <LocationButton id={globalThis.myId} />
          {!identityId ? ( // if name is blank?
            <TouchableOpacity
              style={[styles.buttonStyle, { marginBottom: 25 }]}
              onPress={createNewUser}
            >
              <Text style={styles.buttonTextStyle}>Submit</Text>
            </TouchableOpacity>
          ) : null}
        </SafeAreaView>
      </ScrollView>
    )
  }
}

export default ProfileScreen

const styles = StyleSheet.create({
  containerStyle: {
    flex: 1,
    backgroundColor: "#fffffd"
  },
  emptyTextInputStyle: {},
  rowContainerStyle: {
    flexDirection: "row",
    justifyContent: "center"
  },
  textButtonTextStyle: {
    color: "blue",
    alignSelf: "center",
    marginBottom: 2,
    marginHorizontal: 6
  },
  buttonStyle: {
    alignSelf: "center",
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 6
  },
  buttonTextStyle: {
    color: "white",
    alignSelf: "center",
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 2,
    marginHorizontal: 6
  }
})
