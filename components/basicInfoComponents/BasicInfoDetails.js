import TouchableWithModal from "@components/TouchableWithModal";
import React from "react";
import { Text, View } from "react-native";
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

export default BasicInfoDetails;
