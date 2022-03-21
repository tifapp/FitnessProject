import { Picker } from "@react-native-picker/picker";
import React from "react";
import { View } from "react-native";

const GenderPicker = ({ selectedValue, setSelectedValue }) => {
  return (
    <View>
      <Picker
        selectedValue={selectedValue}
        itemStyle={{ width: 200 }}
        onValueChange={(itemValue, itemIndex) => setSelectedValue(itemValue)}
      >
        <Picker.Item label="Male" value="Male" />
        <Picker.Item label="Female" value="Female" />
        <Picker.Item label="Other" value="Other" />
        <Picker.Item label="Undecided" value="Undecided" />
      </Picker>
    </View>
  );
};

export default GenderPicker;
