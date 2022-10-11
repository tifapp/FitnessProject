import TouchableWithModal from "@components/TouchableWithModal";
import React from "react";
import { Text, View } from "react-native";
import AgePicker from "./AgePicker";
import GenderPicker from "./GenderPicker";

interface Props {
  age: number, 
  gender: string, 
  setAge: (n:number) => void, 
  setGender: (s:string) => void
}

const BasicInfoDetails = ({ age, gender, setAge, setGender }: Props) => {
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
