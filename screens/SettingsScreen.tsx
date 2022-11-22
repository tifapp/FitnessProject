import Accordion from "@components/Accordion";
import IconButton from "@components/common/IconButton";
import { deleteUser } from "@graphql/mutations";
import { useNavigation } from "@react-navigation/native";
import PrivacyScreen from "@screens/PrivacyScreen";
import { API, Auth, graphqlOperation, Storage } from "aws-amplify";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import "react-native-gesture-handler";

export default function Settings() {
  const navigation = useNavigation();

  const deleteUserAsync = async () => {
    await API.graphql(
      graphqlOperation(deleteUser, { input: { id: globalThis.myId } })
    );

    await Storage.remove("profileimage.jpg", { level: "protected" })
      .then((result) => console.log("removed profile image!", result))
      .catch((err) => console.log(err));

    const user = await Auth.currentAuthenticatedUser();

    await user.deleteUser();  //test this again: 10-17-22

    Auth.signOut();

    return "successfully deleted";
  };

  function deleteAccount() {
    const title = "Are you sure you want to delete your account?";
    const message = "";
    const options = [
      {
        text: "Yes",
        onPress: () => {
          Alert.alert(
            "Are you REALLY sure you want to delete your account?",
            "",
            [
              {
                text: "Yes",
                onPress: deleteUserAsync,
              }, //if submithandler fails user won't know
              { text: "Cancel", style: "cancel" },
            ],
            { cancelable: true }
          );
        },
      }, //if submithandler fails user won't know
      { text: "Cancel", type: "cancel" },
    ];
    Alert.alert(title, message, options, { cancelable: true });
  }

  function signOut() {
    const title = "Are you sure you want to sign out?";
    const message = "";
    Alert.alert(title, message, [
      {
        text: "Yes",
        onPress: () => {
          Auth.signOut();
        },
      }, //if submithandler fails user won't know
      { text: "Cancel", style: "cancel" },
    ], { cancelable: true });
  }

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>();

  async function changePassword() {
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      if (newPassword != confirmNewPassword) {
        throw "Passwords don't match";
      }
      await Auth.changePassword(currentUser, oldPassword, newPassword);
      Alert.alert("Password changed successfully!");
      setIsOpen(false);
    } catch (e) {
      Alert.alert(e.message ? e.message : e);
    }
  }

  return (
    <View style={{ backgroundColor: "white", flex: 1 }}>
      <PrivacyScreen />
      <TouchableOpacity
        onPress={() => {
          navigation.navigate("Block List");
        }}
      >
        <Text
          style={{
            fontSize: 18,
            margin: 20,
          }}
        >
          Block List
        </Text>
      </TouchableOpacity>
      <Accordion
        headerText={"Account Actions"} //would be nice if we had a total friend request count. but then you'd be able to see when people revoke their friend requests.
        headerTextStyle={{
          fontSize: 18,
          color: "gray",
          textDecorationLine: "none",
          marginLeft: 18,
        }}
        openTextColor={"black"}
        iconColor={"gray"}
        iconOpenColor={"black"}
      >
        <TouchableOpacity onPress={signOut}>
          <Text
            style={{
              fontSize: 15,
              margin: 20,
            }}
          >
            Log Out
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsOpen(true)}>
          <Text
            style={{
              fontSize: 15,
              margin: 20,
            }}
          >
            Change Password
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={deleteAccount}>
          <Text
            style={{
              fontSize: 15,
              margin: 20,
            }}
          >
            Delete Account
          </Text>
        </TouchableOpacity>
      </Accordion>
      <Modal
        animationType="slide"
        transparent={true}
        statusBarTranslucent={true}
        visible={isOpen}
        onRequestClose={() => {
          setIsOpen(false);
        }}
      >
        <TouchableOpacity
          onPress={() => setIsOpen(false)}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            backgroundColor: "#00000033",
          }}
        ></TouchableOpacity>
        <View
          style={{ marginTop: "auto", flex: 0.8, backgroundColor: "#efefef" }}
        >
          <View
            style={{
              height: 1,
              width: "100%",
              alignSelf: "center",
              backgroundColor: "lightgray",
            }}
          ></View>
          <View
            style={{
              margin: 10,
              width: 25,
              height: 2,
              alignSelf: "center",
              backgroundColor: "lightgray",
            }}
          ></View>
          <Text
            style={{
              fontSize: 15,
              margin: 20,
              marginBottom: 0,
            }}
          >
            Old Password
          </Text>
          <TextInput
            secureTextEntry
            textContentType="password"
            style={{ borderBottomWidth: 1, fontSize: 18, margin: 20 }}
            onChangeText={setOldPassword}
            value={oldPassword}
          />
          <Text
            style={{
              fontSize: 15,
              margin: 20,
              marginBottom: 0,
            }}
          >
            New Password (at least eight characters)
          </Text>
          <TextInput
            secureTextEntry
            textContentType="newPassword"
            style={{ borderBottomWidth: 1, fontSize: 18, margin: 20 }}
            onChangeText={setNewPassword}
            value={newPassword}
          />
          <Text
            style={{
              fontSize: 15,
              margin: 20,
              marginBottom: 0,
            }}
          >
            Confirm New Password
          </Text>
          <TextInput
            secureTextEntry
            textContentType="newPassword"
            style={{ borderBottomWidth: 1, fontSize: 18, margin: 20 }}
            onChangeText={setConfirmNewPassword}
            value={confirmNewPassword}
          />
          <IconButton
            fontSize={18}
            size={20}
            style={{ marginTop: 20, alignSelf: "center" }}
            iconName={"check"}
            onPress={changePassword}
            label="Submit"
          />
        </View>
      </Modal>
    </View>
  );
}