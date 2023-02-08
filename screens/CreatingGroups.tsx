import GroupDescription from "@components/Description"
import NameField from "@components/NameField"
import PrivacySettings from "@components/Privacy"
import SportCreation from "@components/Sport"
import { createGroup, updateGroup } from "@graphql/mutations"
import { useNavigation, useRoute } from "@react-navigation/native"
import { CreateGroupScreenRouteProps } from "@stacks/MainStack"
// Get the aws resources configuration parameters
import { API, graphqlOperation } from "aws-amplify"
import React, { useEffect, useState } from "react"
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native"
import { Group } from "src/models"

export default function CreatingGroups () {
  const [nameVal, setName] = useState("")
  const [privacyVal, setPrivacy] = useState("Public")
  // const [totalUsersVal, setTotalUsers] = useState("");
  const [sportVal, setSport] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [descriptionVal, setDescription] = useState("")
  const [characterCount, setCharacterCount] = useState(1000)

  const navigation = useNavigation()
  const { checkFields, group } = useRoute<CreateGroupScreenRouteProps>().params

  useEffect(() => {
    if (checkFields !== undefined) {
      setFields()
    }
  }, [])

  const setFields = () => {
    setName(group.name)
    setPrivacy(group.Privacy)
    // setTotalUsers(group.maxUsers)
    setSport(group.Sport)
    setDescription(group.Description)
  }

  const addGroup = async () => {
    Alert.alert("Submitting Group...", "", [], { cancelable: false })

    const val = {
      userID: globalThis.myId,
      name: nameVal,
      // maxUsers: totalUsersVal,
      Privacy: privacyVal,
      Sport: sportVal,
      Description: descriptionVal
    }

    setDescription("")
    setName("")
    setPrivacy("Public")
    // setTotalUsers("");
    setSport("")
    setDescription("")

    try {
      await API.graphql(graphqlOperation(createGroup, { input: val }))
      console.log("success")
      Alert.alert("Group submitted successfully!")
    } catch (err) {
      console.log(err)
      Alert.alert("Group could not be submitted! " + err.errors[0].message)
    }
  }

  const updtGroup = async () => {
    Alert.alert("Updating Group...", "", [], { cancelable: false })

    setDescription("")
    setName("")
    setPrivacy("Public")
    // setTotalUsers("");
    setSport("")

    try {
      const updatedGroup: Omit<Group, "userID"> = {
        id: group.id,
        name: nameVal,
        Privacy: privacyVal,
        Sport: sportVal,
        Description: descriptionVal
      }
      await API.graphql(graphqlOperation(updateGroup, { input: updatedGroup }))
      console.log("success")
      Alert.alert("Group submitted successfully!")
      navigation.navigate("Search", {
        updatedGroup: { ...updatedGroup, userID: globalThis.myId }
      })
      navigation.navigate("Group Posts Screen", {
        group: { ...updatedGroup, userID: globalThis.myId }
      })
    } catch (err) {
      console.log(err)
      Alert.alert("Group could not be submitted! " + err.errors[0].message)
    }
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <View>
        <View style={styles.border}>
          <NameField setName={setName} nameVal={nameVal} />
          <PrivacySettings // need a generic modal picker component with multiple optional rows and stylable
            setPrivacy={setPrivacy}
            privacyVal={privacyVal}
            modalOpen={modalOpen}
            setModalOpen={setModalOpen}
          />

          <SportCreation setSport={setSport} sportVal={sportVal} />

          <GroupDescription
            setDescription={setDescription}
            descriptionVal={descriptionVal}
            characterCount={characterCount}
          />

          <View style={styles.buttonFormat}>
            <TouchableOpacity
              onPress={() => {
                nameVal != "" &&
                privacyVal != "" &&
                sportVal != "" &&
                descriptionVal != "" &&
                descriptionVal.length <= characterCount
                  ? checkFields !== undefined
                    ? updtGroup()
                    : addGroup()
                  : Alert.alert("Please fill out all available fields")
              }}
              style={styles.submitButton}
            >
              {checkFields !== undefined
                ? (
                <Text style={styles.buttonTextStyle}>Save</Text>
                  )
                : (
                <Text style={styles.buttonTextStyle}>Submit</Text>
                  )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  border: {
    alignItems: "center"
  },
  submitButton: {
    alignSelf: "center",
    backgroundColor: "orange",
    padding: 10,
    borderRadius: 5
  },
  buttonTextStyle: {
    color: "white",
    alignSelf: "center",
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 2,
    marginHorizontal: 6
  },
  buttonFormat: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingTop: 30,
    paddingBottom: 15
  }
})
