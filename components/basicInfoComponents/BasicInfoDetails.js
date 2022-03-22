import TouchableWithModal from "@components/TouchableWithModal";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import AgePicker from "./AgePicker";
import GenderPicker from "./GenderPicker";

const BasicInfoDetails = ({ age, gender, setAge, setGender }) => {
  return (
    <TouchableWithModal
      modalComponent={
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            backgroundColor: "white",
            alignItems: "flex-end",
            marginTop: "auto",
          }}
        >
          <AgePicker selectedValue={age} setSelectedValue={setAge} />
          <GenderPicker selectedValue={gender} setSelectedValue={setGender} />
        </View>
      }
    >
      <Text
        style={{ fontSize: 16, color: "black" }}
      >{`(${age}, ${gender})`}</Text>
    </TouchableWithModal>
  );
};

const styles = StyleSheet.create({
  textBoxStyle: {
    flexDirection: "row",
    height: 35,
    marginBottom: 8,
    alignItems: "center",
    paddingRight: 10,
  },
  textInputStyle: {
    fontSize: 15,
    marginHorizontal: 10,
    height: 30,
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "gray",
  },
  emptyTextInputStyle: {
    fontSize: 15,
    marginHorizontal: 10,
    height: 30,
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "red",
  },
});

export default BasicInfoDetails;
