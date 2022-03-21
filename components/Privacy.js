import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  Button,
  Image,
  View,
  TextInput,
  TouchableOpacity,
  Linking,
  ScrollView,
  Keyboard,
  Modal,
  Dimensions,
} from "react-native";
import { Entypo } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

export default function PrivacySettings({
  setPrivacy,
  privacyVal,
  modalOpen,
  setModalOpen,
}) {
  return (
    <View>
      <View style={styles.nameFormat}>
        <Text style={styles.privacyformat}>Privacy: {privacyVal}</Text>

        <Modal visible={modalOpen} animationType="slide">
          <View style={styles.exitbutton}>
            <TouchableOpacity onPress={() => setModalOpen(false)}>
              <AntDesign name="closecircle" size={50} color="black" />
            </TouchableOpacity>
          </View>
          <Picker
            selectedValue={privacyVal}
            itemStyle={{ height: 100, width: "100%" }}
            onValueChange={(itemValue, itemIndex) => setPrivacy(itemValue)}
          >
            <Picker.Item label="Public" value="Public" />
            <Picker.Item label="Private" value="Private" />
          </Picker>
        </Modal>

        <TouchableOpacity onPress={() => setModalOpen(true)}>
          <Entypo name="edit" size={15} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nameFormat: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    paddingTop: 30,
    paddingBottom: 15,
  },
  privacyformat: {
    paddingHorizontal: 8,
  },
  exitbutton: {
    marginBottom: 10,
    marginVertical: 25,
    paddingHorizontal: 8,
    paddingVertical: 15,
    borderBottomWidth: 1,
    paddingTop: 15,
    paddingBottom: 15,
  },
});
